#!/bin/bash

_COLOR_RED='\E[0;33m'
_COLOR_BLUE='\E[0;34m'
_COLOR_GREEN='\E[0;32m'

message=${1:-commit changes}
version=${2:-patch}

deploy ()
{
    echo -e "--- ${_COLOR_BLUE}Build application...\n";
    npm run build;
    echo -e "--- ${_COLOR_GREEN}Build application completed\n\n";

    echo -e "\n--- ${_COLOR_BLUE}Build application API docs...\n";
    npm run doc;
    echo -e "--- ${_COLOR_GREEN}Build API docs completed\n\n";

    echo -e "\n--- ${_COLOR_BLUE}Commit "${message}"...\n";
    git add . && git commit -am "$message";
    echo -e "--- ${_COLOR_GREEN}Commit completed\n\n";

    echo -e "\n--- ${_COLOR_BLUE}Patch npm package version...\n";
    npm version "$version";
    echo -e "--- ${_COLOR_GREEN}Patch npm package version completed\n\n";

    echo -e "\n--- ${_COLOR_BLUE}Github deployment...\n";
    git push --tags origin master;
    echo -e "--- ${_COLOR_GREEN}Gitgub deployment completed\n\n";

    echo -e "\n--- ${_COLOR_BLUE}Publish into npm...\n";
    npm publish;
    echo -e "--- ${_COLOR_GREEN}Publish into npm completed\n\n";
}

read -r -p "--- LAUNCH DEPLOYMENT ? [y/N] " input

case $input in
    [yY][eE][sS]|[yY])
 deploy
echo -e "--- ${_COLOR_GREEN}DEPLOYMENT SUCCESSFULLY COMPLETED !";
 ;;
    [nN][oO]|[nN])
 echo -e "${_COLOR_RED}Exiting deployment script...";
 exit 1;
 ;;
esac
