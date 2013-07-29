/*
 * gmodule
 * https://github.com/goliatone/gmodule
 *
 * Copyright (c) 2013 goliatone
 * Licensed under the MIT license.
 */
/*global define:true*/
/* jshint strict: false */
define('gmodule', ['jquery'], function($) {

    var Gmodule = function(config){
        console.log('Gmodule: Constructor!');
    };

    Gmodule.prototype.init = function(){
        console.log('Gmodule: Init!');
        return 'This is just a stub!';
    };

    return Gmodule;
});