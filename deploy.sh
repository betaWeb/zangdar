#!/bin/bash

_BOLD_FONT='\E[1m'
_COLOR_RED='\E[0;33m'
_COLOR_BLUE='\E[0;34m'
_COLOR_GREEN='\E[0;32m'
_NO_COLOR='\E[0m'

message=${1:-commit changes}
version=${2:-patch}

deploy ()
{
    echo -e "--- ${_COLOR_BLUE}${_BOLD_FONT}Build application...${_NO_COLOR}\n";
    npm run build;
    echo -e "--- ${_COLOR_GREEN}${_BOLD_FONT}Build application completed${_NO_COLOR}\n\n";

    echo -e "\n--- ${_COLOR_BLUE}${_BOLD_FONT}Build application API docs...${_NO_COLOR}\n";
    npm run doc;
    echo -e "--- ${_COLOR_GREEN}${_BOLD_FONT}Build API docs completed${_NO_COLOR}\n\n";

    echo -e "\n--- ${_COLOR_BLUE}${_BOLD_FONT}Commit "${message}"...${_NO_COLOR}\n";
    git add . && git commit -am "$message";
    echo -e "--- ${_COLOR_GREEN}${_BOLD_FONT}Commit completed${_NO_COLOR}\n\n";

    echo -e "\n--- ${_COLOR_BLUE}${_BOLD_FONT}Patch npm package version...${_NO_COLOR}\n";
    npm version "$version";
    echo -e "--- ${_COLOR_GREEN}${_BOLD_FONT}Patch npm package version completed${_NO_COLOR}\n\n";

    echo -e "\n--- ${_COLOR_BLUE}${_BOLD_FONT}Github deployment...${_NO_COLOR}\n";
    git push --tags origin master;
    echo -e "--- ${_COLOR_GREEN}${_BOLD_FONT}Gitgub deployment completed${_NO_COLOR}\n\n";

    echo -e "\n--- ${_COLOR_BLUE}${_BOLD_FONT}Publish into npm...${_NO_COLOR}\n";
    npm publish;
    echo -e "--- ${_COLOR_GREEN}${_BOLD_FONT}Publish into npm completed${_NO_COLOR}\n\n";
}

read -r -p "--- LAUNCH DEPLOYMENT ? [y/N] " input

case $input in
    [yY][eE][sS]|[yY])
 deploy
echo -e "--- ${_COLOR_GREEN}${_BOLD_FONT}DEPLOYMENT SUCCESSFULLY COMPLETED !${_NO_COLOR}";
 ;;
    [nN][oO]|[nN])
 echo -e "${_COLOR_RED}${_BOLD_FONT}Exiting deployment script...${_NO_COLOR}";
 tput sgr0
 exit 1;
 ;;
esac
