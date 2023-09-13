import { Injectable } from '@angular/core';
import Sockette from "sockette";
import { Signer } from "aws-amplify"
import { MessageService } from './message.service';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class SocketService {
    private ws;

    // Constructor 
    constructor(private messageService: MessageService) {
    }

    // item notification -  send selectedStructure change to all interested components
    // private messageSource1 = new BehaviorSubject(null);
    private messageSource1 = new Subject<any>();
    public channel = this.messageSource1.asObservable();

    notify(value: string) {
        this.messageSource1.next(value)
    }

    // complete(value: string) {
    //     this.messageSource1.next(value);
    //     this.messageSource1.complete();
    // }

    async init() {

        const accessInfo = {
            access_key: sessionStorage.getItem('accessKeyId'),
            secret_key: sessionStorage.getItem('secretAccessKey'),
            session_token: sessionStorage.getItem('sessionToken'),
        }

        const wssUrl = "wss://anmm4h0sa8.execute-api.eu-central-1.amazonaws.com/dev";

        const signedUrl = Signer.signUrl(wssUrl, accessInfo);

         return new Promise(async (resolve, reject) => {


            //Init WebSockets with Cognito Access Token
            this.ws = new Sockette(signedUrl,
                {
                    timeout: 5e3,
                    maxAttempts: 0,
                    onopen: e => {
                        // console.log("connected:", e);
                        // this.messageService.show("WebSocket Notification connected.", 'warning', 10000)
                        this.notify("WebSocket Notification connected.");
                        resolve("connected");
                    },
                    onmessage: e => {
                        // console.log("Webbsocket:", e);
                        // this.messageService.show("Notification: " + e.data, 'warning', 10000);
                        // console.log("Notification: " + e.data);
                        this.notify(e.data);
                        // close websocket after receving message
                        this.ws.close(); // graceful shutdown
                    },
                    onreconnect: e => console.log("Reconnecting...", e),
                    onmaximum: e => console.log("Stop Attempting!", e),
                    onclose: e => {
                        // console.log("Closed!", e)
                        // this.messageService.show("WebSocket closed.", 'warning');
                        this.notify("WebSocket closed.");
                    },
                    onerror: e => {
                        // console.log("Error:", e);
                        this.notify("Error:" + e);
                    }
                }
            );
        });

    }

    subscribeLambda() {
        //subscribe to OK notifications
        this.ws.json({
            action: "subscribe",
            topic: "LambdaOKNotificationTopic"
        });
        //subscribe to ERROR notifications
        this.ws.json({
            action: "subscribe",
            topic: "LambdaErrorsNotificationTopic"
        });

    }


    // send message through open socket
    send(message?) {
        this.ws.send(message);
    }
}