'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('miniPowerPCControllers'));
  beforeEach(module('memoryProvider'));
  beforeEach(module('sysconvProvider'));

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

   //test LWDD Rnr, #Adr
   // it('Mnemonic LWDD Rnr, #Adr test', function(){
     //   scope.r00 = "00000000 00000000";
     //   _$memory_.setWord("500", "00000000 11111110");
    //   scope.instructionRegister = "01010000 11111110";
    //    scope._interpret();
    //    expect(scope.r00).toEqual("00000000 11111110");


    //});

    //test SLA
    it('Mnemonic SLA test', function(){
        scope.r00 = "00000000 00000000";
        scope.carryBit = true;
        scope.instructionRegister = "00001000 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("00000000 00000000");
        expect(scope.carryBit).toBe(false);

        scope.r00 = "00000000 00000010";
        scope.carryBit = true;
        scope.instructionRegister = "00001000 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("00000000 00000100");
        expect(scope.carryBit).toBe(false);

        scope.r00 = "00000000 00000011";
        scope.instructionRegister = "00001000 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("00000000 00000110");
        expect(scope.carryBit).toBe(false);

        scope.r00 = "11111111 11001110";  // -50
        scope.instructionRegister = "00001000 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("11111111 10011100");
        expect(scope.carryBit).toBe(true);

        scope.r00 = "11000001 10000000";  // -16 000
        scope.instructionRegister = "00001000 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("10000011 00000000");
        expect(scope.carryBit).toBe(true);
    });

    it("should store numbers as string in memory", function(){
        scope.speicherWert = "10";
        scope.storeValue(500);
        expect(scope.get_memory(500, 502)).toEqual(["00000000", "00001010"]);
    });
    it("should store numbers as number in memory", function(){
        scope.speicherWert = 10;
        scope.storeValue(500);
        expect(scope.get_memory(500, 502)).toEqual(["00000000", "00001010"]);
    });

    it('should logically shift right', function(){
        scope.r00 = "00000000 00001111";
        scope.instructionRegister = "00001001 10000000"; // SRL
        scope._interpret();
        expect(scope.r00).toEqual("00000000 00000111");
        expect(scope.carryBit).toBe(true);
        // negative value
        scope.r00 = "11111111 10011100";  // -100
        scope._interpret();
        expect(scope.r00).toEqual("01111111 11001110");
        expect(scope.carryBit).toBe(false);
    });
    it('should logically shift left', function(){
        scope.r00 = "00000000 00001111";
        scope.instructionRegister = "00001100 10000000"; // SLL
        scope._interpret();
        expect(scope.r00).toEqual("00000000 00011110");
        expect(scope.carryBit).toBe(false);
        scope.r00 = "11111111 10011100";  // -100
        scope._interpret();
        expect(scope.r00).toEqual("11111111 00111000");
        expect(scope.carryBit).toBe(true);
    });
    it('Mnemonic SRA test', function(){
        scope.r00 = "00000000 00000000";
        scope.carryBit = true;
        scope.instructionRegister = "00000101 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("00000000 00000000");
        expect(scope.carryBit).toBe(false);

        scope.r00 = "00000000 00000010";
        scope.carryBit = true;
        scope.instructionRegister = "00000101 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("00000000 00000001");
        expect(scope.carryBit).toBe(false);

        scope.r00 = "00000000 00000011";
        scope.carryBit = false;
        scope.instructionRegister = "00000101 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("00000000 00000001");
        expect(scope.carryBit).toBe(true);

        scope.r00 = "11111111 10011100";  // -100
        scope.instructionRegister = "00000101 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("11111111 11001110"); // -50
        expect(scope.carryBit).toBe(false);

        scope.r00 = "10000011 00000000";  // -32 000
        scope.instructionRegister = "00000101 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("11000001 10000000"); // -16 000
        expect(scope.carryBit).toBe(false);
    });
    it('can binary ADD', function(){
        scope.r00 = "01010101 00000000";
        scope.r01 = "00101010 11111111";
        scope.instructionRegister = "00000110 00000000";
        scope._interpret();
        expect(scope.r00).toEqual("01111111 11111111");
    });

});
