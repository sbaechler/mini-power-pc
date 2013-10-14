'use strict';

describe('Controller: AssemblerCtrl', function () {
  // load the controller's module
  beforeEach(module('miniPowerpcApp'));

  var AssemblerCtrl,
      scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AssemblerCtrl = $controller('AssemblerCtrl', {
      $scope: scope
    });
  }));

  it('should have a mnemonics object', function () {
    expect(Object.keys(scope.mnemonics).length).toBe(3);
  });

  it('should clear the right register', function(){
     var r00, r01, r10, r11;
     r00 = scope.mnemonics.CLR("00");
     r01 = scope.mnemonics.CLR("01");
     r10 = scope.mnemonics.CLR("10");
     r11 = scope.mnemonics.CLR("11");
     expect(r00).toEqual("00000010 10000000");
     expect(r01).toEqual("00000110 10000000");
     expect(r10).toEqual("00001010 10000000");
     expect(r11).toEqual("00001110 10000000");
  });

  it('should add the right register', function(){
     var r00, r01, r10, r11;
     r00 = scope.mnemonics.ADD("00");
     r01 = scope.mnemonics.ADD("01");
     r10 = scope.mnemonics.ADD("10");
     r11 = scope.mnemonics.ADD("11");
     expect(r00).toEqual("00000011 10000000");
     expect(r01).toEqual("00000111 10000000");
     expect(r10).toEqual("00001011 10000000");
     expect(r11).toEqual("00001111 10000000");
  });

  it('should add the right constant', function(){
      var a255 = scope.mnemonics.ADDD("255");
      var a_255 = scope.mnemonics.ADDD("-255");
      var a0 = scope.mnemonics.ADDD("0");
      var a_1 = scope.mnemonics.ADDD("-1");
      var a16383 = scope.mnemonics.ADDD("16383");
      var a_16384 = scope.mnemonics.ADDD("-16384");
      expect(a255).toEqual("10000000 11111111");
      expect(a_255).toEqual("11111111 00000001");
      expect(a0).toEqual("10000000 00000000");
      expect(a_1).toEqual("11111111 11111111");
      expect(a16383).toEqual("10111111 11111111");
      expect(a_16384).toEqual("11000000 00000000");
  })



});
