/*global module:false*/
module.exports = function(grunt) {

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
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;\n' +
            '* Dual licensed under the MIT or GPL licenses.\n' +
            '* http://appendto.com/open-source-licenses\n' +
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
        qunit: {
            all: ['test/index.html']
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

};