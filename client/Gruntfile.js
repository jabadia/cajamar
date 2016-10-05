/*jslint node: true */
"use strict";

module.exports = function(grunt) {

    require('time-grunt')(grunt);
    require('jit-grunt')(grunt, {
        bower: 'grunt-bower-task',
    });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            options: { force:true },
            all: ['css/*'],
        },

          less: {
            transpile: {
                files: [
                    { // Compilation of less files inside src folder of every app
                        expand: false,
                        src: ['less/style.less'],
                        dest: 'css/style.css',
                        ext: '.css'
                    },
                ]
            }
        },

        jshint: {
            all: [ 'Gruntfile.js', 'js/**/*.js'],
        },

        watch: {
            js: {
                files: [ 'Gruntfile.js', 'js/**/*.js'],
                tasks: [ 'jshint'],
            },
            less: {
                files: [ 'less/**/*.less' ],
                tasks: [ 'less' ],
            },
        },

        concurrent: {
            options: {
                logConcurrentOutput: true,
                limit: 5
            },
            dev: {
                tasks: ['watch:js',  'watch:less'],
            },
        },

    });

    grunt.registerTask('build', [ 'clean', 'jshint', 'less']);
    grunt.registerTask('dev', [ 'build', 'concurrent:dev' ]);

    grunt.registerTask('default',['dev']);
};