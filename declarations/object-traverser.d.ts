export = ObjectTraverser;
declare class ObjectTraverser {
    static getKeyedData(obj: {
        [x: string]: any;
    }, format: string, curPath: string[], useSimpleKeys: boolean): {
        [x: string]: string;
    };
    static inRecursion(curObj: Object, parents: ({
        [x: string]: any;
    }[])): boolean;
    static loopObject(obj: {
        [x: string]: any;
    }, onItem: Function, looped?: ({
        [x: string]: any;
    })[]): Object;
    static initializeLoopStatus(obj: object, status?: {
        [x: string]: any;
    }): LoopStatus;
    static loopObjectComplex(obj: {
        [x: string]: any;
    }, onItem: (arg0: LoopStatus) => any, status?: LoopStatus | undefined): Object;
    static getLastValues(obj: Object): Object;
    static getKeyValueFromObject(obj: Object, key: any): any;
    static getDataByPathLevel(obj: Object, level: number, options: PathLevelOptions): any;
    static deepCopyObject(obj: Object): Object;
    static populateObjectWithTestData(obj: Object): Object;
    static getObjectValue(obj: Object, pathArr: string[], defaultValue?: any, ...args: any[]): any;
    static setObjectValue(obj: Object, pathArr: string[], val: any): any;
    static traverseObjectPath(obj: {
        [x: string]: any;
    }, pathArr: string[], options?: PathOptions | Function | undefined): any;
}
declare namespace ObjectTraverser {
    export { LoopStatus, PathLevelOptions, Dictionary, PathOptions };
}
type LoopStatus = {
    [x: string]: any;
};
type PathLevelOptions = {
    condition: Function | null;
    objectKeys: boolean;
};
type PathOptions = {
    [x: string]: any;
};
type Dictionary = {
    [x: string]: any;
};
//# sourceMappingURL=object-traverser.d.ts.map