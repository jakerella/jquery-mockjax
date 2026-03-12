
// TODO: remove grunt config... what do we need here?
var config = require('./grunt-config-options')
config.onlyPaths = true
var urls = require('./build-version-urls')(config, 'all', 'all', 'logging')

module.exports = {
    "username": "jordankasper2",
    "key": process.env.BROWSERSTACK_KEY,
    "test_framework": "qunit",
    "test_path": urls,
    "test_server_port": 3000,
    "browsers": [
        "chrome_latest",
        "firefox_latest",
        "safari_latest",
        "edge_latest"
    ]
}
