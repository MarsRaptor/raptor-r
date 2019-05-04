"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var typescript_1 = __importDefault(require("typescript"));
function writeR(rootFolder, variants) {
    if (variants === void 0) { variants = ["default"]; }
    var resultFile = typescript_1.default.createSourceFile("someFileName.ts", "", typescript_1.default.ScriptTarget.Latest, 
    /*setParentNodes*/ false, typescript_1.default.ScriptKind.TS);
    var printer = typescript_1.default.createPrinter({
        newLine: typescript_1.default.NewLineKind.LineFeed
    });
    return printer.printNode(typescript_1.default.EmitHint.Unspecified, createR(rootFolder, variants), resultFile);
}
exports.writeR = writeR;
function createR(rootFolder, variants) {
    var properties = new Array();
    if (rootFolder.folders.length > 0) {
        properties = properties.concat(rootFolder.folders.filter(function (f) {
            var e_1, _a;
            try {
                for (var _b = __values(f.__variants), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var variant = _c.value;
                    if (variants.indexOf(variant) < 0) {
                        return false;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return true;
        }).map(function (f) { return getFolder(f, variants); }));
    }
    if (rootFolder.files.length > 0) {
        properties = properties.concat(rootFolder.files.map(function (f) { return getFile(f); }));
    }
    return typescript_1.default.createVariableStatement([typescript_1.default.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.default.createVariableDeclarationList([
        typescript_1.default.createVariableDeclaration(typescript_1.default.createIdentifier('R'), undefined, typescript_1.default.createObjectLiteral(properties))
    ], typescript_1.default.NodeFlags.Const));
}
function getFolder(folder, variants) {
    var properties = new Array();
    if (folder.folders.length > 0) {
        properties = properties.concat(folder.folders.filter(function (f) {
            var e_2, _a;
            try {
                for (var _b = __values(f.__variants), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var variant = _c.value;
                    if (variants.indexOf(variant) < 0) {
                        return false;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return true;
        }).map(function (f) { return getFolder(f, variants); }));
    }
    if (folder.files.length > 0) {
        properties = properties.concat(folder.files.map(function (f) { return getFile(f); }));
    }
    return typescript_1.default.createPropertyAssignment(typescript_1.default.createIdentifier(folder.name), typescript_1.default.createObjectLiteral(properties));
}
function getFile(file) {
    return typescript_1.default.createPropertyAssignment(typescript_1.default.createIdentifier(file.name), typescript_1.default.createStringLiteral(file.fullPath));
}
