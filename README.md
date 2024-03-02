# Description

Object traversing and searching.

THE CODE IN THIS REPOSITORY HAS BEEN DELETED.
ATTEMPTING TO IMPORT THIS LIBRARY WILL RESULT IN AN ERROR.

This library has been removed due to better alternatives generally being available. See below.

## Alternatives

- traverseObjectPath: Use [json pointer](https://github.com/manuelstofer/json-pointer) OR [dot-object](https://github.com/rhalff/dot-object). See "getObjectValue".
- setObjectValue: `dot.str(path, value, obj)` ※ [dot-object](https://github.com/rhalff/dot-object)
- getObjectValue: `dot.pick(path, obj)` ※ [pick-a-value-using-dot-notation](https://github.com/rhalff/dot-object?tab=readme-ov-file#pick-a-value-using-dot-notation)
- populateObjectWithTestData: schema to defaults: ajv validate adds defaults[ajv assigning-defaults](https://ajv.js.org/guide/modifying-data.html#assigning-defaults). Also [json-schema-faker](https://github.com/json-schema-faker/json-schema-faker). Object to schema: [to-json-schema](https://github.com/ruzicka/to-json-schema)
- deepCopyObject: [rfdc](https://www.npmjs.com/package/rfdc) ["deep copy" search on npm](https://www.npmjs.com/search?q=deep%20copy) For JSON serializable objects: `JSON.parse(JSON.stringify(obj, null, 2))`
- getDataByPathLevel: Calculate via "." and "[" count: [convert-object-to-dotted-keyvalue-pair](https://github.com/rhalff/dot-object?tab=readme-ov-file#convert-object-to-dotted-keyvalue-pair)
- getKeyValueFromObject: "getKeyedData" and filter by key with text after last "." or "]" which ever is last.
- getLastValues: Use values where key does not include "." or "[" or "]": [convert-object-to-dotted-keyvalue-pair](https://github.com/rhalff/dot-object?tab=readme-ov-file#convert-object-to-dotted-keyvalue-pair)
- loopObjectComplex: [js-traverse](https://github.com/ljharb/js-traverse) [object-traversal](https://github.com/DevimalPlanet/object-traversal)
- getKeyedData: `dot.dot(obj)` ※ [convert-object-to-dotted-keyvalue-pair](https://github.com/rhalff/dot-object?tab=readme-ov-file#convert-object-to-dotted-keyvalue-pair) Use "_" as separator for same functionality: [tab=readme-ov-file#using-a-different-separator](https://github.com/rhalff/dot-object?tab=readme-ov-file#using-a-different-separator)
