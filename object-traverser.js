const {Utility, BaseObjectHelper, BaseArrayHelper} = require('js-functions');

/**
 * Set of functions for searching and traversing objects.
 */
class ObjectTraverser{
    
      static getKeyedData(obj, format, curPath, useSimpleKeys){
        /*
        Gets obj values as simple key value pairs.
        Example: {a: {b: 2}, c: 1} => {a_b: 2, c: 1}
        
        Formats:
        1. camelCase
        2. [DELIMITER KEY]
        */
      
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
            curKeys = ObjectSearcher.getKeyedData(obj[key], format, curPath, useSimpleKeys);
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
    
      static inRecursion(curObj, parents){//array of parent objects
        return Utility.dataInArray(curObj, parents);
      }
    
      static loopObject(obj, onItem, looped){
        /*
        DEPRECATED: Use loopObjectComplex instead. Too many future problems arise without status object.
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
                ObjectSearcher.loopObject(obj[key], onItem, looped);
            }else{
              //IGNORE
            }
          }
          
          //Handle
          returnValue = onItem(obj, key, obj[key]);
          if(!equals(returnValue, obj[key])){
            obj[key] = returnValue;
          }
        }
        
        return obj;
      }
    
      static loopObjectComplex(obj, onItem, status){
        /*
        Complex version of looping object.
        Passes on all possible data in status object.
        Will be slower than simple looping object function.
        Also handles objects in onItem.
        */
        
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
          key = keys[i];
          
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
            if(!ObjectSearcher.inRecursion(status.value, status.parents)){
              ObjectSearcher.loopObjectComplex(obj[key], onItem, status);
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
            else if(!equals(status.value, status.returnValue)){
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
      
      static getKeyValueFromObject(obj, key){
        var value = null;
        ObjectSearcher.loopObjectComplex(obj, function(status){
          if(status.key === key){
            value = status.value;
            status.exit = true;
          }
        });
        
        return value;
      }
    
      static getDataByPathLevel(obj, level, options){
        //level = path length
        if(!options){
          options = {
            condition: null,
            objectKeys: false
          };
        }
        
        var returnData = [];
        ObjectSearcher.loopObjectComplex(obj, function(status){
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
    
      static deepCopyObject(obj){//??Needs test
        var copy = {};
        ObjectSearcher.loopObjectComplex(obj, function(status){
            BaseObjectHelper.setObjectValue(copy, status.path, status.value);
        });
      }
    
      static populateObjectWithTestData(obj){
        //obj assumed to have keys with no meaningful values
        var i=0;
        return ObjectSearcher.loopObjectComplex(obj, function(status){
          status.returnValue = "Test value(" + status.key + " " + i + ")";
          i++;
        });
      }

      static getObjectValue(obj, pathArr, defaultValue){
        var last = BaseObjectHelper.traverseObjectPath(obj, pathArr);
        if(last === null && arguments.length === 3){//defaultValue handling
          return defaultValue;
        }else{
          return last;
        }
      }
      
      static setObjectValue(obj, pathArr, val){
        var onLast = function(curObj, curKey, curVal){
          curObj[curKey] = val;
          return true;
        };
        return BaseObjectHelper.traverseObjectPath(obj, pathArr, onLast);
      }
      
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