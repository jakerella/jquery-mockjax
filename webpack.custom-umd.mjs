
import path from 'path'
import { readFileSync, writeFileSync } from 'fs'

const injectPointRE = /\/\*\! UMD WRAPPER \*\//

const UMD_HEADER = `;(function(root, factory) {
	'use strict';

	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		define(['jquery'], function($) { return factory($, root) })
	} else if (typeof exports === 'object') {
		module.exports = factory
	} else {
		return factory(root.jQuery || root.$, root)
	}
}(this, function($, window) {`
const UMD_FOOTER = `return $.mockjax;}))`

export default class WebpackCustomUMD {
    apply(compiler) {
        compiler.hooks.done.tap('Webpack Custom UMD Plugin', () => {
            console.debug('[Custom UMD] Looking for insertion points for UMD wrapper')
            const filename = path.resolve(import.meta.dirname, 'dist', 'jquery.mockjax.js')
            const minFilename = path.resolve(import.meta.dirname, 'dist', 'jquery.mockjax.min.js')

            let built = readFileSync(filename, 'utf-8').toString()
            let minBuilt = readFileSync(minFilename, 'utf-8').toString()

            if (injectPointRE.test(built)) {
                console.debug(`[Custom UMD] Found injection point in built file, inserting UMD wrapper`)
                let umdBuild = built.replace(injectPointRE, UMD_HEADER)
                umdBuild += `\n${UMD_FOOTER}`
                writeFileSync(filename, umdBuild)
            }
            if (injectPointRE.test(minBuilt)) {
                console.debug(`[Custom UMD] Found injection point in minified file, inserting minified UMD wrapper`)
                const minWrapper = UMD_HEADER.replaceAll(/\s+/g, ' ')
                let umdBuild = minBuilt.replace(injectPointRE, minWrapper)
                umdBuild += ` ${UMD_FOOTER}`
                writeFileSync(minFilename, umdBuild)
            }
        })
    }
}
