import jsdoc from 'eslint-plugin-jsdoc'
import prettierConfig from 'eslint-config-prettier/flat'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    {
        ignores: ['dist/', 'test/'],
    },
    jsdoc.configs['flat/recommended'],
    {
        name: 'mockjax source',
        files: ['src/**/*.mjs'],
        languageOptions: {
            sourceType: 'module',
            globals: {
                jQuery: 'readonly',
                $: 'readonly'
            }
        },
        plugins: {
            jsdoc
        },
		rules: {
            'semi': ['error', 'never'],
            'eqeqeq': ['error', 'always', { null: 'ignore' }],
            'no-unused-vars': ['error', {
                varsIgnorePattern: '_',
                caughtErrors: 'none'
            }],
            'no-constant-condition': ['error', { checkLoops: false }],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-return-assign': 'error',
            'no-sequences': 'error',
            'no-throw-literal': 'error',
            'no-with': 'error',
            'prefer-promise-reject-errors': 'error',
            'radix': 'error',
            'no-shadow': 'error',
            'no-use-before-define': ['error', { 
                functions: false,
                classes: true,
                variables: true
            }],
            'no-new-object': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
            'prefer-rest-params': 'error',
            'prefer-spread': 'error',
            'no-useless-constructor': 'error',
            
            'object-shorthand': ['warn', 'properties'],
            'no-array-constructor': 'warn',
            'prefer-template': 'warn',
            
            'jsdoc/check-alignment': 'warn',
            'jsdoc/check-param-names': 'error',
            'jsdoc/check-tag-names': 'warn',
            'jsdoc/check-types': 'warn',
            'jsdoc/require-param': 'error',
            'jsdoc/require-param-description': 'warn',
            'jsdoc/require-param-type': 'error',
            'jsdoc/require-returns': 'error',
            'jsdoc/require-returns-description': 'warn',
            'jsdoc/require-returns-type': 'error'
		}
	},
    prettierConfig
])
