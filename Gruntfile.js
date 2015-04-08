module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: [
            '/*! <%= pkg.title || pkg.name %>',
            ' * A Plugin providing simple and flexible mocking of ajax requests and responses',
            ' * ',
            ' * Version: <%= pkg.version %>',
            ' * Home: <%= pkg.homepage %>',
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> Jordan Kasper, formerly appendTo;',
            ' * NOTE: This repository was taken over by Jordan Kasper (@jakerella) October, 2014',
            ' * ',
            ' * Dual licensed under the MIT or GPL licenses.',
            ' * http://opensource.org/licenses/MIT OR http://www.gnu.org/licenses/gpl-2.0.html',
            ' */\n'
        ].join('\n'),
        
        // Task configuration
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['./src/jquery.mockjax.js'],
                dest: './dist/jquery.mockjax.js'
            }
        },
        uglify: {
            options: {
                preserveComments: 'some',
            },
            dist: {
                src: './dist/jquery.mockjax.js',
                dest: './dist/jquery.mockjax.min.js'
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            all: {
                src: ['./src/**/*.js', './Gruntfile.js']
            }
        },
        qunit: {
            all: ['./test/index.html']
        },
        watch: {
            gruntfile: {
                files: './Gruntfile.js'
            },
            source: {
                files: './src/*.js',
                tasks: ['jshint', 'qunit']
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('dev', ['jshint', 'qunit']);
    grunt.registerTask('build', ['dev', 'concat', 'uglify']);
    grunt.registerTask('default', ['dev']);

};