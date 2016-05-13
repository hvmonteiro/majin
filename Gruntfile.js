module.exports = function (grunt) {
  grunt.initConfig({
    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },
    jshint: {
      all: ['Gruntfile.js', 'src/majin.js']
    },
    htmllint: { 
      all: ['src/*.html']
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-html');

  // Register tasks
  grunt.registerTask('default', ['clean', 'jshint', 'htmllint']);
};
