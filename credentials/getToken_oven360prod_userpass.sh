#!/bin/sh
aws cognito-idp initiate-auth --cli-input-json file://creds_oven360prod_userpass.json --profile default

aws cognito-identity get-id --identity-pool-id "eu-central-1:9588e579-4080-4f5a-a524-66c83500466f" --logins "{\"cognito-idp.eu-central-1.amazonaws.com/eu-central-1_qwtSnbNGm\": \"eyJraWQiOiJmbUVIXC84NzNWT0RJRUE2QXpTbEx5VnFXaE9BYlFXQ3lpSGRIeEgrZjd4UT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhNWJmMTY3Ny1mNzRmLTQ2YTMtODc3Yy04Mzg3NDUyNDU3MjAiLCJjb2duaXRvOmdyb3VwcyI6WyJhZG1pbiJdLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9ldS1jZW50cmFsLTFfcXd0U25iTkdtIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjp0cnVlLCJjb2duaXRvOnVzZXJuYW1lIjoib3ZlbjM2MHByb2QiLCJjb2duaXRvOnJvbGVzIjpbImFybjphd3M6aWFtOjo3MDc1NzIzNTQ2ODQ6cm9sZVwvQ29nbml0b0F1dGhBcGlnd0FkbWluSW5mb1JvbGUiXSwiYXVkIjoiMXFpaWFiYW81Y2UxczhrNzRsaXNzcjJiNmgiLCJldmVudF9pZCI6ImY0OTE3M2NiLWYyNzYtNDliOC05N2U1LTJiODg3ZjNlMzBiYiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjIzNzA5NDMxLCJwaG9uZV9udW1iZXIiOiIrMzkzMjA2MDMyMzUyIiwiZXhwIjoxNjIzNzEzMDMxLCJpYXQiOjE2MjM3MDk0MzEsImVtYWlsIjoiZmFyaWNjaUBnbWFpbC5jb20ifQ.fYlsrixcPVyNWkWvk5Js_kFruM6awH8HAdwY9UXNmHLag-tODsN9Wg5rXsxUBU37YsR17lcvf-XUAPtHpDaEF4QIUE4UkhZBO6odWhKKRHU5lgpvm0ekZOhJadCjr8y7MWp2FX2XCaL-uDRxtaK_gbKq1klK7-5anb2eX7RVJz0uOtriFdC7YmQlSB29-OSTLC82cBswgXVXdREtVJd7DEJ7ngKzB3ph2IsETkuQvX9ZB8a81eV2NSgfFKYe8HnTsfzrxDQPe9glp3QIJrGB2kaRQsr1SvOpbCbZVtmVCi8Xrojv-WASc97uQk8hnwb7j9ZbEVybBKcRrZIpAIhlcA\"}" --profile default

aws cognito-identity get-credentials-for-identity --identity-id "eu-central-1:3a4b2d66-6efc-49e7-a75b-447285dfd7ef" --logins "{\"cognito-idp.eu-central-1.amazonaws.com/eu-central-1_qwtSnbNGm\": \"eyJraWQiOiJmbUVIXC84NzNWT0RJRUE2QXpTbEx5VnFXaE9BYlFXQ3lpSGRIeEgrZjd4UT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhNWJmMTY3Ny1mNzRmLTQ2YTMtODc3Yy04Mzg3NDUyNDU3MjAiLCJjb2duaXRvOmdyb3VwcyI6WyJhZG1pbiJdLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9ldS1jZW50cmFsLTFfcXd0U25iTkdtIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjp0cnVlLCJjb2duaXRvOnVzZXJuYW1lIjoib3ZlbjM2MHByb2QiLCJjb2duaXRvOnJvbGVzIjpbImFybjphd3M6aWFtOjo3MDc1NzIzNTQ2ODQ6cm9sZVwvQ29nbml0b0F1dGhBcGlnd0FkbWluSW5mb1JvbGUiXSwiYXVkIjoiMXFpaWFiYW81Y2UxczhrNzRsaXNzcjJiNmgiLCJldmVudF9pZCI6ImY0OTE3M2NiLWYyNzYtNDliOC05N2U1LTJiODg3ZjNlMzBiYiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjIzNzA5NDMxLCJwaG9uZV9udW1iZXIiOiIrMzkzMjA2MDMyMzUyIiwiZXhwIjoxNjIzNzEzMDMxLCJpYXQiOjE2MjM3MDk0MzEsImVtYWlsIjoiZmFyaWNjaUBnbWFpbC5jb20ifQ.fYlsrixcPVyNWkWvk5Js_kFruM6awH8HAdwY9UXNmHLag-tODsN9Wg5rXsxUBU37YsR17lcvf-XUAPtHpDaEF4QIUE4UkhZBO6odWhKKRHU5lgpvm0ekZOhJadCjr8y7MWp2FX2XCaL-uDRxtaK_gbKq1klK7-5anb2eX7RVJz0uOtriFdC7YmQlSB29-OSTLC82cBswgXVXdREtVJd7DEJ7ngKzB3ph2IsETkuQvX9ZB8a81eV2NSgfFKYe8HnTsfzrxDQPe9glp3QIJrGB2kaRQsr1SvOpbCbZVtmVCi8Xrojv-WASc97uQk8hnwb7j9ZbEVybBKcRrZIpAIhlcA\"}" --profile default