# Description
This file lists all URLs references used to help developing this application.


# Electron API

## Quick Start Tutorial:
https://github.com/atom/electron/blob/master/docs/tutorial/quick-start.md

## Electron API
https://github.com/atom/electron/tree/master/docs/api

## API Menu reference
https://github.com/atom/electron/blob/master/docs/api/menu.md

## BrowserWindow API reference:
https://github.com/atom/electron/blob/master/docs/api/browser-window.md
https://www.npmjs.com/package/electron-browser-window-options

## BrowserWindow API:
http://electron.atom.io/docs/v0.30.0/api/browser-window/

## Electron Dialog
http://www.mylifeforthecode.com/getting-started-with-standard-dialogs-in-electron/

## System Tray Module
https://github.com/atom/electron/blob/master/docs/api/tray.md

## Using Application Icons
https://github.com/atom/electron/blob/master/docs/api/native-image.md



# Packaging & Distribution

## Electron Builder
https://github.com/electron-userland/electron-builder

## package.json (NPM Documentation)
https://docs.npmjs.com/files/package.json

## Electron Packager
https://github.com/electron-userland/electron-packager

## Electron Windows Installer
https://github.com/electron/windows-installer

## Electron Archive
https://github.com/electron/asar

## Application Distribution
http://electron.atom.io/docs/v0.37.4/tutorial/application-distribution/

## Windows Installer
http://www.jrsoftware.org/

## Javascript implementation of zip for nodejs
https://www.npmjs.com/package/adm-zip

## Electron Installer Codesign (for signing Mac OS applications)
https://www.npmjs.com/package/electron-installer-codesign



# Testing & Building

## Travis CI
https://travis-ci.org/

## HTML Validator for NodeJS
https://www.npmjs.com/package/html-validator

## HTML Validator Command Line
https://www.npmjs.com/package/html-validator-cli

## JSHint validator for NodeJS
https://www.npmjs.com/package/jshint



# Misc References

## Electron System tray menu module:
https://github.com/maxogden/menubar

## System Tray menu module example Application:
https://github.com/maxogden/monu

## Web Device Metrics
http://www.useragentstring.com/pages/Mobile%20Browserlist

## List of all Browsers Agent Strings:
http://www.useragentstring.com/pages/Browserlist/

## List of most relevant devices Agent Strings:
https://deviceatlas.com/blog/list-of-user-agent-strings

## Icon Convert Web Tool
https://iconverticons.com/online/

## Image Editor
http://www.gimp.org/

## Command line tool to edit resources of .exe files
https://github.com/atom/rcedit

## Google Custom Search Engine
https://developers.google.com/custom-search/docs/element

# Licensing
http://choosealicense.com/licenses/

# CSS Tooltip Generator
http://www.cssportal.com/css-tooltip-generator/


# How-to Create a Release

## Create a new release version tag referencing a successful commit (which had a green build in travis-ci)
`git tag v1.3.0 <commitId>`

## Create/Modify 'latest' release version tag referencing the same commit as above (ex: v1.3.0)
`git tag -f latest <commitId>`

## Push tags to central repository
`git push --tags origin master`

## Check https://travis-ci.org/hvmonteiro/majin for a green build and https://github.com/hvmonteiro/majin/releases for a new release

