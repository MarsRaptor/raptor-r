import fs from "fs";
import path from "path";

abstract class ResourceItem {
    name: string;
    path: string;
    fullPath: string;
    constructor(name: string, path: string, fullPath?: string) {
        this.name = name;
        this.path = path;
        this.fullPath = fullPath || path;
    }
}

export class ResourceFolder extends ResourceItem {
    __variants: Set<string>;
    files: ResourceFile[]
    folders: ResourceFolder[]
    constructor(name: string, path: string, fullPath?: string, variants: Set<string> = new Set(["default"])) {
        super(name, path, fullPath)
        this.__variants = variants;
        this.files = []
        this.folders = []
    }

    addFile(file: ResourceFile) {
        this.files.push(file)
    }

    addFolder(folder: ResourceFolder) {
        this.folders.push(folder)
    }

    toJSON() {
        return {
            name: this.name,
            path: this.path,
            fullPath: this.fullPath,
            __variants: Array.from(this.__variants),
            files: this.files,
            folders: this.folders,
        };
    }
}

export class ResourceFile extends ResourceItem {
    extention: string
    constructor(name: string, path: string, extention: string, fullPath?: string) {
        super(name, path, fullPath)
        this.extention = extention;
    }
    toJSON() {
        return {
            name: this.name,
            path: this.path,
            fullPath: this.fullPath,
            extention: this.extention
        };
    }
}

function fileInformer(filename: string, isFolder: boolean): { name: string; ext?: string; variants?: Set<string> } {

    const regexEXT = /\.[^;]*/;
    const regexVAR = /(?=\S*[-])([a-zA-Z-]+)/;
    let m;

    let fixedName = filename;
    let ext;
    let variants: Set<string>;

    if (isFolder) {
        variants = new Set<string>();

        if (regexVAR.exec(filename) != null) {
            let raw = filename.split("-");
            while (raw.length > 1) {
                let variant = raw.pop()
                if (variant) {
                    variants.add(variant);
                }
            }
            fixedName = raw[0];

        }
        else {
            variants.add("default")
        }
        return {
            name: fixedName,
            variants: variants
        }

    } else {

        if ((m = regexEXT.exec(filename)) !== null) {
            m.forEach((match) => {
                let n = filename.lastIndexOf(match);
                fixedName = filename.slice(0, n) + filename.slice(n).replace(new RegExp(match, 'i'), '');
                ext = match
            });
        }
        return {
            name: fixedName,
            ext: ext
        }
    }

}

export function build(root: string | ResourceFolder, handler: (err: any, data?: ResourceFolder) => void) {
    var rootNode = root instanceof ResourceFolder ? root : new ResourceFolder("root", root, path.resolve(root))
    fs.readdir(rootNode.fullPath, function (err, list) {
        if (err) return handler(err);

        var pending = list.length;

        if (!pending) return handler(null, rootNode);

        list.forEach(function (file) {
            let fileInfo;
            let fullPath = path.resolve(rootNode.fullPath, file);

            fs.stat(fullPath, function (_err, stat) {
                // If directory, execute a recursive call
                if (stat && stat.isDirectory()) {
                    fileInfo = fileInformer(file, true);
                    let childNode = new ResourceFolder(fileInfo.name, file, fullPath, fileInfo.variants)
                    rootNode.addFolder(childNode)
                    build(childNode, function (_err, _res) {
                        if (!--pending) handler(null, rootNode);
                    });
                } else {
                    fileInfo = fileInformer(file, false);
                    let childNode = new ResourceFile(fileInfo.name, file, fileInfo.ext!, path.relative("./",fullPath))
                    rootNode.addFile(childNode)
                    if (!--pending) handler(null, rootNode);
                }
            });

        });
    });
}