import path from 'path';
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Generate banner comment with version and build date
const banner = `/*!
 * jQuery Mockjax v${pkg.version} - https://github.com/jakerella/jquery-mockjax
 * Build Timestamp: ${new Date().toISOString()}
 * Copyright (c) ${new Date().getFullYear()} Jordan Kasper and contributors, formerly appendTo
 * Licensed under the MIT license
 */`;

export default () => {
    return {
        entry: {
            'mockjax': './src/index.js',
            'mockjax.min': './src/index.js',
        },
        // entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
            library: {
                name: 'mockjax',
                type: 'umd',
                umdNamedDefine: true,
                export: 'default'
            },
            globalObject: 'this'
        },
        externals: {
            jquery: {
                commonjs: 'jquery',
                commonjs2: 'jquery',
                amd: 'jquery',
                root: 'jQuery'
            }
        },
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    include: /\.min\.js$/,
                    terserOptions: {
                        format: {
                            comments: /^!/,
                            preamble: banner
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
        // Banner for the uncompressed version
        plugins: [
            new webpack.BannerPlugin({
                banner: banner,
                raw: true,
                entryOnly: true
            })
        ],
        resolve: {
            extensions: ['.js']
        }
    };
};
