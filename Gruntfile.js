module.exports = function (grunt) {
  grunt.initConfig({
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
        relaxerror: ['Bad value X-UA-Compatible for attribute http-equiv on element meta.'] //ignores these errors 
      }
    },
    files: {
        src: ['src/*.html']
    },
    copy: {
      main: {
          files: [
            // includes files within path
            { expand: true, src: ['src/images/majin.ico'], dest: 'src/', filter: 'isFile'},
          ]
      },
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  // grunt.loadNpmTasks('grunt-htmlhtml-validation');

  // Register tasks
  grunt.registerTask('default', ['clean', 'copy', 'jshint']);
};
