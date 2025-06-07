#!/usr/bin/env node 
  
  import { exit } from "node:process";
  import { extractPngsFromFile } from "./processFile";
  
  const cliArgs = process.argv.slice(2);
  if (cliArgs.length !== 2) {
    console.error("Syntax: npx --package=@fmpanelli/md-tools unbundle <input-file> <output-folder>");
    exit(1);
  }
  
  const inputFile = cliArgs[0];
  const outputFolder = cliArgs[1];
  
  extractPngsFromFile(inputFile, outputFolder).then(() => {
    exit(0);
  }).catch((err) => {
    console.error(err);
    exit(1);
  });
  