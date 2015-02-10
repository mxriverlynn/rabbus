module.exports = function(grunt) {
  grunt.initConfig({

    jasmine_node: {
      options: {
        forceExit: true,
        match: ".",
        matchall: false,
        extensions: "js",
        specNameMatcher: "[Ss]pecs",
        useHelpers: true,
        helpers : [
          "rabbus/specs/helpers/**/*.js"
        ],
        jUnit: { report: false }
      },

      rabbus: {
        src: ["rabbus/specs/**/*.specs.js"]
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

  grunt.loadNpmTasks("grunt-jasmine-node");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");

  grunt.registerTask("specs", ["jshint", "jasmine_node"]);
  grunt.registerTask("default", ["jshint", "watch"]);
};
