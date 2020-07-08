"use strict";
const { Utility, BaseObjectHelper, BaseArrayHelper } = require('js-functions');
class ObjectTraverser {
    static getKeyedData(obj, format, curPath, useSimpleKeys) {
        let keys = {};
        let curKeys = {};
        var arr;
        if (!curPath) {
            curPath = [];
        }
        var setKeys = function (obj, arr, val) {
            var key, cArr;
            if (useSimpleKeys) {
                var lastIndex = arr.length - 1;
                for (var i = lastIndex; i >= 0; i--) {
                    cArr = arr.slice(i, arr.length);
                    key = BaseArrayHelper.buildDelimiterString(cArr, format);
                    obj[key] = val;
                }
            }
            else {
                key = BaseArrayHelper.buildDelimiterString(arr, format);
                obj[key] = val;
            }
            return obj;
        };
        for (var key in obj) {
            if (BaseObjectHelper.isObject(obj[key])) {
                curPath.push(key);
                curKeys = ObjectTraverser.getKeyedData(obj[key], format, curPath, useSimpleKeys);
                curPath.pop();
            }
            else {
                curKeys = {};
                arr = [...curPath];
                arr.push(key);
                setKeys(curKeys, arr, obj[key]);
            }
            Object.assign(keys, curKeys);
        }
        return keys;
    }
    static inRecursion(curObj, parents) {
        return Utility.dataInArray(curObj, parents);
    }
    static loopObject(obj, onItem, looped = []) {
        if (!looped) {
            looped = [];
        }
        looped.push(obj);
        var returnValue;
        for (var key in obj) {
            if (BaseObjectHelper.isNonDomObject(obj[key])) {
                if (!Utility.dataInArray(obj[key], looped)) {
                    ObjectTraverser.loopObject(obj[key], onItem, looped);
                }
                else {
                }
            }
            returnValue = onItem(obj, key, obj[key]);
            if (!Utility.equals(returnValue, obj[key])) {
                obj[key] = returnValue;
            }
        }
        return obj;
    }
    static initializeLoopStatus(obj, status = {}) {
        if (typeof status !== 'object') {
            status = {};
        }
        const loopStatus = {
            firstObject: obj,
            looped: [],
            parents: [],
            object: obj,
            key: '',
            value: null,
            path: [],
            level: 0,
            returnValue: null,
            delete: false,
            exit: false
        };
        for (let key in status) {
            if (loopStatus[key] !== undefined) {
                loopStatus[key] = status[key];
            }
        }
        return loopStatus;
    }
    static loopObjectComplex(obj, onItem, status = undefined) {
        status = ObjectTraverser.initializeLoopStatus(obj, status);
        status.looped.push(obj);
        if (status.object && status.key !== null) {
            onItem(status);
        }
        status.parents.push(status.object);
        var i = 0;
        var checkedKeys = [];
        var keys = BaseObjectHelper.getObjectKeys(obj);
        while (i < keys.length) {
            let key = keys[i];
            if (checkedKeys.indexOf(key) >= 0) {
                i++;
                continue;
            }
            else {
                checkedKeys.push(key);
            }
            status.object = obj;
            status.key = key;
            status.value = obj[key];
            status.returnValue = status.value;
            status.delete = false;
            status.path.push(key);
            status.level = status.path.length;
            if (BaseObjectHelper.isNonDomObject(obj[key])) {
                if (!ObjectTraverser.inRecursion(status.value, status.parents)) {
                    ObjectTraverser.loopObjectComplex(obj[key], onItem, status);
                }
                else {
                }
            }
            else {
                onItem(status);
                if (status.exit) {
                    return obj;
                }
                if (status.delete) {
                    delete obj[key];
                }
                else if (!Utility.equals(status.value, status.returnValue)) {
                    obj[key] = status.returnValue;
                }
            }
            status.path.pop();
            status.level = status.path.length;
            keys = Object.keys(obj);
            i = 0;
        }
        status.parents.pop();
        return obj;
    }
    static getLastValues(obj) {
        var lastValues = {};
        ObjectTraverser.loopObjectComplex(obj, function (status) {
            if (typeof status.value !== 'object') {
                lastValues[status.key] = status.value;
            }
        });
        return lastValues;
    }
    static getKeyValueFromObject(obj, key) {
        var value = null;
        ObjectTraverser.loopObjectComplex(obj, function (status) {
            if (status.key === key) {
                value = status.value;
                status.exit = true;
            }
        });
        return value;
    }
    static getDataByPathLevel(obj, level, options) {
        if (!options) {
            options = {
                condition: null,
                objectKeys: false
            };
        }
        var returnData = [];
        ObjectTraverser.loopObjectComplex(obj, function (status) {
            if (status.level === level) {
                if (options.condition && !options.condition(status.value)) {
                    return false;
                }
                if (options.objectKeys) {
                    returnData[status.key] = status.value;
                }
                else {
                    returnData.push(status.value);
                }
            }
        });
        return returnData;
    }
    static deepCopyObject(obj) {
        var copy = {};
        ObjectTraverser.loopObjectComplex(obj, function (status) {
            ObjectTraverser.setObjectValue(copy, status.path, status.value);
        });
        return copy;
    }
    static populateObjectWithTestData(obj) {
        var i = 0;
        return ObjectTraverser.loopObjectComplex(obj, function (status) {
            status.returnValue = 'Test value(' + status.key + ' ' + i + ')';
            i++;
        });
    }
    static getObjectValue(obj, pathArr, defaultValue = null) {
        var last = ObjectTraverser.traverseObjectPath(obj, pathArr);
        if (last === null && arguments.length === 3) {
            return defaultValue;
        }
        else {
            return last;
        }
    }
    static setObjectValue(obj, pathArr, val) {
        var onLast = function (curObj, curKey) {
            curObj[curKey] = val;
            return true;
        };
        var onItem = function (curObj, curKey) {
            if (curObj[curKey] === undefined) {
                curObj[curKey] = {};
            }
        };
        return ObjectTraverser.traverseObjectPath(obj, pathArr, {
            onLast: onLast,
            onItem: onItem
        });
    }
    static traverseObjectPath(obj, pathArr, options = undefined) {
        if (typeof options === 'function') {
            options = {
                onLast: options
            };
        }
        else if (typeof options !== 'object') {
            options = {};
        }
        var onLast = options.onLast;
        var onItem = options.onItem;
        var curObj = obj;
        var curVal;
        var DEFAULT_VALUE = null;
        var returnVal = DEFAULT_VALUE;
        for (var i = 0; i < pathArr.length; i++) {
            if (onItem) {
                onItem(curObj, pathArr[i]);
            }
            if (BaseObjectHelper.isObject(curObj) && Object.keys(curObj).indexOf(pathArr[i]) >= 0) {
                curVal = curObj[pathArr[i]];
            }
            else {
                curVal = DEFAULT_VALUE;
            }
            if (i + 1 === pathArr.length) {
                if (onLast) {
                    returnVal = onLast(curObj, pathArr[i], curVal);
                }
                else {
                    returnVal = curVal;
                }
            }
            else {
                curObj = curVal;
            }
        }
        return returnVal;
    }
}
module.exports = ObjectTraverser;
