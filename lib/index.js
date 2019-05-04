#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var chalk_1 = __importDefault(require("chalk"));
var clear_1 = __importDefault(require("clear"));
var figlet_1 = __importDefault(require("figlet"));
var commander_1 = __importDefault(require("commander"));
var ResourceFolder_1 = require("./ResourceFolder");
var CodeGen_1 = require("./CodeGen");
clear_1.default();
console.log(chalk_1.default.red(figlet_1.default.textSync("Raptor-R", { horizontalLayout: "full" })));
commander_1.default
    .version("0.0.1")
    .description("Create R resource file similar to android R class")
    .option("--config [type]", "Config file")
    .parse(process.argv);
console.log(chalk_1.default.grey("Configuration file : ", commander_1.default.config));
fs_1.default.readFile(commander_1.default.config, function (err, data) {
    if (err)
        throw err;
    var conf = JSON.parse(data);
    console.log(chalk_1.default.grey("Configuration : ", JSON.stringify(conf)));
    ResourceFolder_1.build(conf.inputFolder || "./", function (err, data) {
        if (err) {
            throw err;
        }
        else if (data) {
            fs_1.default.writeFile((conf.outputFolder || './') + '/R.ts', CodeGen_1.writeR(data, conf.variants), 'utf8', function () { });
            console.log(chalk_1.default.green("Operation successful => file created : ", (conf.outputFolder || './') + '/R.ts'));
        }
    });
});
if (!process.argv.slice(1).length) {
    commander_1.default.outputHelp();
}
