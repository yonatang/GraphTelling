#!/usr/bin/env bash

r.js -o app.build.js
cp data/* build
cp index.html build
cp scripts/lib/jquery*.js build

sed -i .bak 's/"data\//"/g' build/main.js
sed -i .bak 's/scripts\/lib\/jquery-3.0.0.min.js/jquery-3.0.0.min.js/' build/index.html
sed -i .bak 's/scripts\/lib\/require.js/main.js/' build/index.html

rm build/*.bak