# Majin

Latest Release: [![Latest Release Status](https://github.com/hvmonteiro/majin/badges/master/build.svg)](https://github.com/hvmonteiro/majin/tags/latest)

Development Test Release: [![Latest Devel Test Release](https://github.com/hvmonteiro/majin/badges/latest-devel/build.svg)](https://github.com/hvmonteiro/majin/tags/latest-devel)

# About
Majin is a small lightweight desktop browser that renders/requests mobile webpages from websites (when these are available).

It was developed to avoid the hassle of using a full-blown browser just to keep music/videos playing in the background while you work. It also packs a few features like minimizing to desktop's tray and stay on top of other windows.

![Majin Screenshot for Linux](https://github.com/hvmonteiro/majin/raw/master/src/images/majin-screenshot-linux.png)![Majin Screenshot for Windows](https://github.com/hvmonteiro/majin/raw/master/src/images/majin-screenshot-windows.png)
![Majin Screenshot with Youtube](https://github.com/hvmonteiro/majin/raw/master/src/images/majin-screenshot-youtube.png)![Majin Screenshot with Spotify](https://github.com/hvmonteiro/majin/raw/master/src/images/majin-screenshot-spotify.png)

# Releases & Usage

It's made available for **Linux**, **OSX** and **Windows** desktop platforms. No configuration and no administration privileges are needed.
You can download it from the [releases](https://github.com/hvmonteiro/majin/releases) pages.
Just download the version you want, extract to a directory and execute it. 


## Try directly from source

**Clone and run for a quick way to see Majin in action.**

You must be familiar with [Git](https://git-scm.com) version control system, [NPM](http://npmjs.com)) and [Node.js](https://nodejs.org/en/download/).
Just clone this repository, install NodeJS dependency modules and start Majin with npm as showed in the following example:
```
git clone https://github.com/hvmonteiro/majin
cd majin
npm install
npm start
```
...and you have a Majin running in your desktop.


# License
Majin, Copyright (C) 2018 Hugo V. Monteiro
    
This is free software, and you are welcome to redistribute it under certain conditions, see LICENSE file.
    
Majin comes with ABSOLUTELY NO WARRANTY.




# Development



## Structure of the project

The application consists of two main folders...

`src` - files within this folder get transpiled or compiled (because Electron can't use them directly).

`app` - contains all static assets which don't need any pre-processing. Put here images, CSSes, HTMLs, etc.

The build process compiles the content of the `src` folder and puts it into the `app` folder, so after the build has finished, your `app` folder contains the full, runnable application.

Treat `src` and `app` folders like two halves of one bigger thing.

The drawback of this design is that `app` folder contains some files which should be git-ignored and some which shouldn't (see `.gitignore` file). But this two-folders split makes development builds much, much faster.


## Starting the app

```
npm start
```

## The build pipeline

Build process uses [Webpack](https://webpack.js.org/). The entry-points are `src/background.js` and `src/app.js`. Webpack will follow all `import` statements starting from those files and compile code of the whole dependency tree into one `.js` file for each entry point.

[Babel](http://babeljs.io/) is also utilised, but mainly for its great error messages. Electron under the hood runs latest Chromium, hence most of the new JavaScript features are already natively supported.

## Environments

Environmental variables are done in a bit different way (not via `process.env`). Env files are plain JSONs in `config` directory, and build process dynamically links one of them as an `env` module. You can import it wherever in code you need access to the environment.
```js
import env from "env";
console.log(env.name);
```

## Upgrading Electron version

To do so edit `package.json`:
```json
"devDependencies": {
  "electron": "2.0.2"
}
```
*Side note:* [Electron authors recommend](http://electron.atom.io/docs/tutorial/electron-versioning/) to use fixed version here.

## Adding npm modules

Remember to respect the split between `dependencies` and `devDependencies` in `package.json` file. Your distributable app will contain modules listed in `dependencies` after running the release script.

*Side note:* If the module you want to use is a native one (not pure JavaScript but compiled binary) you should first  run `npm install name_of_npm_module` and then `npm run postinstall` to rebuild the module for Electron. You need to do this once after you're first time installing the module. Later on, the postinstall script will fire automatically with every `npm install`.

# Testing

Run all tests:
```
npm test
```

## Unit

```
npm run unit
```
Using [electron-mocha](https://github.com/jprichardson/electron-mocha) test runner with the [Chai](http://chaijs.com/api/assert/) assertion library. You can put your spec files wherever you want within the `src` directory, just name them with the `.spec.js` extension.

## End to end

```
npm run e2e
```
Using [Mocha](https://mochajs.org/) and [Spectron](http://electron.atom.io/spectron/). This task will run all files in `e2e` directory with `.e2e.js` extension.

# Making a release

To package your app into an installer use command:
```
npm run release
```

Once the packaging process finished, the `dist` directory will contain your distributable file.

We use [electron-builder](https://github.com/electron-userland/electron-builder) to handle the packaging process. It has a lot of [customization options](https://www.electron.build/configuration/configuration), which you can declare under `"build"` key in `package.json`.

You can package the app cross-platform from a single operating system, [electron-builder kind of supports this](https://www.electron.build/multi-platform-build), but there are limitations and asterisks. This doesn't do that YET!
