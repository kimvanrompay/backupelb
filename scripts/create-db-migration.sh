#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

echo "DIR: $DIR"

cd "$DIR" || exit

if [ $# -eq 0 ]; then
  echo "No arguments supplied"
  exit
fi

input="$*"
description=${input// /-}
timestamp=$(date '+%Y%m%d%H%M%S')

echo "START TRANSACTION; \n\nCOMMIT;" > ../libraries/db/scripts/migrations/V"${timestamp}"__"${description}".sql

echo "created ../libraries/db/scripts/migrations/V${timestamp}__${description}.sql"
