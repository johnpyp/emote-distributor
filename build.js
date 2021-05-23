#!/usr/bin/env node

const { build } = require("estrella");

build({
	entry: "src/index.ts",
	outfile: "out/index.js",
	platform: "node",
	external: ["ffmpeg-static"],
	bundle: true,
});
