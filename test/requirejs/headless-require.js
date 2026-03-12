
import testRunner from '../qunit-puppeteer.js'

const PORT = 3000

;(async () => {
    try {
        await testRunner(`http://localhost:${PORT}/test/requirejs/index.html`, PORT)
    } catch(err) {
        console.error(`\nTESTING ERROR: ${err.message || err}\n`)
        Error.captureStackTrace(err)
        console.error(err.stack)
    }

})();
