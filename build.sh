#!/bin/bash



_check_requirements()   {
   
   echo "Checking requirements..." 
   npm -g ls rcedit > /dev/null 2>&1
   if [ $? -ne 0 ]; then # Not found globaly, let's check localy

       npm ls rcedit > /dev/null 2>&1
       if [ $? -ne 0 ]; then
           # Not found, let's try to install it localy 
           npm install rcedit 
           if [ $? -ne 0 ]; then
               echo "Error: Mandatory NodeJS module 'rcedit' was not found installed. Further more,"
               echo "     an unknown error was found trying to install it. Check logs for further"
               echo "      information."
               echo "Exiting ..."
               exit 1
           fi
       fi
   fi
}

NODE_PATH="${NODE_PATH:=/usr/lib/node_modules}"

APP_NAME="Majin"
APP_PLATFORM=""
APP_ARCH=""
APP_ICON=""
IGNORE_LIST="(resources|(.*).zip|build.sh|devel-notes.md|README*|node_modules/dev-dependency)"

case "$1" in

        win32)
            APP_PLATFORM="win32"
            APP_ARCH="ia32"
            APP_ICON="images/icon@3.png"
            ;;
        win64)
            APP_PLATFORM="win32"
            APP_ARCH="x64"
            APP_ICON="images/icon@3.png"
            ;;
        linux32)
            APP_PLATFORM="linux"
            APP_ARCH="ia32"
            APP_ICON="images/icon@3.png"
            ;;
        linux64)
            APP_PLATFORM="linux"
            APP_ARCH="x64"
            APP_ICON="images/icon@3.png"
            ;;
        osx)
            APP_PLATFORM="darwin"
            APP_ARCH="x64"
            APP_ICON=""
            ;;
        all)
            for build in win32 win64 linux32 linux64 osx; do
                $0 $build
            done
            ;;
        *)
            echo ""
            echo " usage: ${0##*/} [win32|win64|linux32|linux64|osx|all]"
            echo ""
            exit 2
            ;;
esac

[ -d "${APP_NAME}-${APP_PLATFORM}-${APP_ARCH}" ] && rm -rf "${APP_NAME}-${APP_PLATFORM}-${APP_ARCH}"
rm -f ${APP_NAME}-${APP_PLATFORM}-${APP_ARCH}.zip

echo "Creating package for application named '$APP_NAME'"
electron-packager . "$APP_NAME" \
--platform="$APP_PLATFORM" \
--arch="$APP_ARCH" \
--icon="$APP_ICON" \
--ignore="$IGNORE_LIST" \
--overwrite
[ $? -ne 0 ] && exit 1

echo "Creating ZIP package '${APP_NAME}-${APP_PLATFORM}-${APP_ARCH}.zip'"
zip -q9r "${APP_NAME}-${APP_PLATFORM}-${APP_ARCH}.zip" "${APP_NAME}-${APP_PLATFORM}-${APP_ARCH}"


