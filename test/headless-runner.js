
import { readFileSync } from 'fs'
import testRunner from './qunit-puppeteer.js'

const PORT = 3000

;(async () => {
    const metadata = getPackageJSON('./package.json')
    const allVersions = []
    for (let major of metadata.jqueryVersions) {
        const jqueryMetadata = getPackageJSON(`./node_modules/jquery${major}/package.json`)
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

    for (let jqVersion of versions) {
        const url = `http://localhost:${PORT}/test/index.html?jquery=${jqVersion}`
        console.log(`\n********************************************************************************
Running Mockjax v${metadata.version} test suite with jQuery version ${jqVersion}
Connecting to: ${url}
********************************************************************************\n`)
        
        try {
            const output = await testRunner(url, PORT)
            console.log(output)
        } catch(err) {
            console.error(`\nERROR: ${err.message || err}\n`)
        }

        // TODO: capture test output overviews and collect them at the end
    }

    process.exit(0)

    function getPackageJSON(filepath) {
        return JSON.parse(readFileSync(filepath).toString())
    }
})();
