# Contributing to Mockjax

First of all, thank you for helping make Mockjax the best it can be! We truly
appreciate the support. Before you submit that Pull Request, please be sure to
follow these guidelines.

## Key Points

* [Write small, atomic commits](#Commits) with good messages
* [Write tests](#Write-tests) (for both passing and failing conditions)
* [**Run** the tests](#Run-the-tests) (`npm run test:all`, but also in various browsers!)
* [Write a good PR](#Submit-Your-PR), following the prompts!
* [Publish a release](#Publish-a-release) (okay, this one is just for the maintainers)

## Commits

### Smaller commits

Keep commits small and atomic. That means one significant change per commit if
possible. For  if you are submitting a PR that fixes a bug, updates a piece of 
documentation, and cleans up some whitespace, please place all three of those 
things in **separate commits**! This allows us to roll back specific work (if 
needed) without destroying the entire contribution. Larger changes that depend 
on one another may be the exception, but look for opportunities for this.

### Commit messages

Your commit messages should clearly identify **why** the changes were made. We 
can see the diff to know _what_ was changed. Keep them short and sweet, identifying 
the purpose of the change and allowing commits to be scanned easily.

### Try to keep the code style consistent

As much as possible we need to try to keep the coding style consistent within the
codebase. That means using the same indentation style, quotes, spacing, etc. You can 
run our style checker using:

`npm run style:check`

If you want eslint to automatically correct style issues you can run:

`npm run style`

Additionally, you should lint the code looking for things like dead lines, potential 
bugs, or out dated code elements. You can do this automatically with:

`npm run lint`

## Write tests

We really need to see tests for any commit other than documentation. If you are
fixing a bug, add a breaking test first, then the code that fixes that test. If you
are developing a new feature, add complete tests for the feature. That includes
tests for success cases as well as failure cases!

We use [QUnit](http://qunitjs.com/) as our testing tool of choice, so please write
them using that API. You should probably add both a unit test (found in `/test/unit`) 
and an integration test (found in `/test/integration`). Try to match the style of the 
existing test suite! Add your test(s) to the appropriate module.

### Mocks

For the unit tests, we have mocks of jQuery and the few other global objects that 
Mockjax relies on. Take a look at how they are used in the unit tests. For the 
integration tests, we generally do not use mocks.

### Run the tests

There are four test suites: unit, integration, nodejs, and requirejs. They each use
slightly different setup, but generally they report results the same way. You can 
run each of them from the terminal, but you can also run the integration tests in 
a browser (and you **should** run them in multiple browsers).

```shell
npm run test       # alias for test:unit
npm run test:unit  # run only the unit tests (no headless browser)

npm run test:integration         # alias for test:integration:latest
npm run test:integration:all     # run the integration test suite in a headless chrome browser against all supported versions of jQuery
npm run test:integration:latest  # run the integration test suite in a headless chrome browser against the latest supported version of jQuery

npm run test:nodejs     # run the Node.js (CommonJS) test suite
npm run test:requirejs  # run the RequireJS test suite

npm run test:all  # alias for running test:unit, test:integration:all, test:nodejs, and test:requirejs
```

### Run tests in real browsers

You should be able to run a small local static HTTP server:

```shell
cd /path/to/mockjax
npx http-server -c-1 -p 3000
```

And then just visit http://localhost:3000/test/integration in your browser. Once there,
be sure to **click through each of the jQuery versions in the header** to run the tests
against each version.

### Run your tests everywhere

Lastly, we'd like you to run your tests on as many browsers as possible. Check the
main [README](README.md#browsers-tested) file for the browsers we support.

We highly recommend running your tests in a virtual environment to capture any issues
in specific browsers. You can do so easily with our BrowserStack integration. You can 
run the integration test suite using the command below. All you need to do is set the 
`BROWSERSTACK_USERNAME` and `BROWSERSTACK_KEY` environment variables first.

```shell
export BROWSERSTACK_USERNAME="your-username"
export BROWSERSTACK_KEY="your-key"
npm run test:browserstack
```

## Submit Your PR

This is the last step! First, be sure you're merging with the correct branch! Version
3.x of Mockjax is on the `master` branch, but if you're submitting a bug fix for v1.x 
or v2.x, make sure it is submitted to the correct branch (as well as `master`, if the 
bug exists in both).

Be sure to identify everything that is within your pull request in the description.
If you have code that fixes a bug and also cleans up some documentation, please
specify both! Additionally, if your PR fixes or resolves a specific Github issue
please reference it using the `#[id]` format so that the two can be linked!

For new features, be sure to include information on _how to use_ the feature in the 
main README. And for bugs, information on how to reproduce the bug is helpful!

## Publish a release

Although individual contributors cannot publish a release, it's good to have
documentation on what goes into that in case anyone needs to take over the process.
Currently, [@jakerella](/jakerella) is the only one doing so.

1. Create a new branch for your version (maybe named `vx.y.z`)
1. Run style checks, linting and all tests:
    - Using `npm run build:dist` captures most of this
    - Also run `node browserstack.js` for cross-browser / OS checks
1. Update the `CHANGELOG.md`, `package.json` version, and any other necessary files.
    - The version for Mockjax is ONLY located in the `package.json`
1. Make sure to generate fresh `/dist` files and commit those.
    - Running `npm run build:dist` in step 1 covered this, or run `npm run build`
1. Submit your PR for the new version branch.
1. Ask others for input on the PR.
1. *If all is well*, merge the branch into `master`.
1. Create a release on Github with a tag matching the version number and changelog info.
1. Run `npm publish` on `master` to push the new version up to npm.
    - Be sure you're logged into npm!
