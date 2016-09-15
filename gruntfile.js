module.exports = function(grunt) {
  grunt.initConfig({

    jasmine_nodejs: {
      options: {
         specNameSuffix: ".specs.js", // also accepts an array
         helperNameSuffix: "Helpers.js",
         useHelpers: true,
         reporters: {
           console: {
             colors: true,
             cleanStack: 1,       // (0|false)|(1|true)|2|3
             verbosity: 3,        // (0|false)|1|2|(3|true)
             listStyle: "indent", // "flat"|"indent"
             activity: false
           }
         },
      },

      rabbus: {
        helpers: ["rabbus/specs/helpers/**"],
        specs: ["rabbus/specs/**/*"]
      }
    },

    jshint: {
      rabbus: {
        src: ["rabbus/lib/**/*.js"],
        options: {
          jshintrc: ".jshintrc"
        }
      },
      specs: {
        src: ["rabbus/specs/**/*.js"],
        options: {
          jshintrc: ".jshintrc-specs"
        }
      }
    },

    watch: {
      rabbus: {
        files: "rabbus/lib/**/*.js",
        tasks: ["specs"]
      },

      specs: {
        files: "rabbus/specs/**/*.js",
        tasks: ["specs"]
      }
    }

  });

  grunt.loadNpmTasks("grunt-jasmine-nodejs");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");

  grunt.registerTask("specs", ["jasmine_nodejs"]);
  grunt.registerTask("default", ["watch"]);
};
