
const PORT = 4000;

module.exports = function buildVersionURLs(config, arg1, arg2, arg3, arg4) {

    const gruntConfig = (config.get && config.get()) || config;

    const baseURL = 'http://localhost:' + PORT,
        versionUrls = [],
        source = arg1 || 'all',
        file = (gruntConfig.test[source] && gruntConfig.test[source].file) || 'index.html';
    
    let testFiles = arg2 || null,
        ignoreFiles = arg3 || null,
        versions = (gruntConfig.test[source] && gruntConfig.test[source].jQueryVersions) || [];

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

    for (let i=0, l=versions.length; i<l; ++i) {
        let url = 'test/' + file + '?jquery=' + versions[i] + '&testFiles=' + testFiles + '&ignoreFiles=' + ignoreFiles;
        if (!config.onlyPaths) { url = baseURL + '/' + url; }
        versionUrls.push( url );
    }

    return versionUrls;
}
