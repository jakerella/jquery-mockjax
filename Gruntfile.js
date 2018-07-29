
/* jshint ignore:start */
var testRunner = require('./qunit-puppeteer.js');
/* jshint ignore:end */

module.exports = function(grunt) {
	'use strict';

	/* jshint ignore:start */
	/* This is used in an await statement, which apaprently JSHint doesn't like */
	var PORT = 4000;
	/* jshint ignore:end */

	// Project configuration
	var config = require('./grunt-config-options');
	config.pkg = grunt.file.readJSON('package.json');

	grunt.initConfig(config);

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('dev', ['jshint', 'test:all', 'test:requirejs', 'browserify', 'test:browserify', 'mochaTest']);
	grunt.registerTask('build', ['dev', 'concat', 'uglify', 'test:dist']);
	grunt.registerTask('default', ['dev']);

	/* jshint ignore:start */
	grunt.registerTask('test', 'Executes QUnit tests with all supported jQuery versions', async function() {
	/* jshint ignore:end */
		var done = this.async();
		var i;

		var versionUrls = require('./test/build-version-urls')(grunt.config, arguments[0], arguments[1], arguments[2]);

		console.log(versionUrls);
		for (i=0; i<versionUrls.length; ++i) {
			try {
				console.log('LOADING', versionUrls[i]);
				/* jshint ignore:start */
				await testRunner(versionUrls[i], PORT);
				/* jshint ignore:end */
			} catch(err) {
				return done(err);
			}
		}
		done();
	/* jshint ignore:start */
	});
	/* jshint ignore:end */

};
