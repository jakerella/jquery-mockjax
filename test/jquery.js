
(function(QUnit, basePath) {
	'use strict';

	var parts = document.location.search.slice( 1 ).split( '&' ),
		length = parts.length,
		i = 0,
		current,
		QUnitDone = false,
		QUnitErrors = false,
		currIndex = document.location.search.match(/v=([0-9]+)/),
		nextIndex = (currIndex && Number(currIndex[1]) || 0) + 1, // +1 because QUnit makes the h1 text a link
		version = '1.5.2',
		file = 'http://code.jquery.com/jquery-git.js';

	for ( ; i < length; i++ ) {
		current = parts[ i ].split( '=' );
		if ( current[ 0 ] === 'jquery' ) {
			version = current[ 1 ];
			break;
		}
	}

	if (version !== 'git') {
		file = basePath + 'lib/jquery-' + version + '.js';
	}


	document.write( '<script id=\'jquery\' src=\'' + file + '\'></script>' );


	// Track when QUnit finishes so we can redirect if necessary
	QUnit.done(function(details) {
		QUnitDone = true;
		QUnitErrors = !!details.failed;
	});


	// Set up the 'run all' button once jQuery is loaded
	document.getElementById('jquery').onload = function() {
		$(document).ready(function() {
			// Sigh... QUnit 'rebuilds' the header, so we have to wait for that before
			// attaching our click event, otherwise we lose the handler in the rebuild
			setTimeout(function() {
				var btn = $('.runall');

				if (currIndex) {
					// We're already in a run...
					btn.attr('disabled', 'disabled');
					setupNextRedirect();

				} else {
					// Set up a new run...
					btn.removeAttr('disabled').click(function(e) {
						e.preventDefault();
						setupNextRedirect();
					});
				}
			}, 1000);
		});
	};

	function getNextLink() {
		var nextLink = null,
			nextLinkNode = $('#qunit-header a:eq(' + nextIndex + ')');

		if (nextLinkNode && nextLinkNode.length) {
			nextLink = nextLinkNode.attr('href') + '&v=' + nextIndex;
		}
		return nextLink;
	}

	function setupNextRedirect() {
		var nextLink = getNextLink();

		if (nextLink) {
			if (QUnitDone && !QUnitErrors) {
				// QUnit already finished, so we'll redirect
				document.location.replace(nextLink);

			} else if (!QUnitDone) {
				QUnit.done(function(details) {
					if (!details.failed) {
						// we only redirect if the last test run succeeded
						setTimeout(function() {
							document.location.replace(nextLink);
						}, 1000);
					}
				});
			}
		}
	}

})(window.QUnit, window.testJQPath || '../');
