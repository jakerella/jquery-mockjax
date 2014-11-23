/*global module:false*/
module.exports = function(grunt) {
	'use strict';

	var jQueryVersions = [
		'1.5.2',
		'1.6.4',
		'1.7.2',
		'1.8.3',
		'1.9.1',
		'1.10.2',
		'1.11.1',
		'2.0.3',
		'2.1.1',
		'git',
	];
		/*
		<a href="?jquery=1.9.1">jQuery 1.9.1</a>
		 */

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),

		banner: '/*! MockJax - jQuery Plugin to Mock Ajax requests \n'+
			'* <%= pkg.title || pkg.name %>\n' +
			'* \n' +
			'* Version: <%= pkg.version %> \n' +
			'* Released: <%= grunt.template.today("yyyy-mm-dd") %> \n' +
			'* Home: <%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> Jordan Kasper, formerly appendTo;\n' +
			'* NOTE: This repository was taken over by Jordan Kasper (@jakerella) October, 2014\n' +
			'* \n' +
			'* Dual licensed under the MIT or GPL licenses.\n' +
			'* http://opensource.org/licenses/MIT OR http://www.gnu.org/licenses/gpl-2.0.html\n' +
			'*/\n',
			
		// Task configuration.
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: true
			},
			dist: {
				src: ['src/<%= pkg.name %>.js'],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			dist: {
				src: '<%= concat.dist.dest %>',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		jshint: {
			options: {
				jshintrc: true
			},
			all: {
				src: 'src/**/*.js'
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
				'1.11.1',
				'2.0.3',
				'2.1.1',
				'git'
			],
			latestInBranch: {
				jQueryVersions: [
					'1.11.1',
					'2.1.1'
				]
			},
			oldestAndLatest: {
				jQueryVersions: [
					'1.5.2',
					'1.11.1',
					'2.1.1'
				]
			}
		},
		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: ['jshint:gruntfile']
			},
			lib_test: {
				files: '<%= jshint.lib_test.src %>',
				tasks: ['jshint:lib_test', 'nodeunit']
			}
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('build', ['concat', 'uglify']);
	grunt.registerTask('default', ['jshint', 'qunit', 'build']);


	grunt.registerTask('test', 'Executes QUnit tests with all supported jQuery versions', function() {
		var i, l,
			versionUrls = [],
			versions = grunt.config.get('test' + ((arguments[0]) ? '.'+arguments[0] : '') + '.jQueryVersions') || [];

		for (i=0, l=versions.length; i<l; ++i) {
			grunt.log.writeln('Adding jQuery version to test: ' + versions[i]);
			versionUrls.push('test/index.html?jquery=' + versions[i]);
		}

		grunt.config.set('qunit.options.urls', versionUrls);
		grunt.task.run('qunit');
	});

};