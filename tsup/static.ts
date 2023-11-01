import type { Options } from '.';


import CopyWithHashPlugin from '@enonic/esbuild-plugin-copy-with-hash';
import TsupPluginManifest from '@enonic/tsup-plugin-manifest';
import GlobalsPlugin from 'esbuild-plugin-globals';
import {
	DIR_DST_STATIC,
	DIR_SRC_STATIC
} from './constants';


export default function buildStaticConfig(): Options {
	return {
		bundle: true,
		dts: false,
		// entry,
		entry: {
			'app-applications-bundle': `${DIR_SRC_STATIC}/main.ts`,
		},
		esbuildOptions(options, context) {
			options.keepNames = true;
		},
		esbuildPlugins: [
			GlobalsPlugin({
				'@enonic/legacy-slickgrid.*'(modulename) {
					return 'Slick';
				},
				'jquery': '$',
				'q': 'Q',
			}),
			CopyWithHashPlugin({
				context: 'node_modules',
				manifest: `node_modules-manifest.json`,
				patterns: [
					'@enonic/legacy-slickgrid/index.js',
					'jquery/dist/*.*',
					'jquery-ui-dist/*.*',
					'q/*.js',
				]
			}),
			TsupPluginManifest({
				generate: (entries) => {// Executed once per format
					const newEntries = {};
					Object.entries(entries).forEach(([k,v]) => {
						console.log(k,v);
						const ext = v.split('.').pop() as string;
						const parts = k.replace(`${DIR_SRC_STATIC}/`, '').split('.');
						parts.pop();
						parts.push(ext);
						newEntries[parts.join('.')] = v.replace(`${DIR_DST_STATIC}/`, '');
					});
					return newEntries;
				}
			}),
		],
		format: [
			'cjs'
		],

		minify: false,
		// minify: process.env.NODE_ENV !== 'development',
		// minify: true, // ERROR: Causes app-users-bundle-L6FTUX7O.js:1 Uncaught TypeError: Cannot read properties of undefined (reading 'insertChild')

		noExternal: [ // Same as dependencies in package.json
			/@enonic\/lib-admin-ui.*/,
			// These need to be listed here for esbuildPluginExternalGlobal to work
			/@enonic\/legacy-slickgrid.*/,
			'jquery',
			'q'
		],
		outDir: DIR_DST_STATIC,
		platform: 'browser',
		silent: ['QUIET', 'WARN'].includes(process.env.LOG_LEVEL_FROM_GRADLE||''),
		splitting: false,
		sourcemap: process.env.NODE_ENV === 'development',

		// INFO: Sourcemaps works when target is set here, rather than in tsconfig.json
		// target: 'es2020',
		target: 'es5', // lib-admin-ui uses and old version of slickgrid that can't handle fat arrow functions

		tsconfig: `${DIR_SRC_STATIC}/tsconfig.json`,
	} as Options;
}
