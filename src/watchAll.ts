import * as esbuild from 'esbuild';
import { staticPathRoot, getReactSrcPath } from './projects/core/staticUtil.js';
import { REACT_COMPONENTS, sourcemap } from './projects/core/static.js';
import { spawn } from 'child_process';
import { TscWatchClient } from 'tsc-watch/client.js';

const watch = new TscWatchClient();
var child: ReturnType<typeof spawn> | null = null;

const __dirname = import.meta.dirname;

const cssIn = `${__dirname}/../../css/input.css`;
const cssOut = `${staticPathRoot}/css/main.css`

watch.on('started', () => {
	console.log('Compilation started');
});

watch.on('first_success', () => {
	console.log('First success!');
});

watch.on('failed', (error) => {
	console.error('Compilation failed:', error);
	if (child) {
		child.kill();
	}
});

watch.on('success', () => {
	if (child) {
		child.kill();
	}

	child = spawn('node', [`${__dirname}/server.js`]);

	if (child.stdout) {
		child.stdout.setEncoding('utf8');

		child.stdout.on('data', (data) => {
			console.log(`dd: ${data}`);
		});
	}

	if (child.stderr) {
		child.stderr.on('data', (data) => {
			console.error(`dd: ${data}`);
		});
	}

	child.on('close', (code) => {
		console.log(`server exited (${code})`);
	});
});

watch.on('compile_errors', () => {
	console.log('compile errors');
	if (child) {
		child.kill();
	}
});

watch.start('--project', '.');


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
	metafile: true // config.environment !== 'production'
});

context.watch();

// call the tailwind cli with watch mode enabled
const tailwindProcess = spawn('npx', [
	'tailwindcss',
	'-i', cssIn,
	'-o', cssOut,
	'--watch'
], {
	stdio: 'inherit',
	shell: true
});

tailwindProcess.on('close', (code) => {
	console.log(`tailwindcss process exited with code ${code}`);
});