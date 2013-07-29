/*global define:true requirejs:true*/
/* jshint strict: false */
requirejs.config({
    paths: {
        'jquery': '../lib/jquery/jquery',
        'gmodule': '../src/gmodule'
    }
});

define(['gmodule', 'jquery'], function (Gmodule, $) {
    console.log('Loading');
	var gmodule = new Gmodule();
	gmodule.init();
});