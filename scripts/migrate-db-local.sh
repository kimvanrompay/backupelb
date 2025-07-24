
#!/bin/bash
#
#export FLYWAY_PLACEHOLDERS_JWKS_URL=https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_P0TQzA40E/.well-known/jwks.json
#export FLYWAY_PLACEHOLDERS_DOMAIN=livecadia-auth.auth.eu-west-1.amazoncognito.com
#export FLYWAY_PLACEHOLDERS_CLIENT_ID=1jl06noplfm8j3kmsbhlosrl03
#export FLYWAY_PLACEHOLDERS_DASHBOARD_URL=https://dashboard.local.livecadia.com
#export FLYWAY_PLACEHOLDERS_WEB_APP_URL=https://frontend.local.livecadia.com

host="$1"
user="$2"
password="$3"

flyway -url=jdbc:postgresql://"$host/elaut" \
  -user="$user" \
  -password="$password" \
  -defaultSchema=public \
  -schemas=public \
  -locations="filesystem:./libraries/db/scripts/migrations" \
  migrate
