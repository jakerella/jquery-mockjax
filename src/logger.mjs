/**
 * A basic logger for the Mockjax library
 * @module logger
 */

import { getSettings } from './settings.mjs'

const DEFAULT_LOG_LEVEL = 2
export const DEFAULT_LOG_LEVEL_METHODS = ['error', 'warn', 'info', 'log', 'debug']

class Logger {
    #level = DEFAULT_LOG_LEVEL
    #methods = DEFAULT_LOG_LEVEL_METHODS
    constructor(level, methods) {
        this.#level = level
        this.#methods = methods
        this.#methods.forEach((m) => {
            this[m] = function (...args) {
                return this.#writeLog(m, ...args)
            }
        })
    }

    getLevel() {
        return this.#level
    }

    #writeLog(level, ...elements) {
        if (this.#methods.indexOf(level) > this.#level) {
            return
        }
        const root = (typeof global !== 'undefined') ? global : window
        root.console[level](...elements)
    }
}

/**
 * This will return the current logger implementation from $.mockjaxSettings
 * or a no-op version if that setting is null or otherwise not implemented
 * @returns {{[key: string]: import('./typedefs.mjs').LogMethod}} The current logger implementation
 */
export function getLogger() {
    const settings = getSettings()
    if (!settings.logger) {
        let level = DEFAULT_LOG_LEVEL
        if (typeof settings.logLevel === 'number') {
            level = settings.logLevel
        } else if (typeof settings.logging === 'number') {
            level = settings.logging
        } else if (settings.logging === false) {
            level = -1
        }
        settings.logger = new Logger(level, DEFAULT_LOG_LEVEL_METHODS)
    }
    return settings.logger
}
