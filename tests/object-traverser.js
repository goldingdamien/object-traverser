const chai = require('chai');
const {expect} = chai;

const ObjectTraverser = require('../object-traverser');

describe('object-traverser.js', function(){
    describe("#Traversing", function(){
        
        var obj = {
          a: {
            a: {},
            b: null,
            c: {
              a: {
                obj: 3
              },
              b: [
                1,
                2,
                {
                  arr: 2
                },
                4
              ]
            },
            d: 2
          },
          b: {}
        };
        var objPath = ["a", "c", "a", "obj"];
        var arrPath = ["a", "c", "b", 2, "arr"];
        
        var readableObj = {
          a: {
            b: {
              a: 1,
              b: 2,
              c: null
            },
            c: true
          },
          b: false,
          hello: {
            world: {
              again: 5
            },
            array: [
              2,
              3
            ]
          }
        };
        
        describe('#getObjectValue()', function() {
          it('Returns value at path array', function() {
            val = ObjectTraverser.getObjectValue(obj, objPath); expect(val).to.equal(3);
            val = ObjectTraverser.getObjectValue(obj, arrPath); expect(val).to.equal(2);
          });
        });
    
        describe('#setObjectValue()', function() {
          it('Sets value at path array', function() {
            ObjectTraverser.setObjectValue(obj, objPath, 4); expect(obj.a.c.a.obj).to.equal(4);
            ObjectTraverser.setObjectValue(obj, arrPath, 4); expect(obj.a.c.b[2].arr).to.equal(4);
          });
        });
        
        describe('#loopObject()', function() {
          it('Loops objects without complexity', function() {
            
            var hasVal = false;
            
            ObjectTraverser.loopObject(readableObj, function(obj, key, val){
              if(val === 2){hasVal = true;}
              return val;//required
            });
            
            expect(hasVal).to.equal(true);
          });
        });
        
        describe('#loopObjectComplex()', function() {
          it('Loop object allowing any possible interaction', function() {
            
            var hasPath = false;
            var hasVal = false;
            
            ObjectTraverser.loopObjectComplex(readableObj, function(status){
              if(status.path.length > 0){hasPath = true;}
              if(status.value === 2){hasVal = true;}
            });
            
            expect(hasPath).to.equal(true);
            expect(hasVal).to.equal(true);
          });
        });
        
        describe('#getKeyedData()', function() {
          it('Loops object, transforming data into key value pairs.', function() {
            
            val = ObjectTraverser.getKeyedData(readableObj, "camelCase", null, false);//non-simple camel case
            expect(val["helloWorldAgain"]).to.equal(5);//Object
            //expect(val["helloArray1"]).to.equal(3);//Array(support should be added)
            
            val = ObjectTraverser.getKeyedData(readableObj, "-", null, false);//non-simple delimiter
            expect(val["hello-world-again"]).to.equal(5);//Others assumed same.
            
            val = ObjectTraverser.getKeyedData(readableObj, "camelCase", null, true);//simple camel case
            expect(val["helloWorldAgain"]).to.equal(5);//non-simple
            expect(val["again"]).to.equal(5);//simple
          });
        });
      });
});