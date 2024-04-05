module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // Before generating any new files, remove any previously-created files.
    clean: {
      build: ['build', 'src/packages', 'src/dist', 'src/node_modules']
    },
    jshint: {
      all: ['Gruntfile.js', 'src/majin.js', 'src/version.json']
    },
    htmllint: {
      options: {
        reset: grunt.option('reset') || false,
        stoponerror: false,
        relaxerror: ['Bad value X-UA-Compatible for attribute http-equiv on element meta.'] // ignores these errors
      },
      files: {
        src: ['src/*.html']
      }
    },
    copy: {
      main: {
        files: [
          // includes files within path
          { expand: true, src: ['src/assets/icons/win/icon.ico'], dest: 'src/', filter: 'isFile' }
        ]
      }
    },
    replace: {
      dist: {
        options: {
          patterns: [{
            match: 'homepageURL',
            replacement: "value"
          }]
        },
        files: [
          {expand: true, flatten: true, src: ['src/version.json'], dest: 'src/'}
        ]
      }
    },
    version: {
      majin: {
        src: ['package.json', 'src/package.json', 'src/version.json']
      }
    },

    exec: {
      list_files: {
        cmd: 'echo npm run exec-test'
      }
    },
    mkdir: {
      all: {
        options: {
          mode: '0700',
          create: ['build', 'build/target', 'build/packages', 'build/install']
        }
      }
    },
    electron: {
      darwin: {
        options: {
          dir: 'src',
          name: 'Majin',
          platform: 'darwin',
          arch: 'x64',
          icon: 'src/assets/icons/mac/icon@3.hqx',
          CompanyName: '',
          ProductName: 'Majin',
          OriginalFilename: 'Majin',
          InternalName: 'Majin',
          FileDescription: 'Mobile Browser for the Desktop',
          copyright: 'Copyright (c) 2024, Hugo V. Monteiro',
          version: '1.3.0',
          buildVersion: '00',
          strictSSL: true,
          ignore: 'node_modules/*',
          overwrite: true,
          asar: true,
          out: 'build/target'
        }
      },
      linux64: {
        options: {
          dir: 'src',
          name: 'Majin',
          platform: 'linux',
          arch: 'x64',
          icon: 'src/assets/icons/png/48x48.png',
          CompanyName: 'Hugo V. Monteiro',
          ProductName: 'Majin',
          OriginalFilename: 'Majin',
          InternalName: 'Majin',
          FileDescription: 'Mobile Browser for the Desktop',
          copyright: 'Copyright (c) 2024, Hugo V. Monteiro',
          version: '1.3.0',
          buildVersion: '00',
          strictSSL: true,
          ignore: 'node_modules/*',
          overwrite: true,
          asar: true,
          out: 'build/target'
        }
      }
    },
    zip: {
      'build/packages/majin-linux-x64.zip': ['build/target/majin-linux-x64']
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-version');
  grunt.loadNpmTasks('grunt-zip');
  require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks
  // grunt.loadNpmTasks('grunt-html-validation');

  // Register tasks
  grunt.registerTask('delete', ['clean']);
  grunt.registerTask('default', ['clean', 'copy', 'version', 'jshint', 'exec']);
  grunt.registerTask('packages', ['clean', 'copy', 'jshint', 'exec', 'mkdir', 'electron', 'zip']);
  grunt.registerTask('release', ['clean', 'copy', 'version', 'jshint', 'exec', 'mkdir', 'electron', 'zip']);
};
