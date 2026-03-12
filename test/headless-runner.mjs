
import { readFileSync } from 'fs'
import testRunner from './qunit-puppeteer.mjs'

const PORT = 3000

;(async () => {
    const metadata = getPackageJSON('./package.json')
    const allVersions = []
    const packages = Object.keys(metadata.peerDependencies)
    for (let name of packages) {
        const jqueryMetadata = getPackageJSON(`./node_modules/${name}/package.json`)
        allVersions.push(jqueryMetadata.version)
    }
    let versions = []

    if (process.argv.length > 2 && process.argv[2] === 'all') {
        versions.push(...allVersions)
    } else if (process.argv.length > 2 && /^\d+\.\d+\.\d+$/.test(process.argv[2])) {
        versions.push(process.argv[2])
    } else {
        versions.push(allVersions[allVersions.length-1])
    }

    console.log(`Running tests on ${versions.length} versions of jQuery: ${versions}`)

    const URLs = []
    for (let jqVersion of versions) {
        URLs.push(`http://localhost:${PORT}/test/index.html?jquery=${jqVersion}`)
    }
    console.log(`
************************************************************************************
Running Mockjax v${metadata.version} test suite with jQuery version(s): ${versions}
************************************************************************************
    `)

    try {
        const results = await testRunner(URLs, PORT)
        if (URLs.length > 1) {
            console.log('\nConsolidated Results:')
            for (let url in results) {
                const stats = Object.keys(results[url]).map(k => `${k}: ${results[url][k]}`)
                const header = `jQ v${url.split('=')[1]}:`.padStart(13, ' ')
                console.log(`${header} ${stats.join(', ')}`)
            }
        }

    } catch(err) {
        console.error(`\nTESTING ERROR: ${err.message || err}\n`)
    }

    // TODO: capture test output overviews and collect them at the end

    process.exit(0)

    function getPackageJSON(filepath) {
        return JSON.parse(readFileSync(filepath).toString())
    }
})();
