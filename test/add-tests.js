
(function() {
    'use strict';

    const parts = document.location.search.match( /testFiles=([^&]+)/ ),
        ignore = document.location.search.match( /ignoreFiles=([^&]+)/ );
    
    let testFiles = [
        // These will become something like: <script src='test-core.js'></script>
        'core',                  // 🗸  (except for jsonp)
        'url-match',             // 🗸
        'header-match',          // 🗸
        'data-match',            // 🗸
        'match-order',           // 🗸
        'data-types',            // 🗸  (except for jsonp)
        'headers',               // 🗸
        'mock-clearing',         // 🗸
        'retaining-ajax-calls',  // 🗸  (except for jsonp)
        'namespace',             // 🗸
        // 'logging',
        'connection',            // 🗸  (except for jsonp)
        'timeout',               // 🗸
        'bugs'                   // 🗸
    ];

    if ( parts && parts[1] ) {
        try {
            const inputFiles = JSON.parse( decodeURIComponent(parts[ 1 ]) ) || null;
            if (inputFiles && inputFiles.length && inputFiles[0] !== 'all') {
                testFiles = inputFiles;
            }
        } catch(err) {
            console.warn('\n WARNING: Unable to parse the test modules you wanted:', err);
            testFiles = [];
        }
    }

    if ( ignore && ignore[1] ) {
        try {
            const ignoreFiles = JSON.parse( decodeURIComponent(ignore[ 1 ]) ) || null;
            if (ignoreFiles && ignoreFiles.length) {
                testFiles = testFiles.filter(function(file) {
                    return ignoreFiles.indexOf(file) === -1;
                });
            }
        } catch(err) {
            console.warn('\n WARNING: Unable to parse the test modules you wanted to ignore:', err);
        }
    }

	for (let i=0, l = testFiles.length; i<l; i++ ) {
		document.write( '<script src="test-' + testFiles[ i ] + '.js"></script>' );
	}

}());
