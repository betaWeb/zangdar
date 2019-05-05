#!/bin/bash

_COLOR_RED='\E[0;33m'
_COLOR_BLUE='\E[0;34m'
_COLOR_GREEN='\E[0;32m'
_NO_COLOR='\E[0m'

message=${1:-commit changes}
version=${2:-patch}

deploy ()
{
    echo -e "--- ${_COLOR_BLUE}Build application...${_NO_COLOR}\n";
    npm run build;
    echo -e "--- ${_COLOR_GREEN}Build application completed${_NO_COLOR}\n\n";

    echo -e "\n--- ${_COLOR_BLUE}Build application API docs...${_NO_COLOR}\n";
    npm run doc;
    echo -e "--- ${_COLOR_GREEN}Build API docs completed${_NO_COLOR}\n\n";

    echo -e "\n--- ${_COLOR_BLUE}Commit "${message}"...${_NO_COLOR}\n";
    git add . && git commit -am "$message";
    echo -e "--- ${_COLOR_GREEN}Commit completed${_NO_COLOR}\n\n";

    echo -e "\n--- ${_COLOR_BLUE}Patch npm package version...${_NO_COLOR}\n";
    npm version "$version";
    echo -e "--- ${_COLOR_GREEN}Patch npm package version completed${_NO_COLOR}\n\n";

    echo -e "\n--- ${_COLOR_BLUE}Github deployment...${_NO_COLOR}\n";
    git push --tags origin master;
    echo -e "--- ${_COLOR_GREEN}Gitgub deployment completed${_NO_COLOR}\n\n";

    echo -e "\n--- ${_COLOR_BLUE}Publish into npm...${_NO_COLOR}\n";
    npm publish;
    echo -e "--- ${_COLOR_GREEN}Publish into npm completed${_NO_COLOR}\n\n";
}

read -r -p "--- LAUNCH DEPLOYMENT ? [y/N] " input

case $input in
    [yY][eE][sS]|[yY])
 deploy
echo -e "--- ${_COLOR_GREEN}DEPLOYMENT SUCCESSFULLY COMPLETED !${_NO_COLOR}";
 ;;
    [nN][oO]|[nN])
 echo -e "${_COLOR_RED}Exiting deployment script...${_NO_COLOR}";
 tput sgr0
 exit 1;
 ;;
esac
