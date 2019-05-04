declare abstract class ResourceItem {
    name: string;
    path: string;
    fullPath: string;
    constructor(name: string, path: string, fullPath?: string);
}
export declare class ResourceFolder extends ResourceItem {
    __variants: Set<string>;
    files: ResourceFile[];
    folders: ResourceFolder[];
    constructor(name: string, path: string, fullPath?: string, variants?: Set<string>);
    addFile(file: ResourceFile): void;
    addFolder(folder: ResourceFolder): void;
    toJSON(): {
        name: string;
        path: string;
        fullPath: string;
        __variants: string[];
        files: ResourceFile[];
        folders: ResourceFolder[];
    };
}
export declare class ResourceFile extends ResourceItem {
    extention: string;
    constructor(name: string, path: string, extention: string, fullPath?: string);
    toJSON(): {
        name: string;
        path: string;
        fullPath: string;
        extention: string;
    };
}
export declare function build(root: string | ResourceFolder, handler: (err: any, data?: ResourceFolder) => void): void;
export {};
