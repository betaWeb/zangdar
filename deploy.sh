#!/bin/bash

message=$1

deploy ()
{
    echo "--- Build application...\n";
    npm run build;
    echo "\n--- Build application API docs...\n";
    npm run doc;
    echo "\n--- Commit "${message}"...\n";
    git add . && git commit -am "$message";
    echo "\n--- Patch npm package version...\n";
    npm version patch;
    echo "\n--- Github deploy...\n";
    git push --tags origin master;
    echo "\n--- Publish into npm...\n";
    npm publish
}

read -r -p "Le numéro de version a-t-il bien été incrémenté ? [Y/n] " input

case $input in
    [yY][eE][sS]|[yY])
 deploy
 ;;
    [nN][oO]|[nN])
 echo "No"
 exit 1
 ;;
esac
