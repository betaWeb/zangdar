#!/bin/bash

deploy ()
{
    message=$1
    echo "--- Build application...\n";
    npm run build;
    echo "--- Build application API docs...\n";
    npm run doc;
    echo "--- Commit "${message}"...\n";
    git add . && git commit -am "$message";
    echo "--- Github deploy...\n";
    git push origin master;
}

read -r -p "Le numéro de version a-t-il bien été incrémenté ? [Y/n] " input

case $input in
    [yY][eE][sS]|[yY])
 deploy $1
 ;;
    [nN][oO]|[nN])
 echo "No"
 exit 1
 ;;
esac
