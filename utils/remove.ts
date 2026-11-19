import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import util from "node:util";

const args = (() => {
  const args = process.argv.slice(2);
  if (args[0] === "--") return args.slice(1);
  return args;
})();

const parsed = util.parseArgs({
  args,
  options: {
    file: {
      type: "string",
      short: "f",
      multiple: true,
    },
  },
});

const { values: { file } } = parsed;

if (!file || file.length <= 0) {
  process.exit(0);
}

for (const f of file) {
  if (!existsSync(f)) continue;
  await rm(f, { recursive: true, force: true });
  console.log("remove:", f);
}
