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
          "specs/helpers/**/*.js"
        ],
        jUnit: { report: false }
      },

      omnibus: {
        src: "specs/**/*"
      }
    },

    jshint: {
      omnibus: {
        src: ["lib/**/*.js"],
        options: {
          jshintrc: ".jshintrc"
        }
      },
      specs: {
        src: ["specs/**/*.js"],
        options: {
          jshintrc: ".jshintrc-specs"
        }
      }
    },

    watch: {
      // node specs
      // ----------

      omnibus: {
        files: "lib/**/*.js",
        tasks: ["jasmine_node"]
      },

      specs: {
        files: "specs/**/*.js",
        tasks: ["jasmine_node"]
      }
    },

  });

  grunt.loadNpmTasks("grunt-jasmine-node");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");

  grunt.registerTask("specs", ["jshint", "jasmine_node"]);
  grunt.registerTask("default", ["jshint", "watch"]);
};
