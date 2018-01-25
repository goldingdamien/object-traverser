const {Utility, BaseObjectHelper, BaseArrayHelper} = require('js-functions');

/**
 * Set of functions for searching and traversing objects.
 */
class ObjectTraverser{

      /**
       * Gets obj values as simple key value pairs.
       * Example: {a: {b: 2}, c: 1} => {a_b: 2, c: 1}
       * 
       * Formats:
       * 1. camelCase
       * 2. [DELIMITER KEY]
       * 
       * @param {Object} obj
       * @param {String} format
       * @param {Array} curPath
       * @param {Boolean} useSimpleKeys
       * @return {Array}
       */
      static getKeyedData(obj, format, curPath, useSimpleKeys){
        
        var keys = {};
        var curKeys;
        var arr;
        if(!curPath){
          curPath = [];
        }
      
        //Handle
        var setKeys = function(obj, arr, val){
          var key, cArr;
      
          if(useSimpleKeys){
            //Get simpler keys for easier template creation(CAUTION: Naming conflicts more likely + Slower performance).
            var lastIndex = arr.length - 1;
            for(var i=lastIndex; i>=0; i--){
              cArr = arr.slice(i, arr.length);
              key = BaseArrayHelper.buildDelimiterString(cArr, format);
              obj[key] = val;
            }
          }else{
            key = BaseArrayHelper.buildDelimiterString(arr, format);
            obj[key] = val;
          }
      
          return obj;
        };
      
        for(var key in obj){
          if(BaseObjectHelper.isObject(obj[key])){
            curPath.push(key);
            curKeys = ObjectTraverser.getKeyedData(obj[key], format, curPath, useSimpleKeys);
            curPath.pop();
          }else{
            curKeys = {};
            arr = [].concat(curPath);
            arr.push(key);
            setKeys(curKeys, arr, obj[key]);
          }
      
          //Add to keys
          Object.assign(keys, curKeys);
        }
      
        return keys;
      }
    
      /**
       * Used for checking if in recursion.
       * Pass object + array of looped items to use.
       * 
       * @param {Object} curObj 
       * @param {Array} parents array of parent objects
       * @return {Boolean}
       */
      static inRecursion(curObj, parents){
        return Utility.dataInArray(curObj, parents);
      }
    
      /**
       * Loops object by passing handle that returns value
       * DEPRECATED: Use loopObjectComplex instead. Too many future problems arise without status object.
       * 
       * @param {Object} obj 
       * @param {Function} onItem
       * onItem: function(obj, key, val){
       *  //Change val here. Use isObject(val) if only handling non-objects.
       *  return val;
       * }
       * @param {Array} looped array of checked items to avoid circular object error.
       * @return {Object} Same object 
       */
      static loopObject(obj, onItem, looped){
        /*
        onItem: function(obj, key, val){
          //Change val here. Use isObject(val) if only handling non-objects.
          return val;
        }
        */
        
        //Prevents cyclic reference infinite looping
        if(!looped){
          looped = [];
        }
        
        looped.push(obj);
        
        var returnValue;
        for(var key in obj){
          
          //Nested loop
          if( BaseObjectHelper.isNonDomObject(obj[key])){
            
            if(!Utility.dataInArray(obj[key], looped)){
                ObjectTraverser.loopObject(obj[key], onItem, looped);
            }else{
              //IGNORE
            }
          }
          
          //Handle
          returnValue = onItem(obj, key, obj[key]);
          if(!Utility.equals(returnValue, obj[key])){
            obj[key] = returnValue;
          }
        }
        
        return obj;
      }
    
      /**
       * Complex version of looping object.
       * Passes on all possible data in status object.
       * Will be slower than simple looping object function.
       * Also handles objects in onItem.
       *  
       * @param {Object} obj 
       * @param {Function} onItem 
       * @param {Object} status See status in code.
       * @return {Object} Same object
       */
      static loopObjectComplex(obj, onItem, status){
        
        if(!status){
          status = {
            firstObject: obj,
            looped: [],
            parents: [],
            object: obj,
            key: null,
            value: null,
            path: [],
            level: 0,
            
            //For editing
            returnValue: null,
            delete: false,
            
            //For status change
            exit: false//Exits loop
          };
        }
        
        status.looped.push(obj);
        
        //Object checking
        if(status.object && status.key !== null){
          onItem(status);
        }
        
        //Outer start
        status.parents.push(status.object);
        
        var i = 0;
        var keys = [];
        var checkedKeys = [];
        //Using keys array makes it possible to update keys dynamically.
        //keys = Object.keys(obj);//Problem getting keys in proto.
        keys = BaseObjectHelper.getObjectKeys(obj);
        while(i < keys.length){
          let key = keys[i];
          
          //Duplicate checking
          if(checkedKeys.indexOf(key) >= 0){
            i++;
            continue;
          }else{
            checkedKeys.push(key);
          }
          
          //Update status
          status.object = obj;
          status.key = key;
          status.value = obj[key];
          status.returnValue = status.value;
          status.delete = false;
          
          //Path(start)
          status.path.push(key);
          status.level = status.path.length;
          
          //Nested loop
          if( BaseObjectHelper.isNonDomObject(obj[key]) ){
            
            //if(!dataInArray(obj[key], status.looped)){//This will cause bugs if the same data exists. Changed to checking recursion via parents.
            if(!ObjectTraverser.inRecursion(status.value, status.parents)){
              ObjectTraverser.loopObjectComplex(obj[key], onItem, status);
            }else{
              //IGNORE
            }
          }
          
          else{
            onItem(status);
            
            //Exit
            if(status.exit){
              return obj;
            }
            
            //Deleting
            if(status.delete){
              delete obj[key];
            }
            
            //Value changing
            else if(!Utility.equals(status.value, status.returnValue)){
              obj[key] = status.returnValue;
            }
          }
          
          //Path(end)
          status.path.pop();
          status.level = status.path.length;
          
          //Key
          keys = Object.keys(obj);
          i = 0;
        }
        
        //Outer end  
        status.parents.pop();
        
        return obj;
      }
      
      /**
       * Deeply loops object looking for value of key.
       * 
       * @param {Object} obj 
       * @param {*} key 
       * @return {*} value
       */
      static getKeyValueFromObject(obj, key){
        var value = null;
        ObjectTraverser.loopObjectComplex(obj, function(status){
          if(status.key === key){
            value = status.value;
            status.exit = true;
          }
        });
        
        return value;
      }
    
      /**
       * Gets data by path level
       * 
       * @param {Object} obj 
       * @param {Number} level 
       * @param {Object} options See in code.
       * @return {*} returned data
       */
      static getDataByPathLevel(obj, level, options){
        //level = path length
        if(!options){
          options = {
            condition: null,
            objectKeys: false
          };
        }
        
        var returnData = [];
        ObjectTraverser.loopObjectComplex(obj, function(status){
          if(status.level === level){
            if(options.condition && !options.condition(status.value)){return false;}
            
            if(options.objectKeys){
              returnData[status.key] = status.value;
            }else{
              returnData.push(status.value);
            }
          }
        });
        
        return returnData;
      }
    
      /**
       * Deeply copies object.
       * 
       * @param {Object} obj 
       * @return {Object} copied object
       */
      static deepCopyObject(obj){//??Needs test
        var copy = {};
        ObjectTraverser.loopObjectComplex(obj, function(status){
            ObjectTraverser.setObjectValue(copy, status.path, status.value);
        });

        return copy;
      }
    
      /**
       * Object helper function for generating data for object.
       * Can be used for tests where the format is known but the data can be anything.
       * 
       * @param {Object} obj 
       * @return {Object}
       */
      static populateObjectWithTestData(obj){
        //obj assumed to have keys with no meaningful values
        var i=0;
        return ObjectTraverser.loopObjectComplex(obj, function(status){
          status.returnValue = "Test value(" + status.key + " " + i + ")";
          i++;
        });
      }

      /**
       * Gets object by path
       * 
       * @param {Object} obj Passed in object
       * @param {Array} pathArr Array path(does not include object or value)
       * @param {*} defaultValue Optional default value to use if can not find
       * @return {*}
       */
      static getObjectValue(obj, pathArr, defaultValue=null){
        var last = ObjectTraverser.traverseObjectPath(obj, pathArr);
        if(last === null && arguments.length === 3){//defaultValue handling
          return defaultValue;
        }else{
          return last;
        }
      }
      
      /**
       * Sets value to object by following path
       * 
       * @param {Object} obj 
       * @param {Array} pathArr 
       * @param {*} val 
       */
      static setObjectValue(obj, pathArr, val){
        var onLast = function(curObj, curKey, curVal){
          curObj[curKey] = val;
          return true;
        };
        return ObjectTraverser.traverseObjectPath(obj, pathArr, onLast);
      }
      
      /**
       * Traverses path of object
       * 
       * @param {Object} obj 
       * @param {Array} pathArr 
       * @param {Function} onLast Executed on last in path 
       * @return {*} return value of onLast function
       */
      static traverseObjectPath(obj, pathArr, onLast){
        var curObj = obj;
        var curVal;
        var defaultVal = null;
        var returnVal = defaultVal;
        for(var i=0; i<pathArr.length; i++){
          
          if(BaseObjectHelper.isObject(curObj) && Object.keys(curObj).indexOf(pathArr[i]) >= 0){
            curVal = curObj[ pathArr[i] ];
          }else{
            curVal = defaultVal;
          }
          
          if(i+1 === pathArr.length){  
            if(onLast){
              returnVal = onLast(curObj, pathArr[i], curVal);
            }else{
              returnVal = curVal;
            }
          }
          
          else{
            curObj = curVal;
          }
        }
        
        return returnVal;
      }
}

module.exports = ObjectTraverser;