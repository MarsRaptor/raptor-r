import { ResourceFolder, ResourceFile } from "./ResourceFolder";
import ts from "typescript";
import fs from "fs";

export function writeR(rootFolder: ResourceFolder, variants: Array<string> = ["default"]) {
    const resultFile = ts.createSourceFile(
        "someFileName.ts",
        "",
        ts.ScriptTarget.Latest,
        /*setParentNodes*/ false,
        ts.ScriptKind.TS
    );
    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed
    });
    return printer.printNode(
        ts.EmitHint.Unspecified,
        createR(rootFolder, variants),
        resultFile
    );

}

function createR(rootFolder: ResourceFolder, variants: Array<string>): ts.VariableStatement {

    let properties = new Array<ts.PropertyAssignment>()

    if (rootFolder.folders.length > 0) {       
        properties =properties.concat(rootFolder.folders.filter((f) => {  
            for (const variant of f.__variants) {
                if (variants.indexOf(variant) < 0) {
                    return false
                }
            }
            return true
        }).map((f) => getFolder(f, variants)))
    }
    if (rootFolder.files.length > 0) {
        properties = properties.concat(rootFolder.files.map((f) => getFile(f)))

    }


    return ts.createVariableStatement(
        [ts.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.createVariableDeclarationList(
            [
                ts.createVariableDeclaration(
                    ts.createIdentifier('R'),
                    undefined,
                    ts.createObjectLiteral(properties)
                )
            ],
            ts.NodeFlags.Const
        )
    )
}

function getFolder(folder: ResourceFolder, variants: Array<string>): ts.PropertyAssignment {
    let properties = new Array<ts.PropertyAssignment>()
    if (folder.folders.length > 0) {
        properties = properties.concat(folder.folders.filter((f) => {
            for (const variant of f.__variants) {
                if (variants.indexOf(variant) < 0) {
                    return false
                }
            }
            return true
        }).map((f) => getFolder(f, variants)))
    }
    if (folder.files.length > 0) {
        properties =properties.concat(folder.files.map((f) => getFile(f)))
    }

    return ts.createPropertyAssignment(
        ts.createIdentifier(folder.name),
        ts.createObjectLiteral(properties)
    )
}

function getFile(file: ResourceFile): ts.PropertyAssignment {
    return ts.createPropertyAssignment(
        ts.createIdentifier(file.name),
        ts.createStringLiteral(file.fullPath)
    )
}