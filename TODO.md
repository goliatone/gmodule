Remove jQuery dependency, use native or underscore.
Make export to module reusable, so we can export/require it.

```javascript
(function(exports){

    // your code goes here

   exports.test = function(){
        return 'hello world'
    };

})(typeof exports === 'undefined'? this['mymodule']={}: exports);
```