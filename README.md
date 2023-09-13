# sbraf

# TensorFlow

to install tensorflow.js run:

npm install --save @tensorflow/tfjs @tensorflow/tfjs-vis
to import to your *.ts file do:

import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

Workaround is to delete preact.d.ts in node_modules/preact/dist and node_modules/preact/src
add this to package.json:

"scripts": {
    "postinstall": "rimraf node_modules/preact/*/preact.d.ts"
}

install seedrandom (reqiured by tfjs)
npm i seedrandom --save

# notify
npm i --save bootstrap-notify

Modify angular.json by adding:
"architect": {
        "build": {
            ...
              "node_modules/bootstrap-notify/bootstrap-notify.js"
            ...
            
 "test": {
     ...
      "scripts": [
          ...
              "node_modules/bootstrap-notify/bootstrap-notify.js"

# crypto
https://www.code-sample.com/2018/12/angular-7-cryptojs-encrypt-decrypt.html
`npm install crypto-js --save`
`npm install @types/crypto-js --save`

Add the script path in “angular.json” file.
"scripts": [
              ...
              "node_modules/crypto-js/crypto-js.js"
            ]

# compodoc
Generate documentation with
`npx compodoc -p tsconfig.json`

# Websocket
`npm install --save sockette`

# File saver
Saves a blob as a file
`npm i file-saver`

# AWS Amplify
Needed Signature v4 for AWS IAM authorization - websocket
`npm i aws-amplify --save`

# GUIDED Tour (Intro.js)
Introduce users to your product
`npm install intro.js @types/intro.js --save`

Add to angular.json
            "styles": [
              "src/styles.css",
              "node_modules/intro.js/introjs.css"
            ],
            "scripts": [
              "node_modules/intro.js/intro.js"
            ],