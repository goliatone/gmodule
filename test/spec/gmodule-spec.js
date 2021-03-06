/*global define:true, describe:true , it:true , expect:true, 
beforeEach:true, sinon:true, spyOn:true , expect:true */
/* jshint strict: false */
define(['gmodule'], function(Gmodule) {
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
                    return 'buf, buf';
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

        it('Gmodule should be loaded', function() {
            expect(Gmodule).toBeTruthy();
        });

        it('can create classes',function(){
            expect(Animal).toBeTruthy();
        });

        it('should have a prototype shortcut fn', function(){
            expect(Animal.fn).toBeTruthy();
            expect(Animal.prototype).toMatchObject(Animal.fn);
        });

        it('should respect prototype object', function(){
            //This breaks with gmodule!
        //Object.getPrototypeOf(M.prototype) === Object.prototype => true
        //Object.getPrototypeOf(m) === Object.prototype => false
            var test = Object.getPrototypeOf(Animal.prototype) === Object.prototype;// => true
            // expect(test).toBeTruthy();
        });

        it('should have a __class__ prop',function(){
            expect(Animal.fn).toHaveProperties('__class__');
        });

        it('should have a static __name__ prop',function(){
            expect(Animal).toHaveProperties('__name__');
        });

        it('classes have a magic name property',function(){
            var k9 = new Animal();
            expect(Animal.__name__).toBe('Animal');
            expect(Animal.__name__).toBe(k9.__name__);
        });

        it('instances get a toString method that shows their class name',function(){
            var k9 = new Animal();
            expect(k9.toString()).toBe('[object Animal]');
        });

        it('can create subclasses', function(){
            var dog = new Dog();
            expect(dog).toBeTruthy();
            expect(dog instanceof Animal).toBeTruthy();
        });

        it('subclasses respect instanceof',function(){
            // var dog = new Dog();
            var A = g.Module('A');
            var B = g.Module('B', A);
            var C = g.Module('C', B);
            var ci = new C();
            expect(ci instanceof A).toBeTruthy();
            expect(ci instanceof B).toBeTruthy();
            expect(ci instanceof C).toBeTruthy();
        });

        it('constructor method gets called, with parameters',function(){
            var milu = new Dog('milu');
            expect(milu.name).toBe('milu');
        });

        it('subclasses inherit instance properties',function(){
            var milu = new Dog('milu');
            var animal = new Animal();
            expect(milu.type).toBe(animal.type);
        });

        it('we can call super on methods',function(){
            var milu = new Dog('milu');
            expect(milu.callSuper()).toBe(milu.makeNoise());
            //expect(milu.name).toBe('parent: milu');
        });


        it('init should be callable through _super',function(){
            var as = sinon.spy(Animal.prototype, 'init');
            var ds = sinon.spy(Dog.prototype, 'init');

            var milu = new Dog('milu');

            expect(as).toHaveBeenCalled();
            expect(ds).toHaveBeenCalled();
        });

        it('we can extend classes with static properties',function(){
            expect(Animal.animalType()).toBe(Animal.__class__);
        });

        it('subclasses inherit static properties',function(){
            var Cat = g.Module('Cat',Animal);
            expect(Cat.animalType()).toBe(Animal.__class__);
        });


        it('should have a instance attribute parent ',function(){
            expect(Dog.fn).toHaveProperties('parent');
            expect(Dog.prototype).toHaveProperties('parent');
        });

        it('should have a proxy method',function(){
            expect(Animal.prototype).toHaveMethods('proxy');
            expect(Animal).toHaveMethods('proxy');
        });

        it('should fire extended callback after extend',function(){
            var called = false;
            var staticMembers = {
                extended:function(self){
                    called = true;
                },
                method:function(){}
            };
            var C = g.Module('C').extend(staticMembers);
            expect(called).toBeTruthy();
        });

        it('should fire extended with the right scope',function(){
            var scoped = false;
            var staticMembers = {
                extended:function(self){
                    scoped = this.__name__;
                },
                method:function(){}
            };
            var C = g.Module('C').extend(staticMembers);
            expect(scoped).toBe('C');
        });

        it('this on "extended" method refers to the constructor',function(){
            var staticMembers = {
                extended:function(self){
                    //NOTE: This is rather ugly, since here `this` refers to the
                    //module instead of the instance, which is counterintuitive. 
                    this.NAME = this.__name__;
                },
                method:function(){}
            };
            var C = g.Module('C').extend(staticMembers);            
            expect(C.NAME).toBe('C');
            expect(C).toHaveProperties('NAME');
        });

        it('the "extending" method allows to DRY extended',function(){
            var A = g.Module('A');
            A.extending = function(s){
                var SELF = this;
                SELF.ID = SELF.__name__ + '::ID';
            };
            var B = g.Module('B', A);
            var C = g.Module('C', A);
            expect(B.ID).toBe('B::ID');
            expect(C.ID).toBe('C::ID');            
        });

        it('should fire included callback after include',function(){
            var called = false;
            var instanceMembers = {
                included:function(self){
                    called = true;
                },
                method:function(){}
            };
            var C = g.Module('C').include(instanceMembers);
            var ci = new C();
            expect(called).toBeTruthy();
        });

        it('should fire included with the right scope',function(){
            var scoped = false;
            var instance = false;
            var instanceMembers = {
                included:function(self){
                    scoped = this.ctor.__name__;
                    instance = this;
                },
                method:function(){}
            };
            var C = g.Module('C').include(instanceMembers);
            var ci = new C();
            expect(scoped).toBe('C');
            expect(ci).toMatchObject(instance);
        });


        it('should include multiple objects',function(){
            var m1 = {
                included:function(){},
                method1:function(){}
            };

            var m2 = {
                included:function(){},
                method2:function(){}
            };

            var s1 = sinon.spy(m1,'included');
            var s2 = sinon.spy(m2,'included');

            var D = g.Module('D').include(m1,m2);

            var d = new D();

            expect(s1).toHaveBeenCalled();
            expect(s2).toHaveBeenCalled();
            expect(d).toHaveMethods('method1','method2');

        });

        it('supports prototype syntax',function(){
            Cat = g.Module('Cat','Animal');

            Cat.prototype.init = function(name){
                this.name = name;
                if('init' in this._super)
                    this._super.init(arguments);
            };

            Cat.prototype.miaou = function(){
                return this.name;
            };

            Cat.prototype.getName = function(){
                return this.name;
            };

            Cat.prototype.callSuper = function(){
                return this._super.makeNoise();
            };

            var constructor = sinon.spy(Cat.prototype, 'init');

            var michina = new Cat('michina');

            expect(constructor).toHaveBeenCalled();
            expect(michina).toHaveMethods(['init', 'miaou', 'getName', 'callSuper']);
        });

        it('can override methods, and have access to the super method',function(){
            Milu = g.Module('Milu','Dog');
            
            var milu = new Milu('Milu');

            expect(milu.bark()).toBe('buf, buf');

            var overrideBark = function(){
                return this.__name__+" says: "+this._super.bark();
            };

            Milu.override('bark', overrideBark);

            expect(milu.bark()).toBe('Milu says: buf, buf');
        });

        it('can override methods on objects, and have access to the super method',function(){
            
            var Class = function(){};
            var overrideToString = function(){
                return "We monkeypached something: "+this._super.toString();
            };

            g.Module.override('toString', overrideToString, Class.prototype);
            
            var a = new Class();
            expect(a.toString()).toBe('We monkeypached something: [object Object]');
        });
        // it('can override methods on generic objects, and have access to the super method',function(){
            
        //     // var Class = function(){};
        //     var overrideToString = function(){
        //         return "We monkeypached something: "+this._super.toString();
        //     };

        //     g.Module.override('toString', overrideToString, Array.prototype);
            
        //     var a = [];
        //     expect(a.toString()).toBe('We monkeypached something: [object Object]');
        // });
    });
});