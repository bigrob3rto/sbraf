import { Injectable, isDevMode } from '@angular/core';
import { LZStringService } from 'ng-lz-string';
import { Order } from '../prod-table/order/order-table.component';
import { AwsService } from './aws.service';

// compare, find minimum
function strMin(a, b) {
    return a <= b ? a : b;
}

// compare, find maximum
function strMax(a, b) {
    return a >= b ? a : b;
}

// check if n is in range(a,b)
function between(n, a, b) {
    const res = (n >= a) && (n <= b);
    return res;
}

// check if 2 ranges overlap
function overlap(d1, d2, n1, n2) {
    const cond1 = between(d1, n1, n2);
    const cond2 = between(d2, n1, n2);
    const cond3 = (n1 >= d1 && n2 <= d2);
    return cond1 || cond2 || cond3;
}


@Injectable({
    providedIn: 'root',
})

export class OrderCacheService {
    // private orders : Order[] = [];
    private key = 'order';
    private storeArr: String[] = [];

    constructor(private lz: LZStringService) { }

    private stores: Map<number, string> = new Map();
    /*****************************************************
     * Store Factory
     */
    getKey(): string {
        const structureID = this.getStrId();
        structureID ? null : console.error("OrderService StructureId undefined");
        
        if (this.stores.has(structureID))
            return this.stores.get(structureID);

        // create new
        this.stores.set(structureID, "order_" + structureID);
    }


    private getStrId(): number {
        if (sessionStorage.length == 0 || sessionStorage.getItem('store') == undefined)  // array empty
            return undefined;
        return JSON.parse(sessionStorage.getItem('store')).id;
    }

    /*************************************************************
     *   Cache update
     * Check if new values are in cache
     * if not, then update cache with new values
     * Preserve old values
     * 
     * return updated array from cache
     * */
    add(value, start, stop): Order[] {

        // get key of current structure
        const key = this.getKey();
        // get saved order image
        let order_img = JSON.parse(sessionStorage.getItem(key));
        let result: Order[];

        // if image already in cache, then update
        if (order_img && overlap(order_img.start, order_img.stop, start, stop)) {

            // get image content
            let cache_orders = JSON.parse(this.lz.decompress(order_img.value));
            // map to order ID array
            const orderIDs = cache_orders.map(o => o.item_order_id);

            // if a new order is not included, then concatenate
            value.forEach(order => {
                if (!orderIDs.includes(order.item_order_id))
                    cache_orders = cache_orders.concat(order);
            });
            /***** IMAGE ************ */
            order_img = {
                start: strMin(start, order_img.start),       // extend
                stop: strMax(stop, order_img.stop),          // extend
                value: this.lz.compress(JSON.stringify(cache_orders))
            }
            // return new array
            result = cache_orders;
        }
        else {
            /***** IMAGE ************ */
            order_img = {
                start: start,
                stop: stop,
                value: this.lz.compress(JSON.stringify(value))
            }
            result = value;
        }
        sessionStorage.setItem(key, JSON.stringify(order_img));
        console.log("Cache update " + order_img.start + " " + order_img.stop);
        return result;
    }

    /**************************** 
     * Get values from cache
     * Select by start,stop range
     * without arguments, return whole cache
    */
    get(start?, stop?): any {
        // get key of current structure
        const key = this.getKey();
        // load image
        const order_img = JSON.parse(sessionStorage.getItem(key));
        //load orders
        const orders = JSON.parse(this.lz.decompress(order_img.value));

        if (!start || !stop) {
            console.log("Served from cache " + orders.length + " orders.");
            return orders;
        }

        // filter upn request
        const ret_orders = orders.filter(o => (
            o.item_timestamp.substring(0, 10) >= start && o.item_timestamp.substring(0, 10) <= stop)
        );

        console.log("Served from cache " + ret_orders.length + " orders.");
        return ret_orders;
    }

    /*************************************** 
     * clear cache
    */
    invalidate() {
        // get key of current structure
        const key = this.getKey();
        sessionStorage.removeItem(key);

    }

    /*************************************************
     * Check if new request can be served by cache
     * If cache should be extended, suggest new start,stop range
     * 
     * return value = true if can be served by cache
     */
    match(start, stop) {
        // get key of current structure
        const key = this.getKey();
        // default assignment
        let check = {
            start: null,
            stop: null,
            value: false
        }


        // load image
        // if cache empty, request cannot be served by cache
        const order_img = JSON.parse(sessionStorage.getItem(key));
        if (!order_img)   // check if exist
            return check;

        // if ranges do not overlap, request cannot be served by cache
        check.value = overlap(order_img.start, order_img.stop, start, stop);
        if (!check.value)   // check if exist
            return check;

        // check if low limit can be extended
        // suggest new range
        // return false - request cannot be served by cache
        if (start < order_img.start)
            check = {
                start: start,
                stop: order_img.start,
                value: false
            }

        // check if high limit can be extended
        // suggest new range
        // return false - request cannot be served by cache
        if (stop > order_img.stop)
            check = {
                start: order_img.stop,
                stop: stop,
                value: false
            }

        // check if both limits can be extended
        // suggest new range
        // return false - request cannot be served by cache
        if (start < order_img.start && stop > order_img.stop) {
            check = {
                start: start,
                stop: stop,
                value: false
            }
        }

        // check if both limits are ok
        // request range is ok
        // return true - request CAN be served by cache
        if (start >= order_img.start && stop <= order_img.stop) {
            check = {
                start: start,
                stop: stop,
                value: true
            }
        }

        return check;
    }

    /**************************** 
     * Get info from cache
    */
    info(): any {
        // get key of current structure
        const key = this.getKey();
        return JSON.parse(sessionStorage.getItem(key));
    }
}