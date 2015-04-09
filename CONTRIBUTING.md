# Contributing to Mockjax #

First of all, thank you for helping make Mockjax the best plugin it can be! We truly 
appreciate the support. Before you submit that Pull Request, please be sure to 
follow these guidelines.

## Key Points

* Write small, atomic commits with good messages
* Writes tests (for both passing and failing conditions)
* **Run** the tests (`grunt test`, but also in various browsers)
* Generate a distribution build (`grunt build`)
* Write a good PR!


## Accurately describe your code submission ##

Be sure to identify everything that is within your pull request in the description. 
If you have code that fixes a bug and also cleans up some documentation, please 
specify both! Additionally, if your PR fixes or resolves a specific Github issue 
please reference it using the `#[id]` format so that the two can be linked!

### Commit messages ###

Just as with the PR description, your commit messages should clearly identify what 
was included in that commit. Keep them short and sweet so we can just scan the 
titles of the commit and dig deeper if we need to.

### Smaller commits ###

Along the same line, we would prefer to see different aspects of your PR in 
separate commits versus one big commit. So if you are submitting a PR that fixes a
bug, updates the documentation, and cleans up some whitespace, please place all 
three of those things in **separate commits**! This allows us to roll back specific 
work if need be without destroying the entire contribution.

## Try to keep the style consistent ##

As much as possible we need to try to keep the coding style consistent within the
plugin. That means using the same indentation style, quotes, spacing, etc. Please 
try to keep your work in line with what is already in the library already, but 
feel free to ping someone in the Github issues if you have any questions about 
coding style generally.

## Add tests! ##

We really need to see tests for any commit other than documentation. If you are 
fixing a bug add a breaking test first, then the code that fixes that test. If you 
are developing a new feature, add complete tests for the feature. That includes 
tests for success cases as well as failure cases!

We use [QUnit](http://qunitjs.com/) as our testing tool of choice, so please write 
them using that API. For now you can simply add them to the `/test/test.js` file. 
There are `module`s in there, so try to add the tests in a logical location.

### RUN THE TESTS ###

Due to the need to load some of the proxy files asynchronously, you'll need to view 
the test files over HTTP. You can do some initial testing with PhantomJS using the 
Grunt task, but you should also test in (multiple) browsers!

#### To run from Grunt...

Simply run:

```shell
~$ grunt test
```

_Note that this will run all tests for all supported versions of jQuery!_

#### To run in a browser...

You should be able to run a small local server:

Node:  
```shell
~$ npm install -g http-server
~$ cd /path/to/mockjax
mockjax/$ http-server -p 8080
```

Python:  
```shell
~$ cd /path/to/mockjax
mockjax/$ python -m SimpleHTTPServer 8080
```

PHP (5.4+):  
```shell
~$ cd /path/to/mockjax
mockjax/$ php -S localhost:8080
```

Then just visit http://localhost:8080/test/index.html in the browser! Once there, 
be sure to **click through each of the jQuery versions in the header** to run the tests 
against each version. (If you have trouble running in different versions, make sure 
you are viewing `/test/index.html` not just `/test/` .)

### Run your tests everywhere ###

Lastly, we'd like you to run your tests on as many browsers as possible. Check the 
main [README](README.md#browsers-tested) file for the browsers we support. If you 
don't have access to one of those browsers, try running the tests using a virtual 
machine or via a service like [BrowserStack](http://www.browserstack.com), 
[Sauce Labs](https://saucelabs.com), or [Modern.IE](https://www.modern.ie).

## Be sure to generate a build!

Running the default `grunt` task will only lint and test the files, it does not 
produce a distribution as that isn't necessary most of the time. Instead, you 
should generate a new set of "dist" files before submitting your PR. To do this, 
just run `grunt build`

## Submit Your PR

This is the last step! First, be sure you're merging with the correct branch! Version 
2.0 of Mockjax will be the `master` branch very soon (hopefully we remember to update 
this message), but if you're submitting a bug fix, it should be submitted to the `v1.x` 
branch as well as `master` (if the bug exists in both).

You should also write a good PR message with information on why this feature or fix is 
necesary or a good idea. For features, be sure to include information on _how to use_ 
the feature; and for bugs, information on how to reproduce the bug is helpful!
