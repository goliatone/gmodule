/*global define:true requirejs:true*/
/* jshint strict: false */
requirejs.config({
    paths: {
        'jquery': 'jquery/jquery',
        'gmodule': 'gmodule'
    }
});

define(['gmodule', 'jquery'], function (Gmodule, $) {
    console.log('Loading');
    var g = {};
    g.Module = Gmodule;

	var Animal = g.Module('Test').include({
        type:'Animal',
        init:function(){
            //nothing here
        },
        makeNoise:function(){
            return 'Yo, this is a simple bump';
        }
    });

    var dog = new Animal();
    console.log(dog.makeNoise());
});