
import { resolve } from 'path'
import testRunner from '../qunit-puppeteer.mjs'

const PORT = 3000

;(async () => {
    try {
        await testRunner(
            `http://localhost:${PORT}/test/requirejs/index.html`,
            resolve(import.meta.dirname, '..', '..'),
            PORT
        )
        process.exit(0)
    } catch(err) {
        console.error(`\nREQUIREJS TESTING ERROR: ${err.message || err}\n`)
        process.exit(1)
    }

})();
