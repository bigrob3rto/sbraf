import { Injectable } from '@angular/core';
import * as AWSCognito from '@aws-amplify/auth/node_modules/amazon-cognito-identity-js/dist/amazon-cognito-identity';
// import * as AWS from 'aws-sdk/global';
let AWS = require('aws-sdk');


let cognitoISP = new AWS.CognitoIdentityServiceProvider({ region: 'eu-central-1' });

// reference to aws sdk
// var AWS = require('aws-sdk/dist/aws-sdk-react-native');

@Injectable({
  providedIn: 'root'
})
export class CognitoServiceProvider {


  //m3m3t3c0_81
  SYSTEM_PARAMS: any = {
    REGION: 'eu-central-1',
    COGNITO_POOL: {
      UserPoolId: 'eu-central-1_qwtSnbNGm',
      ClientId: '1qiiabao5ce1s8k74lissr2b6h',   // unique ID
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
    }
  };

  _USER_POOL = new AWSCognito.CognitoUserPool(this.SYSTEM_PARAMS.COGNITO_POOL);


  updateUserAttribute(name, value) {
    return new Promise((resolve, reject) => {
      let params = {
        UserAttributes: [
          {
            Name: name,     // name of attribute
            Value: value    // the new attribute value
          }
        ],
        UserPoolId: this.SYSTEM_PARAMS.COGNITO_POOL.UserPoolId,
        Username: this._USER_POOL.getCurrentUser().getUsername(),
      };

      cognitoISP.adminUpdateUserAttributes(params, (err, data) => err ? reject(err) : resolve(data));
    });
  }

  /********************************************* */
  authenticate(username, password) {
    return new Promise((resolved, reject) => {
      const authDetails = new AWSCognito.AuthenticationDetails({
        Username: username,
        Password: password
      });

      const cognitoUser = new AWSCognito.CognitoUser({
        Username: username,
        Pool: this._USER_POOL,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: result => {
          resolved(result.getAccessToken().getJwtToken());
          const awstkn = result.getIdToken().getJwtToken();

          sessionStorage.setItem('awstkn', awstkn);

          // get user data
          cognitoUser.getUserAttributes(function (err, result) {
            if (err) {
              alert(err.message || JSON.stringify(err));
              return;
            }
            for (var i = 0; i < result.length; i++) {
              // save phone number
              if (result[i].getName() == 'phone_number')
                sessionStorage.setItem('user_phone_number', result[i].getValue());
              // save email
              if (result[i].getName() == 'email')
                sessionStorage.setItem('user_email', result[i].getValue());
            }
          });

          cognitoUser.getSession(function (err, result) {
            if (result) {
              console.log('You are now logged in.');

              // Add the User's Id Token to the Cognito credentials login map.
              AWS.config.region = 'eu-central-1'; // Region
              AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: 'eu-central-1:9588e579-4080-4f5a-a524-66c83500466f', //skipthedishes
                Logins: {
                  'cognito-idp.eu-central-1.amazonaws.com/eu-central-1_qwtSnbNGm': awstkn
                }
              });

              // clear cache
              AWS.config.credentials.clearCachedId();

              // get credentials
              AWS.config.credentials.get(function (err) {
                if (err) {
                  alert(err);
                }
                else {
                  // console.log('AWS Credentials', AWS.config.credentials);
                  // store all credentials in session storage
                  // alert(AWS.config.credentials.accessKeyId);
                  sessionStorage.setItem('accessKeyId', AWS.config.credentials.accessKeyId);
                  sessionStorage.setItem('secretAccessKey', AWS.config.credentials.secretAccessKey);
                  sessionStorage.setItem('sessionToken', AWS.config.credentials.sessionToken);
                  
                }
              });


            }
          });

        },
        onFailure: err => {
          reject(err);
        },
        newPasswordRequired: userAttributes => {
          // User was signed up by an admin and must provide new
          // password and required attributes, if any, to complete
          // authentication.

          // the api doesn't accept this field back
          userAttributes.username = username;
          delete userAttributes.email_verified;

          /*cognitoUser.completeNewPasswordChallenge(password, userAttributes, {
            onSuccess: function(result) {},
            onFailure: function(error) {
              reject(error);
            }
          });*/
        }
      });
    });
  }


  /********************************************** */
  signUp(username, password) {
    return new Promise((resolved, reject) => {
      let userAttribute = [];
      userAttribute.push(
        new AWSCognito.CognitoUserAttribute({
          Name: 'username',
          Value: username
        })
      );

      this._USER_POOL.signUp(username, password, userAttribute, null, function (
        err,
        result
      ) {
        if (err) {
          reject(err);
        } else {
          resolved(result);
        }
      });
    });
  }

  confirmUser(verificationCode, userName) {
    return new Promise((resolved, reject) => {
      const cognitoUser = new AWSCognito.CognitoUser({
        Username: userName,
        Pool: this._USER_POOL
      });

      cognitoUser.confirmRegistration(verificationCode, true, function (
        err,
        result
      ) {
        if (err) {
          reject(err);
        } else {
          resolved(result);
        }
      });
    });
  }



  logout() {
    // AccountMgr.logout(this._USER_POOL.getCurrentUser());

    var cognitoUser = this._USER_POOL.getCurrentUser();
    if (cognitoUser != null)
      cognitoUser.signOut();

  }

  getUserName(): string {
    var cognitoUser = this._USER_POOL.getCurrentUser();
    if (cognitoUser != null)
      return cognitoUser.getUsername();
  }


  // getExpiration
  isUserLogged(): boolean {
    const cognitoUser = this._USER_POOL.getCurrentUser();

    let isSessionValid = true;
    if (cognitoUser == null)  // user not logged
      return false;

    if (!sessionStorage.getItem('awstkn'))
      return false;     // token not in memory

    cognitoUser.getSession(function (err, session) {
      if (err) {
        isSessionValid = false;   // session not valid
      }
      // check token expired
      const exp_time = session.getAccessToken().getExpiration();
      const now = new Date().getTime() / 1000;
      if (now > exp_time)
        isSessionValid = false;
      // console.log("Session", session);
    });

    return isSessionValid;
  };

}