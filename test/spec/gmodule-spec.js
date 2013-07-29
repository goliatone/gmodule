/*global define:true*/
/*global describe:true */
/*global it:true */
/*global expect:true */
/*global beforeEach:true */
/* jshint strict: false */
define(['gmodule', 'jquery'], function(Gmodule, $) {

    describe('just checking', function() {

        it('Gmodule shold be loaded', function() {
            expect(Gmodule).toBeTruthy();
            var gmodule = new Gmodule();
            expect(gmodule).toBeTruthy();
        });

        it('Gmodule shold initialize', function() {
            var gmodule = new Gmodule();
            var output   = gmodule.init();
            var expected = 'This is just a stub!';
            expect(output).toEqual(expected);
        });
        
    });

});