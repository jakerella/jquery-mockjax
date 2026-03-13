
;(async (QUnit, basePath) => {

	const testModules = [
		'core',
		'url-match',
		'header-match',
		'data-match',
		'match-order',
		'data-types',
		'headers',
		'jsonp',
		'mock-clearing',
		'retaining-ajax-calls',
		'namespace',
		'connection',
		'timeout',
		'bugs',
		'logging'
	]

	const metadata = await getPackageJSON(`${basePath}/package.json`)

	await insertJQuery(metadata)
	await insertMockjax(metadata)
	setupQUnit(metadata)
	await addTestModules(testModules)
	console.info('Tests ready to run...')

	function getPackageJSON(filepath) {
		return new Promise((resolve, reject) => {
			const request = new XMLHttpRequest()
			request.open('GET', filepath, false) // not async!
			request.send(null)
			if (request.status === 200) {
				try {
					resolve(JSON.parse(request.responseText))
				} catch(_) {
					reject(new TypeError(`Unable to parse package.json contents from ${filepath}`))
				}
			} else {
				reject(new Error(`Unable to get package.json from ${filepath}:`, request.status))
			}
		})
	}

	async function insertJQuery(metadata) {
		console.debug('Inserting desired version of jQuery')

		let version = Object.keys(metadata.peerDependencies).pop().replace(/[^0-9]+/, '')
		version = getMajorJQVersionFromURL() || version

		const filepath = `${basePath}/node_modules/jquery${version}/dist/jquery.js`
		document.write(`<script id='jquery' src='${filepath}'></script>`)

		return new Promise((resolve, _) => {
			document.getElementById('jquery').addEventListener('load', () => {
				console.info(`Using jQuery version ${$.fn.jquery}`)
				resolve()
			})
		})
	}

	function getQueryParams() {
		const params = {}
		document.location.search.slice(1).split('&')
			.forEach(p => {
				const param = p.split('=')
				if (params[param[0]] && !Array.isArray(params[param[0]])) {
					params[param[0]] = [params[param[0]]]
				}
				if (params[param[0]]) {
					params[param[0]].push(param[1])
				} else {
					params[param[0]] = param[1]
				}
			})
		return params
	}

	function getMajorJQVersionFromURL() {
		const params = getQueryParams()
		if (params['jquery']) {
			return params['jquery'].split('.')[0]
		}
		return null
	}

	function insertMockjax(metadata) {
		let min = ''
		if (getQueryParams().min) {
			min = '.min'
		}
		document.write(`<script id='mockjax' src='${basePath}/dist/jquery.mockjax${min}.js'></script>`)
		return new Promise((resolve, _) => {
			document.getElementById('mockjax').addEventListener('load', () => {
				console.info(`Testing Mockjax version ${metadata.version} ${(min) ? '(min)' : ''}`)
				resolve()
			})
		})
	}

	function setupQUnit(metadata) {
		console.debug('Setting up QUnit hooks')

		QUnit.begin(function() {

			QUnit.noErrorCallbackExpected = function noErrorCallbackExpected(xhr) {
				QUnit.assert.ok(false, `Error callback executed: ${xhr.status}`, xhr.responseText)
			}

			// Speed up our tests, individual tests can change this if they need to
			$.mockjaxSettings.responseTime = 0
			
			// Change this if you want more logging on test runs, but it will slow them down
			$.mockjaxSettings.logging = 1

			// Cache default settings for a quick restore after each test
			QUnit.defaultMockjaxSettings = $.extend({}, $.mockjaxSettings)
		})

		QUnit.testDone(function() {
			$.mockjax.clearAll()
			$.mockjax.clearRetainedAjaxCalls()
			// For some reason, calling resetSettings() causes every test
			// to take about 10x as long to run...
			// $.mockjax.resetSettings()
			$.mockjaxSettings = $.extend({}, QUnit.defaultMockjaxSettings)
		})
		
		window.addEventListener('load', async () => {
			document.getElementById('mockjax-version').innerHTML = metadata.version

			const majorVersions = Object.keys(metadata.peerDependencies).map(v => v.replace(/[^0-9]+/, ''))
			let jqVersion = majorVersions[majorVersions.length-1]
			jqVersion = getMajorJQVersionFromURL() || jqVersion

			const links = []
			for (let major of majorVersions) {
				const jqueryMetadata = await getPackageJSON(`${basePath}/node_modules/jquery${major}/package.json`)
				let strong = false
				if (jqVersion === jqueryMetadata.version.split('.')[0]) {
					strong = true
				}
				links.push(`${(strong) ? '<strong>' : ''}<a href='?jquery=${jqueryMetadata.version}'>${jqueryMetadata.version}</a>${(strong) ? '</strong>' : ''}`)
			}
			document.getElementById('jquery-versions').innerHTML = links.join(' | ')

			setTimeout(function() {
				const currJQMatch = document.location.search.match(/v=([0-9]+)/)
				const nextJQIndex = (currJQMatch) ? (Number(currJQMatch[1]) + 1) : 0
				const runall = document.getElementById('runall')

				if (currJQMatch) {
					runall.setAttribute('disabled', 'disabled')
					setupNextRedirect(nextJQIndex)
				} else {
					runall.removeAttribute('disabled')
					runall.addEventListener('click', () => {
						const nextLink = setupNextRedirect(nextJQIndex)
						document.location.replace(nextLink)
					})
				}
			}, 1)
		})
	}

	function setupNextRedirect(index) {
		const node = document.querySelectorAll('#jquery-versions a')[index]
		if (node) {
			const nextLink = `${node.getAttribute('href')}&v=${index}`
			QUnit.done(function(details) {
				if (!details.failed) {
					setTimeout(function() {
						document.location.replace(nextLink)
					}, 1500)
				}
			})
			return nextLink
		}
		return null
	}

	function addTestModules(testFiles) {
		console.debug('Adding test modules')

		const promises = []
		for (let i=0, l = testFiles.length; i<l; i++ ) {
			document.write(`<script id='test-script-${testFiles}' src='test-${testFiles[i]}.js'></script>`)
			promises.push(new Promise((resolve, _) => {
				document.getElementById(`test-script-${testFiles}`).addEventListener('load', resolve)
			}))
		}

		return Promise.all(promises)
	}


})(window.QUnit, window.testJQPath || '../..');
