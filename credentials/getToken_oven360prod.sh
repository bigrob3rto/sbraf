#!/bin/bash
aws cognito-idp admin-initiate-auth --cli-input-json file://creds_oven360prod.json | grep IdToken
