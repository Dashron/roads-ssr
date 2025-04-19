/**
 * ESBuild setup
 * ./node_modules/.bin/esbuild static/ts/main.tsx --bundle --outfile=static/dist-js/main.js --tsconfig=static/ts/tsconfig.json
 */
import * as esbuild from 'esbuild';
import { staticPathRoot, getReactSrcPath } from './projects/core/staticUtil.js';
import { REACT_COMPONENTS, sourcemap } from './projects/core/static.js';
// import { config } from './config.js';

function buildEntryPoints() {
	const newEntry: {
		[key: string]: string;
	} = {};

	REACT_COMPONENTS.forEach((path: string) => {
		newEntry[path] = getReactSrcPath(path);
	});

	return newEntry;
}

const context = await esbuild.context({
	entryPoints: buildEntryPoints(),
	outdir: `${staticPathRoot}/dist-js`,
	tsconfig: `${staticPathRoot}/tsconfig.json`,
	bundle: true,
	// True gives us production react, false gives us dev
	minify: false, // config.environment === 'production',
	sourcemap,
	splitting: true,
	format: 'esm',
	logLevel: 'info',
	// true for debugging
	metafile: true, // config.environment !== 'production'
	// sourceRoot: '/'
	// plugins: [reactPlugin, reactDomPlugin, jsxRuntimePlugin]
});

if (process.argv[2] === 'watch') {
	await context.watch();
} else {
	await context.rebuild();
	context.dispose();
}
