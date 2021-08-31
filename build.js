const fs = require("fs-extra");
const { esbuildPluginTsc } = require("esbuild-plugin-tsc");
const _ = require("lodash");
const { build } = require("esbuild");
const glob = require("tiny-glob");

const localPkgJson = fs.readJsonSync("./package.json");

async function main() {
  let entryPoints = await glob("./src/**/*", { filesOnly: true });
  console.log(entryPoints);
  build({
    entryPoints: ["./src/index.ts"],
    outdir: "out",
    bundle: true,
    plugins: [],
    platform: "node",
    minify: false,
    target: ["node16"],
    format: "cjs",
    plugins: [esbuildPluginTsc()],
    external: _.difference(
      Object.keys({
        ...(localPkgJson.dependencies || {}),
        ...(localPkgJson.devDependencies || {}),
        ...(localPkgJson.peerDependencies || {}),
      }),
      ["is-what"]
    ),
  });
}
main().catch(console.error);
