module.exports = function(grunt) {
    'use strict';

    // Project configuration
    grunt.initConfig({
        // Metadata
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
		qunit: { all: [] },  // NOTE: these tests are all run by the `test` task below to run against each jQuery version supported
		test: {
			jQueryVersions: [
				'1.5.2',
				'1.6.4',
				'1.7.2',
				'1.8.3',
				'1.9.1',
				'1.10.2',
				'1.11.2',
				'2.0.3',
				'2.1.3'
			],
			latestInBranch: {
				jQueryVersions: [
					'1.11.2',
					'2.1.3'
				]
			},
			oldestAndLatest: {
				jQueryVersions: [
					'1.5.2',
					'1.11.2',
					'2.1.3'
				]
			},
            edge: {
                jQueryVersions: ['git']
            }
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

	grunt.registerTask('dev', ['jshint', 'test']);
    grunt.registerTask('build', ['dev', 'concat', 'uglify']);
    grunt.registerTask('default', ['dev']);


	grunt.registerTask('test', 'Executes QUnit tests with all supported jQuery versions', function() {
		var i, l,
			versionUrls = [],
			versions = grunt.config.get('test' + ((arguments[0]) ? '.' + arguments[0] : '') + '.jQueryVersions') || [];

		for (i=0, l=versions.length; i<l; ++i) {
			grunt.log.writeln('Adding jQuery version to test: ' + versions[i]);
			versionUrls.push('./test/index.html?jquery=' + versions[i]);
		}

		grunt.config.set('qunit.options.urls', versionUrls);
		grunt.task.run('qunit');
	});

};