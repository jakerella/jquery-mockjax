
import { resolve } from 'path'
import testRunner from '../qunit-puppeteer.mjs'
import { getjQueryVersions } from '../get-jquery-versions.mjs'

const PORT = 3000

;(async () => {
    const allVersions = getjQueryVersions()

    const versions = []
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
        URLs.push(`http://localhost:${PORT}/test/integration/index.html?jquery=${jqVersion}`)
    }
    console.log(`
************************************************************************************
Running Mockjax test suite with jQuery version(s): ${versions}
************************************************************************************`)

    try {
        const results = await testRunner(URLs, resolve(import.meta.dirname, '..','..'), PORT)
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

    process.exit(0)
})();
