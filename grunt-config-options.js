const PORT = 4000;

module.exports = {
    banner: [
        '/*! <%= pkg.title || pkg.name %>',
        ' * A Plugin providing simple and flexible mocking of ajax requests and responses',
        ' * ',
        ' * Version: <%= pkg.version %>',
        ' * Home: <%= pkg.homepage %>',
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> Jordan Kasper, formerly appendTo;',
        ' * NOTE: This repository was taken over by Jordan Kasper (@jakerella) October, 2014',
        ' * ',
        ' * Licensed under the MIT license: http://opensource.org/licenses/MIT',
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
            'test/**/test-*.js',
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
                '1.12.4',
                '2.2.4',
                '3.7.1'
            ]
        },
        edge: {
            jQueryVersions: ['git']
        },
        dist: {
            file: 'dist-min.html',
            jQueryVersions: [
                '1.12.4',
                '2.2.4',
                '3.7.1'
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
            tasks: ['jshint', 'test:all']
        }
    }
};
