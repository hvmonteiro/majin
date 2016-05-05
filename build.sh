#!/bin/bash


SAVED_DIR="$PWD"
BUILD_DIR="./build"
BUILD_DIR_LIST="target packages"
JSON_FILE="package.json"


_my_exit() {

    local EXIT_CODE
    
    [ "$1" != "" ] && EXIT_CODE="$1" || EXIT_CODE="0"

    # Change to saved directory (with pushd) before we exit
    cd "$SAVED_DIR"

    exit "$EXIT_CODE"
}

_init()  {

    if [ ! -f "$JSON_FILE" ]; then
            echo "Error: Mandatory file package.json not found in local directory. Exiting..."
            exit 2
    fi

    APP_NAME="$(sed '/name/!d;s/\(.*\)\("name": "\([^"]*\)"\)\(.*\)/\3/' < "$JSON_FILE")"
    APP_VERSION="$(sed '/version/!d;s/\(.*\)\("version": "\([^"]*\)"\)\(.*\)/\3/' < "$JSON_FILE")"
    APP_BUILD_VERSION="${TRAVIS_BUILD_NUMBER:=0000}"
    APP_DESCRIPTION="$(sed '/description/!d;s/\(.*\)\("description": "\([^"]*\)"\)\(.*\)/\3/' < "$JSON_FILE")"
    APP_AUTHOR="$(sed '/author/!d;s/\(.*\)\("author": "\([^"]*\)"\)\(.*\)/\3/' < "$JSON_FILE")"
    APP_COPYRIGHT="Copyright (c) $(date +%Y), $APP_AUTHOR"

    IGNORE_LIST="(resources|(.*).zip|build.sh|devel-notes.md|README*|node_modules/dev-dependency|$BUILD_DIR)"
    EXTRA_PARAMS=""

    NODE_PATH="${NODE_PATH:=/usr/lib/node_modules}"

    set | grep '^APP_'
    echo "IGNORE_LIST=$IGNORE_LIST"
    echo "EXTRA_PARAMS=$EXTRA_PARAMS"
    echo "NODE_PATH=$NODE_PATH"

    echo ""
    if [ -d "$BUILD_DIR" ]; then
        echo "Removing existing build directory: $BUILD_DIR"
        rm -rf "$BUILD_DIR"
    fi

    echo "Creating build directories: "
    for TMP_DIR in $BUILD_DIR_LIST; do
        mkdir -v -p "$BUILD_DIR/$TMP_DIR"
        [ $? -ne 0 ] && _my_exit $?
    done
    echo ""

    unalias which > /dev/null 2>&1

    # Check if zip is installed
    which zip > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "Error: 'zip' command not found. Exiting..."
        _my_exit 1
    fi

}


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
            ;;
        *)
            echo ""
            echo " usage: ${0##*/} [win32|win64|linux32|linux64|darwin|mas|all]"
            echo ""
            _my_exit 2
            ;;
esac

echo "Building application $APP_NAME version $APP_VERSION ($APP_BUILD_VERSION)..."
echo ""

_init

echo "Installing build dependencies..."
npm install --save-dev

echo ""
electron-packager . "$APP_NAME" \
--platform="$APP_PLATFORM" \
--arch="$APP_ARCH" \
--icon="$APP_ICON" \
--version-string.CompanyName="$APP_AUTHOR" \
--version-string.ProductName="$APP_NAME" \
--version-string.OriginalFilename="${APP_NAME}.exe" \
--version-string.ProductName="$APP_NAME" \
--version-string.InternalName="$APP_NAME" \
--app-FileDescription="$APP_DESCRIPTION" \
--app-copyright="$APP_COPYRIGHT" \
--app-version="$APP_VERSION" \
--build-version="$APP_BUILD_VERSION" \
--ignore="$IGNORE_LIST" \
--asar \
--overwrite \
--tmpdir=false \
--out="$BUILD_DIR/target" \
"$EXTRA_PARAMS"
if [ $? -ne 0 ]; then
    echo "Error: An unexpected error ocurred. Check output formore information. Exiting..."
    _my_exit 1
fi

cd "$BUILD_DIR/target"

echo ""
echo "Creating Packages: "
for DIR in *; do
    echo "- Creating ZIP package '${DIR}.zip'"
    zip -qo9r "../packages/${DIR}.zip" "$DIR"
    if [ $? -ne 0 ]; then
        echo "Error: An unexpected error ocurred. Check output formore information. Exiting..."
        _my_exit 1
    fi
done
echo ""

cd "$SAVED_DIR"

echo "Finished successfuly."

exit 0

