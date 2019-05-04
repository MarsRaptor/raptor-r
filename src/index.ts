#!/usr/bin/env node
import fs from "fs";

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import program from "commander";
import { ResourceFolder, build } from "./ResourceFolder";
import { writeR } from "./CodeGen";

clear();
console.log(
  chalk.red(figlet.textSync("Raptor-R", { horizontalLayout: "full" }))
);

program
  .version("0.0.1")
  .description("Create R resource file similar to android R class")
  .option("--config [type]", "Config file")
  .parse(process.argv);

  console.log(
    chalk.grey("Configuration file : ", program.config)
  )

fs.readFile(program.config, (err, data) => {
  if (err) throw err;
  let conf = JSON.parse(data as any) as {
    inputFolder:string,
    outputFolder:string,
    variants?:string[]
  };
  console.log(
    chalk.grey("Configuration : ", JSON.stringify(conf))
  )
  build(conf.inputFolder || "./", (err: any, data?: ResourceFolder) => {
    if (err) { throw err; } else if (data) {
      fs.writeFile((conf.outputFolder || './') + '/R.ts', writeR(data,conf.variants), 'utf8', () => { });
      console.log(
        chalk.green("Operation successful => file created : ",(conf.outputFolder || './') + '/R.ts')
      )
    }
  })
});

if (!process.argv.slice(1).length) {
  program.outputHelp();
}
