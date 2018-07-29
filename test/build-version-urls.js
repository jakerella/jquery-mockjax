
var PORT = 4000;

module.exports = function buildVersionURLs(config, arg1, arg2, arg3, arg4) {

    var gruntConfig = (config.get && config.get()) || config;

    var i, l, url,
        baseURL = 'http://localhost:' + PORT,
        versionUrls = [],
        testFiles = arg2 || null,
        ignoreFiles = arg3 || null,
        source = arg1 || 'all',
        versions = (gruntConfig.test[source] && gruntConfig.test[source].jQueryVersions) || [],
        file = (gruntConfig.test[source] && gruntConfig.test[source].file) || 'index.html';

    if (arg1 === 'version' && arg2) {
        versions = [arg2];
        testFiles = (arg3) ? arg3 : null;
        ignoreFiles = (arg4) ? arg4 : null;
    }

    if (testFiles) {
        testFiles = JSON.stringify(testFiles.split(/\,/));
    }
    if (ignoreFiles) {
        ignoreFiles = JSON.stringify(ignoreFiles.split(/\,/));
    }

    for (i=0, l=versions.length; i<l; ++i) {
        if (arg1 === 'requirejs') {
            url = 'test/requirejs/' + file + '?jquery=' + versions[i] + '&testFiles=' + testFiles + '&ignoreFiles=' + ignoreFiles;
            if (!config.onlyPaths) { url = baseURL + '/' + url; }
            versionUrls.push( url );
        } else {
            url = 'test/' + file + '?jquery=' + versions[i] + '&testFiles=' + testFiles + '&ignoreFiles=' + ignoreFiles;
            if (!config.onlyPaths) { url = baseURL + '/' + url; }
            versionUrls.push( url );
        }
    }

    return versionUrls;
}
