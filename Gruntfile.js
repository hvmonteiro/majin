module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // Before generating any new files, remove any previously-created files.
    clean: {
      build: ['build']
    },
    jshint: {
      all: ['Gruntfile.js', 'src/majin.js']
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
          { expand: true, src: ['src/images/majin.ico'], dest: 'src/', filter: 'isFile' }
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
        cmd: 'electron src/majin.js --test'
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
          icon: 'src/images/icon@3.hqx',
          CompanyName: '',
          ProductName: 'Majin',
          OriginalFilename: 'Majin',
          InternalName: 'Majin',
          FileDescription: 'Mobile Browser for the Desktop',
          copyright: 'Copyright (c) 2016, Hugo V. Monteiro',
          version: '0.1.0',
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
          icon: 'src/images/icon@3.png',
          CompanyName: 'Hugo V. Monteiro',
          ProductName: 'Majin',
          OriginalFilename: 'Majin',
          InternalName: 'Majin',
          FileDescription: 'Mobile Browser for the Desktop',
          copyright: 'Copyright (c) 2016, Hugo V. Monteiro',
          version: '0.1.0',
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
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-version');
  grunt.loadNpmTasks('grunt-zip');
  require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks
  // grunt.loadNpmTasks('grunt-html-validation');

  // Register tasks
  grunt.registerTask('delete', ['clean']);
  grunt.registerTask('default', ['clean', 'copy', 'jshint', 'version', 'exec']);
  grunt.registerTask('packages', ['clean', 'copy', 'jshint', 'exec', 'mkdir', 'electron', 'zip']);
  grunt.registerTask('release', ['clean', 'copy', 'jshint', 'version', 'exec', 'mkdir', 'electron', 'zip']);
};
