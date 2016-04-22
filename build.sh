#!/bin/bash


SAVED_DIR="$PWD"
BUILD_DIR="build"

NODE_PATH="${NODE_PATH:=/usr/lib/node_modules}"

APP_NAME="Majin"
APP_VERSION="0.1"
APP_BUILD_VERSION="0000"
APP_DESCRIPTION="Majin - Mobile Browser for the Desktop"
APP_COPYRIGHT="Copyright (c) 2016, Hugo V. Monteiro"

APP_PLATFORM=""
APP_ARCH=""
APP_ICON=""
IGNORE_LIST="(resources|(.*).zip|build.sh|devel-notes.md|README*|node_modules/dev-dependency|$BUILD_DIR)"
EXTRA_PARAMS=""

_my_exit() {

    local EXIT_CODE
    
    [ "$1" != "" ] && EXIT_CODE="$1" || EXIT_CODE="0"

    # Change to saved directory (with pushd) before we exit
    cd "$SAVED_DIR"

    exit "$EXIT_CODE"
}

_cleanup()  {

    [ -d "${BUILD_DIR}/${APP_NAME}-${APP_PLATFORM}-${APP_ARCH}" ] && rm -rf "${BUILD_DIR}/${APP_NAME}-${APP_PLATFORM}-${APP_ARCH}"
    rm -f "${BUILD_DIR}/${APP_NAME}-${APP_PLATFORM}-${APP_ARCH}.zip"

}

# Let's save currect directory.
pushd . > /dev/null


case "$1" in

        win32)
            APP_PLATFORM="win32"
            APP_ARCH="ia32"
            APP_ICON="images/icon@3.png"
            EXTRA_PARAMS="--version-string.CompanyName='Hugo Monteiro' \
--version-string.ProductName='$APP_NAME' \
--version-string.OriginalFilename='${APP_NAME}.exe' \
--version-string.ProductName='$APP_NAME' \
--version-string.InternalName='$APP_NAME' \
--app-FileDescription='$APP_DESCRIPTION' \
--app-copyright='$APP_COPYRIGHT' \
--app-version='$APP_VERSION' \
--build-version='$APP_BUILD_VERSION' \
"
            ;;
        win64)
            APP_PLATFORM="win32"
            APP_ARCH="x64"
            APP_ICON="images/icon@3.png"
            EXTRA_PARAMS="--version-string.CompanyName='Hugo Monteiro' \
--version-string.ProductName='$APP_NAME' \
--version-string.OriginalFilename='${APP_NAME}.exe' \
--version-string.ProductName='$APP_NAME' \
--version-string.InternalName='$APP_NAME' \
--app-FileDescription='$APP_DESCRIPTION' \
--app-copyright='$APP_COPYRIGHT' \
--app-version='$APP_VERSION' \
--build-version='$APP_BUILD_VERSION' \
"
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
        darwin)
            APP_PLATFORM="darwin"
            APP_ARCH="x64"
            APP_ICON="images/icon@3.hqx"
            ;;
        mas)
            APP_PLATFORM="mas"
            APP_ARCH="x64"
            APP_ICON="images/icon@3.hqx"
            ;;
        all)
            APP_PLATFORM="all"
            APP_ARCH="all"
            APP_ICON="images/icon@3.co"
            EXTRA_PARAMS="--version-string.CompanyName='Hugo Monteiro' \
--version-string.ProductName='$APP_NAME' \
--version-string.OriginalFilename='${APP_NAME}.exe' \
--version-string.ProductName='$APP_NAME' \
--version-string.InternalName='$APP_NAME' \
--app-FileDescription='$APP_DESCRIPTION' \
--app-copyright='$APP_COPYRIGHT' \
--app-version='$APP_VERSION' \
--build-version='$APP_BUILD_VERSION' \
"
            ;;
        *)
            echo ""
            echo " usage: ${0##*/} [win32|win64|linux32|linux64|darwin|mas|all]"
            echo ""
            _my_exit 2
            ;;
esac

_cleanup

if [ ! -d "$BUILD_DIR" ]; then
    echo "Creating build directory: $BUILD_DIR"
    mkdir -p $BUILD_DIR 
    [ $? -ne 0 ] && _my_exit $?
fi

echo "Installating build dependencies: "
echo ""
npm install --save-dev
echo ""
echo "Creating package for application named '$APP_NAME'"
echo ""
electron-packager . "$APP_NAME" \
--platform="$APP_PLATFORM" \
--arch="$APP_ARCH" \
--icon="$APP_ICON" \
--ignore="$IGNORE_LIST" \
--asar \
--overwrite \
--out="$BUILD_DIR" \
"$EXTRA_PARAMS"
[ $? -ne 0 ] && _my_exit 1

cd "$BUILD_DIR"
echo ""
echo "Creating ZIP package '${APP_NAME}-${APP_PLATFORM}-${APP_ARCH}.zip'"
zip -qo9r "${APP_NAME}-${APP_PLATFORM}-${APP_ARCH}.zip" "${APP_NAME}-${APP_PLATFORM}-${APP_ARCH}"

cd "$SAVED_DIR"

exit 0
