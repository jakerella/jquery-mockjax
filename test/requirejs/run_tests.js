(function (QUnit){
    'use strict';

    // Compute the path to the jQuery file using ther URL query parameter:
    // 'jquery=<version number>|git'; the newest version in the local lib
    // directory is the default
    function getJQueryPath() {
        var parts = document.location.search.slice(1).split('&'),
            length = parts.length,
            version = '1.5.2',
            i, current;

        for (i = 0; i < length; i++) {
            current = parts[i].split('=');
            if (current[0] === 'jquery') {
                    version = current[1];
                    break;
            }
        }

        return version === 'git' ? 'http://code.jquery.com/jquery-git' :
                                   '../lib/jquery-' + version;
    }

    require.config({
        // Test the jquery.mockjax registers itself with the right module
        // name when loaded just by the file name
        baseUrl: '../../src',
        paths: {
            // jQuery uses fixed name for their AMD module; point it to
            // the right path according to the URL parameters
            'jquery': getJQueryPath(),
            // Make referring to the test modules easier by a short prefix
            'test': '../test/requirejs'
        }
    });

    // Require all modules with tests; it will execute them right away
    require(['test/test_module'], function () {
        // Initialize the QUnit UI first after the test were run
        QUnit.start();
    });
}(window.QUnit));
