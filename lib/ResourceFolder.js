"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var ResourceItem = /** @class */ (function () {
    function ResourceItem(name, path, fullPath) {
        this.name = name;
        this.path = path;
        this.fullPath = fullPath || path;
    }
    return ResourceItem;
}());
var ResourceFolder = /** @class */ (function (_super) {
    __extends(ResourceFolder, _super);
    function ResourceFolder(name, path, fullPath, variants) {
        if (variants === void 0) { variants = new Set(["default"]); }
        var _this = _super.call(this, name, path, fullPath) || this;
        _this.__variants = variants;
        _this.files = [];
        _this.folders = [];
        return _this;
    }
    ResourceFolder.prototype.addFile = function (file) {
        this.files.push(file);
    };
    ResourceFolder.prototype.addFolder = function (folder) {
        this.folders.push(folder);
    };
    ResourceFolder.prototype.toJSON = function () {
        return {
            name: this.name,
            path: this.path,
            fullPath: this.fullPath,
            __variants: Array.from(this.__variants),
            files: this.files,
            folders: this.folders,
        };
    };
    return ResourceFolder;
}(ResourceItem));
exports.ResourceFolder = ResourceFolder;
var ResourceFile = /** @class */ (function (_super) {
    __extends(ResourceFile, _super);
    function ResourceFile(name, path, extention, fullPath) {
        var _this = _super.call(this, name, path, fullPath) || this;
        _this.extention = extention;
        return _this;
    }
    ResourceFile.prototype.toJSON = function () {
        return {
            name: this.name,
            path: this.path,
            fullPath: this.fullPath,
            extention: this.extention
        };
    };
    return ResourceFile;
}(ResourceItem));
exports.ResourceFile = ResourceFile;
function fileInformer(filename, isFolder) {
    var regexEXT = /\.[^;]*/;
    var regexVAR = /(?=\S*[-])([a-zA-Z-]+)/;
    var m;
    var fixedName = filename;
    var ext;
    var variants;
    if (isFolder) {
        variants = new Set();
        if (regexVAR.exec(filename) != null) {
            var raw = filename.split("-");
            while (raw.length > 1) {
                var variant = raw.pop();
                if (variant) {
                    variants.add(variant);
                }
            }
            fixedName = raw[0];
        }
        else {
            variants.add("default");
        }
        return {
            name: fixedName,
            variants: variants
        };
    }
    else {
        if ((m = regexEXT.exec(filename)) !== null) {
            m.forEach(function (match) {
                var n = filename.lastIndexOf(match);
                fixedName = filename.slice(0, n) + filename.slice(n).replace(new RegExp(match, 'i'), '');
                ext = match;
            });
        }
        return {
            name: fixedName,
            ext: ext
        };
    }
}
function build(root, handler) {
    var rootNode = root instanceof ResourceFolder ? root : new ResourceFolder("root", root, path_1.default.resolve(root));
    fs_1.default.readdir(rootNode.fullPath, function (err, list) {
        if (err)
            return handler(err);
        var pending = list.length;
        if (!pending)
            return handler(null, rootNode);
        list.forEach(function (file) {
            var fileInfo;
            var fullPath = path_1.default.resolve(rootNode.fullPath, file);
            fs_1.default.stat(fullPath, function (_err, stat) {
                // If directory, execute a recursive call
                if (stat && stat.isDirectory()) {
                    fileInfo = fileInformer(file, true);
                    var childNode = new ResourceFolder(fileInfo.name, file, fullPath, fileInfo.variants);
                    rootNode.addFolder(childNode);
                    build(childNode, function (_err, _res) {
                        if (!--pending)
                            handler(null, rootNode);
                    });
                }
                else {
                    fileInfo = fileInformer(file, false);
                    var childNode = new ResourceFile(fileInfo.name, file, fileInfo.ext, fullPath);
                    rootNode.addFile(childNode);
                    if (!--pending)
                        handler(null, rootNode);
                }
            });
        });
    });
}
exports.build = build;
