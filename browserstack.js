
var browserstackRunner = require('browserstack-runner'),
    config = require('./browserstack-config');

console.log(config);

browserstackRunner.run(config, function(err, report) {
    if (err) {
        return console.error('BrowserStack Error', err);
    }
    console.log('All Done!');
});
