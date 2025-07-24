# Authentication

## Introduction

The authentication system works with JWS tokens. These are JSON Web Tokens that are signed with a secret key.

## How it works

1. A User wants to login. The user sends a POST request to the /auth/code endpoint with the email.
2. The server sends an email with a code to the user.
3. The user sends a POST request to the /auth/code/authorize endpoint with the email and the code.
4. The server checks if the code is correct and sends back two JWS tokens. A refresh token and an access token.
5. The user can now use the access token to access the API. The access token is valid for 15 minutes.
6. When the access token expires, the user can send a POST request to the /auth/refresh endpoint with the refresh token.
7. The server will send back a new access token.

## Refresh token rotation

The refresh token is valid for 7 days. When the user uses the refresh token to get a new access token, the server will
send back a new refresh token as well. The old refresh token will be invalidated.
If the refresh token is used multiple times, the server will invalidate all the users refresh tokens and block the user.
This is to prevent someone hijacking the refresh token and using it to get new access tokens.
It also indicates that the user is potentially compromised and should be manually looked at.

## Token structure

The tokens are JSON Web Tokens. They are signed with a secret key. The tokens contain the following information:

- The user's email
- The user's id
- The user's role
