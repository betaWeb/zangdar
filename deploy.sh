#!/bin/bash

message=$1

deploy ()
{
    echo "--- Build application...\n";
    npm run build;
    echo "--- Build application API docs...\n";
    npm run doc;
    echo "--- Patch npm package version...\n";
    git add .;
    npm version patch;
    echo "--- Commit "${message}"...\n";
    git add package.json && git commit -am "$message";
    echo "--- Github deploy...\n";
    git push --tags origin master;
    echo "--- Publish into npm...\n";
    npm publish;
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
