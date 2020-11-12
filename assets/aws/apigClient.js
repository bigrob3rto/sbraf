/*
 * Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

var apigClientFactory = {};
apigClientFactory.newClient = function (config) {
    var apigClient = {};
    if (config === undefined) {
        config = {
            accessKey: '',
            secretKey: '',
            sessionToken: '',
            region: 'eu-central-1',
            apiKey: undefined,
            defaultContentType: 'application/json',
            defaultAcceptType: 'application/json'
        };
    }
    if (config.accessKey === undefined) {
        config.accessKey = '';
    }
    if (config.secretKey === undefined) {
        config.secretKey = '';
    }
    if (config.apiKey === undefined) {
        config.apiKey = '';
    }
    if (config.sessionToken === undefined) {
        config.sessionToken = '';
    }
    if (config.region === undefined) {
        config.region = 'us-east-1';
    }
    //If defaultContentType is not defined then default to application/json
    if (config.defaultContentType === undefined) {
        config.defaultContentType = 'application/json';
    }
    //If defaultAcceptType is not defined then default to application/json
    if (config.defaultAcceptType === undefined) {
        config.defaultAcceptType = 'application/json';
    }


    // extract endpoint and path from url
    var invokeUrl = 'https://gxolof8v73.execute-api.eu-central-1.amazonaws.com/dev';
    var endpoint = /(^https?:\/\/[^\/]+)/g.exec(invokeUrl)[1];
    var pathComponent = invokeUrl.substring(endpoint.length);

    var sigV4ClientConfig = {
        accessKey: config.accessKey,
        secretKey: config.secretKey,
        sessionToken: config.sessionToken,
        serviceName: 'execute-api',
        region: config.region,
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var authType = 'NONE';
    if (sigV4ClientConfig.accessKey !== undefined && sigV4ClientConfig.accessKey !== '' && sigV4ClientConfig.secretKey !== undefined && sigV4ClientConfig.secretKey !== '') {
        authType = 'AWS_IAM';
    }

    var simpleHttpClientConfig = {
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var apiGatewayClient = apiGateway.core.apiGatewayClientFactory.newClient(simpleHttpClientConfig, sigV4ClientConfig);



    /******************************************************************************
     *  get Structures
     */
    apigClient.structuresAdmin = function (params, body, additionalParams) {
        if (additionalParams === undefined) { additionalParams = {}; }


        var structuresAdminGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/structures/admin').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };

        structuresAdminGetRequest.headers["Authorization"] = sessionStorage.getItem("awstkn");
        structuresAdminGetRequest.headers["Content-Type"] = "application/json";
        // structuresAdminGetRequest.headers["Access-Control-Allow-Origin"] =  "http://localhost:4200";

        console.debug("Header", structuresAdminGetRequest.headers);

        return apiGatewayClient.makeRequest(structuresAdminGetRequest, authType, additionalParams, config.apiKey);
    };


    apigClient.structuresAdminGet = function (params, body, additionalParams) {
        if (additionalParams === undefined) { additionalParams = {}; }

        apiGateway.core.utils.assertParametersDefined(params, ['structureid'], ['body']);

        var structuresAdminGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/structures/admin').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['structureid']),
            body: body
        };

        structuresAdminGetRequest.headers["Authorization"] = sessionStorage.getItem("awstkn");
        structuresAdminGetRequest.headers["Content-Type"] = "application/json";

        console.debug("Header", structuresAdminGetRequest.headers);

        return apiGatewayClient.makeRequest(structuresAdminGetRequest, authType, additionalParams, config.apiKey);
    };


    apigClient.structuresAnalistGet = function (params, body, additionalParams) {
        if (additionalParams === undefined) { additionalParams = {}; }

        apiGateway.core.utils.assertParametersDefined(params, ['structureid'], ['body']);

        var structuresAnalistGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/structures/analist').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['structureid']),
            body: body
        };


        return apiGatewayClient.makeRequest(structuresAnalistGetRequest, authType, additionalParams, config.apiKey);
    };


    apigClient.structuresMenu = function (params, body, additionalParams) {
        if (additionalParams === undefined) { additionalParams = {}; }

        apiGateway.core.utils.assertParametersDefined(params, ['structureid'], ['body']);
        var structuresMenuGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/structures/menu').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['structureid']),
            body: body
        };

        structuresMenuGetRequest.headers["Authorization"] = sessionStorage.getItem("awstkn");
        structuresMenuGetRequest.headers["Content-Type"] = "application/json";

        return apiGatewayClient.makeRequest(structuresMenuGetRequest, authType, additionalParams, config.apiKey);
    };


    apigClient.structureProductsGet = function (params, body, additionalParams) {
        if (additionalParams === undefined) { additionalParams = {}; }

        apiGateway.core.utils.assertParametersDefined(params, ['structureid'], ['body']);
        var structureProductsGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/structures/product').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['structureid']),
            body: body
        };

        structureProductsGetRequest.headers["Authorization"] = sessionStorage.getItem("awstkn");
        structureProductsGetRequest.headers["Content-Type"] = "application/json";

        return apiGatewayClient.makeRequest(structureProductsGetRequest, authType, additionalParams, config.apiKey);
    };


    apigClient.structuresMenuGet = function (params, body, additionalParams) {
        if (additionalParams === undefined) { additionalParams = {}; }

        apiGateway.core.utils.assertParametersDefined(params, ['structureid', 'menuid'], ['body']);

        var structuresMenuGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/structures/menu').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['structureid', 'menuid']),
            body: body
        };


        return apiGatewayClient.makeRequest(structuresMenuGetRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.structuresEngineeringInfoGet = function (params, body, additionalParams) {
        if (additionalParams === undefined) { additionalParams = {}; }

        apiGateway.core.utils.assertParametersDefined(params, ['structureid'], ['body']);

        var structuresMenuEngineeringGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/structures/menu/engineering').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['structureid', 'start', 'stop']),
            body: body
        };

        structuresMenuEngineeringGetRequest.headers["Authorization"] = sessionStorage.getItem("awstkn");
        structuresMenuEngineeringGetRequest.headers["Content-Type"] = "application/json";


        return apiGatewayClient.makeRequest(structuresMenuEngineeringGetRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.structuresMenuForecastGet = function (params, body, additionalParams) {
        if (additionalParams === undefined) { additionalParams = {}; }

        apiGateway.core.utils.assertParametersDefined(params, ['menuid', 'start', 'forecastid', 'stop', 'structureid'], ['body']);

        var structuresMenuForecastGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/structures/menu/forecast').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['menuid', 'start', 'forecastid', 'stop', 'structureid']),
            body: body
        };


        return apiGatewayClient.makeRequest(structuresMenuForecastGetRequest, authType, additionalParams, config.apiKey);
    };


    /***********************************************************************************************
     * get orders from AWS / DB
     */
    apigClient.structuresForecastInfoGet = function (params, gzip) {
        // if(additionalParams === undefined) { additionalParams = {}; }
        additionalParams = {};

        apiGateway.core.utils.assertParametersDefined(params, ['structureid'], ['body']);

        var structuresMenuForecastGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/structures/menu/forecast').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            // queryParams: apiGateway.core.utils.parseParametersToObject(params, ['menuid','start','stop', 'structureid']),
            // queryParams: apiGateway.core.utils.parseParametersToObject(params, ['structureid']),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['start', 'stop', 'structureid', 'offset', 'limit']),
            body: ""
        };

        structuresMenuForecastGetRequest.headers["Authorization"] = sessionStorage.getItem("awstkn");
        structuresMenuForecastGetRequest.headers["Content-Type"] = "application/json";
        // if (gzip)
        //     structuresMenuForecastGetRequest.headers["Accept-Encoding"] = "gzip";

        return apiGatewayClient.makeRequest(structuresMenuForecastGetRequest, authType, additionalParams, config.apiKey);
    };



    apigClient.old_structuresForecastInfoGet = function (params, body, additionalParams) {
        if (additionalParams === undefined) { additionalParams = {}; }

        apiGateway.core.utils.assertParametersDefined(params, ['structureid'], ['body']);

        var structuresMenuForecastGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/structures/menu/forecast').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            // queryParams: apiGateway.core.utils.parseParametersToObject(params, ['menuid','start','stop', 'structureid']),
            // queryParams: apiGateway.core.utils.parseParametersToObject(params, ['structureid']),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['start', 'stop', 'structureid', 'offset', 'limit']),
            body: body
        };

        structuresMenuForecastGetRequest.headers["Authorization"] = sessionStorage.getItem("awstkn");
        structuresMenuForecastGetRequest.headers["Content-Type"] = "application/json";


        return apiGatewayClient.makeRequest(structuresMenuForecastGetRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.structuresMenuProduct = function (params, body, additionalParams) {
        if (additionalParams === undefined) { additionalParams = {}; }

        var structuresMenuProductGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/structures/product').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };


        return apiGatewayClient.makeRequest(structuresMenuProductGetRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.structuresMenuProductGet = function (params, body, additionalParams) {
        if (additionalParams === undefined) { additionalParams = {}; }

        apiGateway.core.utils.assertParametersDefined(params, ['productid'], ['body']);

        var structuresMenuProductGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/structures/product').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['productid']),
            body: body
        };


        return apiGatewayClient.makeRequest(structuresMenuProductGetRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.structuresMenuRevpashGet = function (params, body, additionalParams) {
        if (additionalParams === undefined) { additionalParams = {}; }

        apiGateway.core.utils.assertParametersDefined(params, ['menuid'], ['body']);
        var structureProductsGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/structures/menu/revpash').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['menuid']),
            body: body
        };

        structureProductsGetRequest.headers["Authorization"] = sessionStorage.getItem("awstkn");
        structureProductsGetRequest.headers["Content-Type"] = "application/json";

        return apiGatewayClient.makeRequest(structureProductsGetRequest, authType, additionalParams, config.apiKey);
    };


    /*****************************************************************************************
     * 
     */
    apigClient.structuresAdminPost = function (params, body, additionalParams) {
        if (additionalParams === undefined) { additionalParams = {}; }

        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);

        var structuresAdminPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/structures/admin').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };

        structuresAdminPostRequest.headers["Authorization"] = sessionStorage.getItem("awstkn");
        structuresAdminPostRequest.headers["Content-Type"] = "application/json";

        // console.log("structuresAdminPostRequest",structuresAdminPostRequest);

        return apiGatewayClient.makeRequest(structuresAdminPostRequest, authType, additionalParams, config.apiKey);
    };

    /*******************************************************************************************
     * delete request
     */
    apigClient.structuresAdminDelete = function (params, body, additionalParams) {
        if (additionalParams === undefined) { additionalParams = {}; }

        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);

        var structuresAdminPostRequest = {
            verb: 'delete'.toUpperCase(),   // DELETE request
            path: pathComponent + uritemplate('/structures/admin').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };

        structuresAdminPostRequest.headers["Authorization"] = sessionStorage.getItem("awstkn");
        structuresAdminPostRequest.headers["Content-Type"] = "application/json";
        // structuresAdminPostRequest.headers["Access-Control-Allow-Methods"] =  "GET, POST, OPTIONS, PUT, DELETE";

        // console.log("structuresAdminPostRequest",structuresAdminPostRequest);

        return apiGatewayClient.makeRequest(structuresAdminPostRequest, authType, additionalParams, config.apiKey);
    }

    return apigClient;
};
