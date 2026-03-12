
;(async () => {
    const metadata = await getPackageJSON('../../package.json')
    const majorVersions = Object.keys(metadata.peerDependencies).map(v => v.replace(/[^0-9]+/, ''))
    let latestVersion = majorVersions[majorVersions.length-1]
    startRequire(latestVersion)
})();

function getPackageJSON(filepath) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
        request.open('GET', filepath, false) // not async!
        request.send(null)
        if (request.status === 200) {
            try {
                resolve(JSON.parse(request.responseText))
            } catch(_) {
                reject(new TypeError(`Unable to parse package.json contents from ${filepath}`))
            }
        } else {
            reject(new Error(`Unable to get package.json from ${filepath}:`, request.status))
        }
    })
}

function startRequire(latestVersion) {
    requirejs.config({
        baseUrl: '.',
        paths: {
            app: 'app',
            jquery: `../../node_modules/jquery${latestVersion}/dist/jquery`,
            qunit: '../../node_modules/qunit/qunit/qunit',
            'jquery.mockjax': '../../dist/jquery.mockjax'
        }
    })
    requirejs(['app/tests'])
}