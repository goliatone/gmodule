/*global define:true*/
/*global describe:true */
/*global it:true */
/*global expect:true */
/*global beforeEach:true */
/* jshint strict: false */
define(['gmodule', 'jquery'], function(Gmodule, $) {
    var Animal, Dog;

    var g = {};
    g.Module = Gmodule;

    describe('just checking', function() {

        beforeEach(function(){
            Animal = g.Module('Animal').extend({
                animalType:function(){
                    return 'Animal';
                }
            }).include({
                type:'Animal',
                init:function(){
                    //nothing here
                },
                makeNoise:function(){
                    return 'parent';
                }
            });
            Dog = g.Module('Dog','Animal').include({
                init:function(name){
                    this.name = name;

                    if('init' in this._super)
                        this._super.init(arguments);
                },
                bark:function(){
                    return this.name;
                },
                getName:function(){
                    return this.name;
                },
                callSuper:function(){
                    return this._super.makeNoise();
                }
            });
            spyOn(Animal, 'animalType');
        });

        it('Gmodule shold be loaded', function() {
            expect(Gmodule).toBeTruthy();
            var Animal = g.Module('Animal');
            expect(Animal).toBeTruthy();
        });

        it('Gmodule shold initialize', function() {
            var Animal = g.Module('Animal');
            expect(Animal).toBeTruthy();
            var gmodule = new Animal();
            var output   = gmodule.init();
            var expected = 'This is just a stub!';
            expect(output).toEqual(expected);
        });

    });

});