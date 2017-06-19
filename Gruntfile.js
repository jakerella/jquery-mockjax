module.exports = function(grunt) {
	'use strict';

	var PORT = 8686;

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
			all: [
                'src/**/*.js',
                'Gruntfile.js',
                'test/test.js',
                'test/requirejs/*.js',
                'test/nodejs/*.js',
				'test/browserify/main.js',
				'test/browserify/test.js'
			]
		},
		connect: {
			server: {
				options: {
					port: PORT,
					base: '.'
				}
			}
		},
		qunit: {
			// NOTE: these tests are all run by the `test` task below to run against each jQuery version supported
			all: []
		},
		test: {
			all: {
				jQueryVersions: [
					'1.5.2',
					'1.6.4',
					'1.7.2',
					'1.8.3',
					'1.9.1',
					'1.10.2',
					'1.11.3',
					'1.12.4',
					'2.0.3',
					'2.1.4',
					'2.2.4',
					'3.0.0',
					'3.1.1',
					'3.2.1'
				]
			},
			requirejs: {
				jQueryVersions: [
					'1.7.2',
					'1.8.3',
					'1.9.1',
					'1.12.4',
					'2.0.3',
					'2.2.4',
					'3.0.0',
					'3.2.1'
				]
			},
			latestInBranch: {
				jQueryVersions: [
					'1.12.4',
					'2.2.4',
					'3.2.1'
				]
			},
			oldestAndLatest: {
				jQueryVersions: [
					'1.5.2',
					'1.12.4',
					'2.2.4',
					'3.2.1'
				]
			},
			edge: {
				jQueryVersions: ['git']
			},
            dist: {
                file: 'dist-min.html',
                jQueryVersions: [
                    '1.5.2',
                    '1.6.4',
                    '1.7.2',
                    '1.8.3',
                    '1.9.1',
                    '1.12.4',
                    '2.0.3',
                    '2.1.4',
					'2.2.4',
					'3.0.0',
					'3.2.1'
                ]
            },
			browserify: {
                file: 'browserify/index.html',
				jQueryVersions: ['not-applicable']
			}
		},
		mochaTest: {
			nodejs: {
				src: ['./test/nodejs/*.js']
			}
		},
		browserify: {
			test: {
				src: 'test/browserify/main.js',
				dest: 'test/browserify/bundle.js'
			}
		},
		watch: {
			gruntfile: {
				files: './Gruntfile.js'
			},
			source: {
				files: './src/*.js',
				tasks: ['jshint', 'test:latestInBranch']
			}
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('dev', ['jshint', 'test:all', 'test:requirejs', 'browserify', 'test:browserify', 'mochaTest']);
	grunt.registerTask('build', ['dev', 'concat', 'uglify', 'test:dist']);
	grunt.registerTask('default', ['dev']);

	grunt.registerTask('test', 'Executes QUnit tests with all supported jQuery versions', function() {
		var i, l,
			baseURL = 'http://localhost:' + PORT,
			versionUrls = [],
			testFiles = arguments[1] || null,
			source = arguments[0] || 'all',
			versions = grunt.config.get('test' + ('.' + source) + '.jQueryVersions') || [],
            file = grunt.config.get('test' + ('.' + source) + '.file') || 'index.html';

		if (arguments[0] === 'version' && arguments[1]) {
			versions = [arguments[1]];
			testFiles = (arguments[2]) ? arguments[2] : null;
		}

		if (testFiles) {
			testFiles = JSON.stringify(testFiles.split(/\,/));
		}

		for (i=0, l=versions.length; i<l; ++i) {
			grunt.log.writeln('Adding jQuery version to test: ' + versions[i]);
			grunt.log.writeln('Adding test modules: ' + testFiles);

			if (arguments[0] === 'requirejs') {
				versionUrls.push(baseURL + '/test/requirejs/' + file + '?jquery=' + versions[i] + '&testFiles=' + testFiles);
			} else {
				versionUrls.push(baseURL + '/test/' + file + '?jquery=' + versions[i] + '&testFiles=' + testFiles);
			}
		}

		grunt.config.set('qunit.options.urls', versionUrls);
		grunt.task.run('connect');
		grunt.task.run('qunit');
	});

};
