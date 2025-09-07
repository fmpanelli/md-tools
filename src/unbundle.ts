#!/usr/bin/env node

import { exit } from "node:process";
import { extractPngsFromFile } from "./extractPngsFromFile";

const cliArgs = process.argv.slice(2);

const { inputFile, outputFolder, linksFromParent } = parseArgs(cliArgs);

extractPngsFromFile(
  inputFile,
  outputFolder,
  linksFromParent ? "fromOutideDestinationFolder" : "fromInsideDestinationFolder"
)
  .then(() => {
    exit(0);
  })
  .catch((err) => {
    console.error(err);
    exit(1);
  });

function parseArgs<O extends string>(
  args: string[]
): { inputFile: string; outputFolder: string; linksFromParent: boolean } {
  const positionalArgs: string[] = args.filter((arg) => !arg.startsWith("-"));
  let linksFromParent = false;
  if (args.includes("--links-from-parent")) linksFromParent = true;
  if (positionalArgs.length !== 2) {
    console.error(
      "Syntax: npx --package=@fmpanelli/md-tools unbundle <input-file> <output-folder> [--links-from-parent]"
    );
    exit(1);
  }
  return { inputFile: positionalArgs[0], outputFolder: positionalArgs[1], linksFromParent };
}
