'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('miniPowerPCControllers'));
  beforeEach(module('memoryProvider'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _$memory_, $sysconv) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope,
      $sysconv: $sysconv,
      $memory: _$memory_
    });
  }));

  it('should set the instruction counter to 100', function () {
    expect(scope.instructionCounter).toBe(100);
  });

    //test CLR Rnr
    it('all register should be 00000000 00000000', function(){
        //Mnemonic: /^0000([01]{2})101[01]{7}$/
        scope.r00 = "00000000 11111111";
        scope.r01 = "00000000 11111111";
        scope.r10 = "00000000 11111111";
        scope.r11 = "00000000 11111111";

        //set 00000000 00000000 in Akku
        scope.instructionRegister = "00000010 10000000";
        scope._interpret();

        //set 00000000 00000000 in register 1
        scope.instructionRegister = "00000110 10000000";
        scope._interpret();

        //set 00000000 00000000 in register 2
        scope.instructionRegister = "00001010 10000000";
        scope._interpret();

        //set 00000000 00000000 in register 3
        scope.instructionRegister = "00001110 10000000";
        scope._interpret();

        expect(scope.r00).toEqual("00000000 00000000");
        expect(scope.r01).toEqual("00000000 00000000");
        expect(scope.r10).toEqual("00000000 00000000");
        expect(scope.r11).toEqual("00000000 00000000");
    });

    //test ADD Rnr
    it('Mnemonic Add Rnr test', function(){
        //Mnemonic: /0000([01]{2})111[01]{7}$/
        scope.r01 = "00000000 11111111";
        scope.r10 = "00000000 11111111";
        scope.r11 = "00000000 11111111";

        //Akku ADD akku schould be 00000000 00000000
        scope.r00 = "00000000 00000000";
        scope.instructionRegister = "00000011 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("00000000 00000000");

        scope.r00 = "00000000 00000000";
        scope.instructionRegister = "00000111 10000000";
        scope._interpret();
        expect(scope.r01).toEqual("00000000 11111111");

        scope.r00 = "00000000 00000000";
        scope.instructionRegister = "00001011 10000000";
        scope._interpret();
        expect(scope.r10).toEqual("00000000 11111111");

        scope.r00 = "00000000 00000000";
        scope.instructionRegister = "00001111 10000000";
        scope._interpret();
        expect(scope.r11).toEqual("00000000 11111111");

        scope.r00 = "11111111 11111111";
        scope.r11 = "11111111 11111111";
        scope.instructionRegister = "00001111 10000000";
        scope._interpret();
        //TODO
        //expect(scope.r11).toEqual("00000000 11111111");

    });

});
