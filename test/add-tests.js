
(function() {
    'use strict';

    var i, l,
        parts = document.location.search.match( /testFiles=([^&]+)/ ),
        testFiles = [
            'core',  // This will become: <script src='test-core.js'></script>
            'data-match',
            'data-types',
            'header-match',
            'url-match',
            'headers',
            'mock-clearing',
            'retaining-ajax-calls',
            'namespace',
            'logging',
            'connection',
            'timeout',
            'bugs'
        ];

    if ( parts && parts[1] ) {
        try {
            testFiles = JSON.parse( decodeURIComponent(parts[ 1 ]) ) || testFiles;
        } catch(err) {
            console.warn('\n WARNING: Unable to parse the test modules you wanted:', err);
            testFiles = [];
        }
    }

	for ( i=0, l = testFiles.length; i<l; i++ ) {
		document.write( '<script src="test-' + testFiles[ i ] + '.js"></script>' );
	}

}());
