
const browserstackRunner = require('browserstack-runner');
const config = require('./browserstack-config');

console.log(config);

browserstackRunner.run(config, function(err, report) {
    if (err) {
        return console.error('BrowserStack Error', err);
    }
    console.log(JSON.stringify(report, null, 2));
});
