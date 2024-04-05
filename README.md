# Majin

Latest Release: [![Latest Release Status](https://github.com/hvmonteiro/majin/badges/master/build.svg)](https://github.com/hvmonteiro/majin/releases/latest)

Development Test Release: [![Latest Devel Test Release](https://camo.githubusercontent.com/e428fbe8f12b2b88a513c5945347355b0ab4e4829ff3368b2456b45ff92e5901/68747470733a2f2f7472617669732d63692e6f72672f68766d6f6e746569726f2f6d616a696e2e7376673f6272616e63683d6c61746573742d646576656c)](https://github.com/hvmonteiro/majin/releases/latest-devel)

# About
Majin is a small lightweight desktop browser that renders/requests mobile webpages.

It was developed to avoid the hassle of using a full-blown desktop browser just to keep music/videos playing in the background while you work. It also packs a few features like minimizing to desktop's tray, stay on top of other windows, quick window resizing in landscape and portrait mode for the most used display devices, changing the user-agent accordingly.
(See screenshots below)

# Releases & Usage

It's made available for **Linux**, **OSX** and **Windows** desktop platforms. No configuration and no administration privileges are needed.
You can download it from the [releases](https://github.com/hvmonteiro/majin/releases) pages.
Just download the version you want, extract to a directory and execute it. 


# Screenshots

![Main Start Page](https://github.com/hvmonteiro/majin/raw/master/assets/images/majin-screenshot-default.png)

![Spotify in portrait mode](https://github.com/hvmonteiro/majin/raw/master/assets/images/majin-screenshot-spotify.png)
![Youtube in portrait mode](https://github.com/hvmonteiro/majin/raw/master/assets/images/majin-screenshot-youtube.png)
![BlueSky in landscape mode](https://github.com/hvmonteiro/majin/raw/master/assets/images/majin-screenshot-bluesky.png)
![Twitch in landscape mode](https://github.com/hvmonteiro/majin/raw/master/assets/images/majin-screenshot-twitch.png)
![Apple Music in landscape mode](https://github.com/hvmonteiro/majin/raw/master/assets/images/majin-screenshot-applemusic.png)


## Try directly from source

**Clone and run for a quick way to see Majin in action.**

You must be familiar with [Git](https://git-scm.com) version control system, [NPM](http://npmjs.com)) and [Node.js](https://nodejs.org/en/download/).
Just clone this repository, install NodeJS dependency modules and start Majin with npm as showed in the following example:

Command line example:
```bash
# Clone this repository
git clone https://github.com/hvmonteiro/majin

# Go into the repository
cd majin

# Install dependencies
npm install

# Run the app 
npm start
```


## How to build

**If you want to build distributble packages**

You must be familiar with [Git](https://git-scm.com) version control system, [NPM](http://npmjs.com)) and [Node.js](https://nodejs.org/en/download/).
Just clone this repository, install NodeJS dependency modules and start Majin with npm as showed in the following example:

Command line example:
```bash
# Clone this repository
git clone https://github.com/hvmonteiro/majin

# Go into the repository
cd majin

# Install dependencies
npm install

# Build the app 
npm audit fix
npm run build:clean
npm run build:test
npm run build:test-exec
npm build


# Build a release
npm run build:clean
npm run build:test
npm run build:test-exec
npm run build:release
npm run build:post-release
```


# License
Majin, Copyright (C) 2024 Hugo V. Monteiro
    
This is free software, and you are welcome to redistribute it under certain conditions, see LICENSE file.
    
Majin comes with ABSOLUTELY NO WARRANTY.

