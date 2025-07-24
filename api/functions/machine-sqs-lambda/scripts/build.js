import esbuild from 'esbuild';

esbuild.buildSync({
	bundle: true,
	platform: 'node',
	target: 'node22',
	format: 'esm',
	treeShaking: true,
	logLevel: 'info',
	outdir: './build',
	legalComments: 'none',
	minify: true,
	minifyIdentifiers: true,
	minifySyntax: true,
	minifyWhitespace: true,
	external: [
		'sharp',
		'sqlite3',
		'pg-query-stream',
		'oracledb',
		'mysql2',
		'mysql',
		'tedious',
		'mssql',
		'better-sqlite3',
	],
	entryPoints: ['./src/server.ts'],
	banner: {
		// see: https://github.com/evanw/esbuild/pull/2067
		js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
	},
});
