import path from 'path'
import TerserPlugin from 'terser-webpack-plugin'
import WebpackCustomUMD from './webpack.custom-umd.mjs'
import webpack from 'webpack'
import { readFileSync } from 'fs'

// Read package.json
const pkg = JSON.parse(readFileSync(path.resolve(import.meta.dirname, 'package.json'), 'utf-8'))

// Generate banner comment with version and build date
const banner = `/*!
 * jQuery Mockjax v${pkg.version} - https://github.com/jakerella/jquery-mockjax
 * Build Date: ${new Date().toISOString().split('T')[0]}
 * Copyright (c) ${new Date().getFullYear()} Jordan Kasper and contributors, formerly appendTo
 * Licensed under the MIT license
 */
/*! UMD WRAPPER */
`

export default () => {
    return {
        entry: {
            'jquery.mockjax': path.resolve(import.meta.dirname, 'src', 'attach.mjs'),
            'jquery.mockjax.min': path.resolve(import.meta.dirname, 'src', 'attach.mjs'),
        },
        output: {
            path: path.resolve(import.meta.dirname, 'dist'),
            filename: '[name].js'
        },
        externals: {
            jquery: 'jQuery'
        },
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    include: /\.min\.js$/,
                    terserOptions: {
                        format: {
                            comments: /^!/
                        },
                        compress: {
                            drop_console: false,
                            drop_debugger: true
                        },
                        mangle: false
                    },
                    extractComments: false
                })
            ]
        },
        plugins: [
            new webpack.BannerPlugin({
                banner: banner,
                raw: true,
                entryOnly: true
            }),
            new WebpackCustomUMD()
        ],
        resolve: {
            extensions: ['.mjs']
        }
    }
}
