/*
 * gmodule
 * https://github.com/goliatone/gmodule
 *
 * Copyright (c) 2013 goliatone
 * Licensed under the MIT license.
 */
/* jshint strict: false, plusplus: true */
/*global define: false, require: false, module: false, exports: false */
(function (root, name, deps, factory) {
    "use strict";
    if (typeof exports === 'object') {
        // Node
         if(typeof deps === 'function') { 
            factory = deps;
            deps = [];
        }
        module.exports = factory.apply(root, deps.map(require));
    } else if (typeof define === 'function' && 'amd' in define) {
        //require js
        define(name, deps, factory);
    } else {
        // Browser
        var d, i = 0, global = root, old = global[name], mod;
        while((d = deps[i]) !== undefined) deps[i++] = root[d];
        global[name] = mod = factory.apply(global, deps);
        //Export no 'conflict module', aliases the module.
        mod.noConflict = function(){
            global[name] = old;
            return mod;
        };
    }
    //TODO: Get rid of jquery!
}(this, "gmodule", function() {

    //TODO: How do we get a reference to the global object here?
    var _namespace = this; //module.config().namespace || this;
    var _exportName = 'Module'; //module.config().exportName || 'Module';

    var _splice = Array.prototype.splice;

    var _isArray = function(obj){
        return obj.toString() === '[object Array]';
    };

    var _merge = function(a, b){
        for(var p in b){
            if(b.hasOwnProperty(p))
                a[p] = b[p];
        }
        return a;
    };

    var Module = function(name, parent){
        // if(_namespace[name])
            // return name;

        //Lets figure out parent.
        //TODO: Add support for com.domain.Module.
        //parent = parent.split('.');
        //while(target = parent.pop()) parent = _namespace[target];
        parent = parent || Module;

        if(typeof parent === 'string'){
            parent = _namespace[parent];
        }

        var self = function(){
            if( 'init' in this) this.init.apply(this, arguments);
        };

        //Change self proto.
        //TODO: We could/should remove this conditional.
        //parent will always be at least Module.
        if(parent){
            for( var i in parent){
                if(parent.hasOwnProperty(i)){
                    self[i] = Module.clone(parent[i]);
                }
            }

            for( i in parent.prototype){
                if(parent.prototype.hasOwnProperty(i)){
                    self.prototype[i] = Module.clone(parent.prototype[i]);
                }
            }

            var Ctor = function(){
                this.ctor = this.constructor = self;
            };
            Ctor.prototype = parent.prototype;
            self.prototype = new Ctor();

            //We need to create super after proto.
            //self._super = parent;
            self.prototype._super = parent.prototype;

            ///////////////////////////////////////
            //TODO: Should we move this out of the constructor?!
            ///////////////////////////////////////
            //Add default constructor stub method.
            //TODO: Rename?
            self.prototype.init = function(){};

            //Override toString method to display class name.
            self.prototype.toString = function(){
                return "[object "+this.__name__+"]"
            };
        }


    //------------------------------
    // Adding class/static properties: i.e: User.findByPk().
        self.extend = function(obj, target){
            /*target = target || self;
            var extended = obj.extended;
            for(var i in obj){
                if(obj.hasOwnProperty(i))
                    target[i] = obj[i];
            }

            if(extended) extended.call(target,target);
            return self;*/

            var args;
            if(arguments.length > 2 ){
                target = obj;
                args = _splice.call(arguments,0);
            } else {
                args = [obj];
            }

            target = target || self;
            var _extend = function(){
                var extended = obj.extended;
                for(var i in obj){
                    if(obj.hasOwnProperty(i))
                        target[i] = obj[i];
                }

                if(extended) extended.call(target,target);
            };

            var i = 0, t = args.length;
            for(;i<t;i++){
                _extend(args[i]);
            }

            return target;
        };
    //  -----------------------------------
    //  Adding instance properties- user.id = 23;
        /**
         * All properties of the provided object will be
         * copied into the prototype of all Module instances.
         *
         * @access  public
         * @param   Object  Template with properties to include.
         * @return  Object  Instance, fluid interface.
         */
        self.include = function(){
            var _include = function(obj){
                var included = obj.included;
                for(var i in obj){
                    if(obj.hasOwnProperty(i))
                        self.fn[i] = obj[i];
                }
                if(included) included.call(self.fn, self.fn);
            };

            var i = 0, t = arguments.length;
            for(;i<t;i++){
                _include(arguments[i]);
            }

            return self;
        };

        /**
         * Utility method to proxy function calls
         * with the proper scope.
         * Any extra parameters passed to it, will be
         * concatenated into the final call.
         *
         * @access public
         * @param   Function    Function to be proxied.
         * @return  Function    Wrapped function with scope set to self.
         */
        self.proxy = function(func){
            var a = _splice.call(arguments,1);
            var self = this;
            return function(){
                var a2 = _splice.call(arguments,0);
                return func.apply(self, a.concat(a2));
            };
        };


        //shortcuts.
        self.fn = self.prototype;
        self.fn.parent = parent; //TODO: We most likely do not need this, since we have now _super.
        self.fn.proxy  = self.proxy;


        // The class/parent name
        self.prototype.__name__  = self.__name__  = name;
        self.prototype.__class__ = self;

        //Store a reference by name in the provided namespace.
        _namespace[name] = self;

        /**
         * Hook to execute "extending" method on parent
         * after we create module. This allows for DRY
         * "extending" implementations.
         * @see  'the "extending" method allows to DRY extended' in
         *       specs.
         */
        if('extending' in self) self.extending(); 

        return self;
    };

    Module.__name__    = 'Module';
    Module.__version__ = '0.2.1';

    //TODO: Remove?!
    Module.decorator = function(implementation){
        var self = this;
        var Decorator = function(){};
        Decorator.prototype.decorate = function(){
            var i = 0,
                t = arguments.length;
            for(;i < t; i++){
                implementation( arguments[i], this);
            }
        };

        Decorator.prototype.owner = self;

        return new Decorator(self);
    };

    /**
     * Override a method, by default the source object 
     * is the current modules prototype.
     * If the source object is not a Module, we create a _super 
     * object and attach the original method.
     * 
     * 
     * @param  {Function}   src
     * @param  {Function}   method
     * @param  {Function} fn
     * @return {void}
     */
    Module.override = function(method, fn, src){
        src = src || this.prototype;
        if(!('_super' in src)){
            src._super = {};
            src._super[method] = src[method];
        }            
        src[method] = fn;
    };

    /**
     * Utility method to clone an object.
     *
     * @access  public.
     * @param   object  Object to be cloned.
     * @return  object  Cloned object.
     */
    Module.clone = function(src){
        if (typeof src === 'function') return src;
        if (typeof src !== 'object') return src;
        var out = _isArray(src) ? [] : {};
        return _merge(out, src);
    };

    

    /*Module.merge = function(){
        console.log(_splice.call(arguments,0))
        return jQuery.extend.apply(jQuery, _splice.call(arguments,0));
    };*/

    /**
     * Scope in which the module will store all clases,
     * to prevent pollution of the global namespace.
     *
     * @access public
     * @param   object  scoped namespace for the module.
     * @return  object  scoped namespace for the module.
     */
    Module.namespace = function(ns){
        var namespace = ns || _namespace;
        if(!namespace.hasOwnProperty(_exportName))
            namespace[_exportName] = Module;
        return namespace;
    };

/*
    Module.prototype.init = function(){
        console.log('Peperone');
        return 'This is just a stub!';
    };*/

    return Module;
}));