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
        expect(scope.carryBit).toBe(false);

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
        expect(scope.carryBit).toBe(false);

        scope.r00 = "00000000 00000000";
        scope.instructionRegister = "00000111 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("00000000 11111111");
        expect(scope.carryBit).toBe(false);

        scope.r00 = "00000000 00000000";
        scope.instructionRegister = "00001011 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("00000000 11111111");
        expect(scope.carryBit).toBe(false);

        scope.r00 = "00000000 00000000";
        scope.instructionRegister = "00001111 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("00000000 11111111");
        expect(scope.carryBit).toBe(false);

        scope.r00 = "11111111 11111111"; // -1
        scope.r11 = "11111111 11111111"; // -1
        scope.instructionRegister = "00001111 10000000";
        scope._interpret();
        expect(scope.carryBit).toBe(false);
        expect(scope.r00).toEqual("11111111 11111110");  // -2

        // Negative und Overflow
        scope.r01 = "01111111 11111111"; // 32 767
        scope.r10 = "11111111 11110110"; // -10
        scope.r11 = "00000000 00001010"; // 10
        scope.carryBit = false;

        scope.r00 = "01111111 11111111"; // 32 767
        scope.instructionRegister = "00000111 10000000";
        scope._interpret();
        expect(scope.carryBit).toBe(true);

        scope.r00 = "00000000 00001010"; // 10
        scope.instructionRegister = "00001011 10000000"; // -10
        scope._interpret();
        expect(scope.carryBit).toBe(false);
        expect(scope.r00).toEqual("00000000 00000000");

    });
    it('can ADDD a number from memory', function(){
        scope.r00 = "00000000 00001010"; // 10
        scope.instructionRegister = "10000000 00000001"; // 1
        scope._interpret();
        expect(scope.carryBit).toBe(false);
        expect(scope.r00).toEqual("00000000 00001011");

        scope.r00 = "11111111 11110110"; // -10
        scope.instructionRegister = "10000000 00001010"; // 10
        scope._interpret();
        expect(scope.carryBit).toBe(false);
        expect(scope.r00).toEqual("00000000 00000000");

        scope.r00 = "01000000 00000001"; // 16 385
        scope.instructionRegister = "10111111 11111111"; // 32 767
        scope._interpret();
        expect(scope.carryBit).toBe(true);
    });
    it('can increment', function(){
        scope.r00 = "00000000 00001010"; // 10
        scope.instructionRegister = "00000001 00000001";
        scope._interpret();
        expect(scope.carryBit).toBe(false);
        expect(scope.r00).toEqual("00000000 00001011"); //11

        scope.r00 = "01111111 11111111";
        scope.instructionRegister = "00000001 00000001";
        scope._interpret();
        expect(scope.carryBit).toBe(true);

        scope.r00 = "11111111 11111111";  //-1
        scope.instructionRegister = "00000001 00000001";
        scope._interpret();
        expect(scope.carryBit).toBe(false);
        expect(scope.r00).toEqual("00000000 00000000");
    });

    it('can decrement', function(){
        scope.r00 = "00000000 00001010"; // 10
        scope.instructionRegister = "00000100 00000001";
        scope._interpret();
        expect(scope.carryBit).toBe(false);
        expect(scope.r00).toEqual("00000000 00001001"); //9

        scope.r00 = "10000000 00000000"; // -32768
        scope.instructionRegister = "00000100 00000001";
        scope._interpret();
        expect(scope.carryBit).toBe(true);

        scope.r00 = "00000000 00000000";
        scope.instructionRegister = "00000100 00000001";
        scope._interpret();
        expect(scope.carryBit).toBe(false);
        expect(scope.r00).toEqual("11111111 11111111");
    });
    it('can load from memory', function(){
        scope.speicherWert = "20";
        scope.storeValue(500);
        scope.r00 = "00000000 00000000";
        scope.instructionRegister = "01000001 11110100";
        scope._interpret();
        expect(scope.r00).toEqual("00000000 00010100")
    });
    it('can write to memory', function(){
        scope.r00 = "00000000 00010100";
        scope.instructionRegister = "01100001 11110110";
        scope._interpret();
        expect(scope.get_decimal(502)).toBe(20);
    });

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
    it('can binary AND', function(){
        scope.r00 = "01010101 00000000";
        scope.r01 = "00101010 11111111";
        scope.instructionRegister = "00000110 00000000";
        scope._interpret();
        expect(scope.r00).toEqual("00000000 00000000");
        scope.r00 = "11111111 11111111"; // -1
        scope.r01 = "10101010 10101010"; // 1
        scope.instructionRegister = "00000110 00000000";  // 0
        scope._interpret();
        expect(scope.r00).toEqual("10101010 10101010");
    });
    it('can binary OR', function(){
        scope.r00 = "01010101 00000000";
        scope.r01 = "00101010 11111111";
        scope.instructionRegister = "00000111 00000000";
        scope._interpret();
        expect(scope.r00).toEqual("01111111 11111111");
        scope.r00 = "00000000 11111111"; // -1
        scope.r01 = "10101010 10101010"; // 1
        scope.instructionRegister = "00000111 00000000";  // 0
        scope._interpret();
        expect(scope.r00).toEqual("10101010 11111111");
    });
    it('can binary NOT', function(){
        scope.r00 = "01010101 00000000";
        scope.instructionRegister = "00000000 10000000";
        scope._interpret();
        expect(scope.r00).toEqual("10101010 11111111");
    });
    it('can BZ', function(){
       scope.instructionCounter = "00000000 01100100"; // 100
       scope.r00 = "00000000 00000000";
       scope.r01 = "00000000 01111000"; // 120
       scope.instructionRegister = "00010110 00000000";
       scope._interpret();
       expect(scope.instructionCounter).toEqual("00000000 01111000"); //120
       scope.instructionCounter = "00000000 01100100"; // 100
       scope.r00 = "00000000 00000001";
       scope.r01 = "00000000 01111000"; // 120
       scope.instructionRegister = "00010110 00000000";
       scope._interpret();
       expect(scope.instructionCounter).toEqual("00000000 01100100"); //100
    });
    it('can BNZ', function(){
       scope.instructionCounter = "00000000 01100100"; // 100
       scope.r00 = "00000000 00000000";
       scope.r01 = "00000000 01111000"; // 120
       scope.instructionRegister = "00010101 00000000";
       scope._interpret();
       expect(scope.instructionCounter).toEqual("00000000 01100100"); //100
       scope.instructionCounter = "00000000 01100100"; // 100
       scope.r00 = "00000000 00000001";
       scope.r01 = "00000000 01111000"; // 120
       scope.instructionRegister = "00010101 00000000";
       scope._interpret();
       expect(scope.instructionCounter).toEqual("00000000 01111000"); //120
    });
    it('can BC', function(){
       scope.instructionCounter = "00000000 01100100"; // 100
       scope.r01 = "00000000 01111000"; // 120
       scope.carryBit = true;
       scope.instructionRegister = "00010111 00000000";
       scope._interpret();
       expect(scope.instructionCounter).toEqual("00000000 01111000"); // 120
       scope.instructionCounter = "00000000 01100100"; // 100
       scope.r01 = "00000000 01111000"; // 120
       scope.carryBit = false;
       scope.instructionRegister = "00010111 00000000";
       scope._interpret();
       expect(scope.instructionCounter).toEqual("00000000 01100100"); // 100
    });
    it('can B', function(){
       scope.instructionCounter = "00000000 01100100"; // 100
       scope.r01 = "00000000 01111000"; // 120
       scope.instructionRegister = "00010100 00000000";
       scope._interpret();
       expect(scope.instructionCounter).toEqual("00000000 01111000"); // 120
    });
    it('can BZD', function(){
       scope.instructionCounter = "00000000 01100100"; // 100
       scope.r00 = "00000000 00000000";
       scope.instructionRegister = "00110000 01111000"; //BZD 120
       scope._interpret();
       expect(scope.instructionCounter).toEqual("00000000 01111000"); // 120
       scope.instructionCounter = "00000000 01100100"; // 100
       scope.r00 = "00000000 00000001";
       scope.instructionRegister = "00110000 01111000"; //BZD 120
       scope._interpret();
       expect(scope.instructionCounter).toEqual("00000000 01100100"); // 100
    });
    it('can BNZD', function(){
       scope.instructionCounter = "00000000 01100100"; // 100
       scope.r00 = "00000000 00000001";
       scope.instructionRegister = "00101000 01111000"; //BNZD 120
       scope._interpret();
       expect(scope.instructionCounter).toEqual("00000000 01111000"); // 120
       scope.instructionCounter = "00000000 01100100"; // 100
       scope.r00 = "00000000 00000000";
       scope.instructionRegister = "00101000 01111000"; //BNZD 120
       scope._interpret();
       expect(scope.instructionCounter).toEqual("00000000 01100100"); // 100
    });
    it('can BCD', function(){
       scope.instructionCounter = "00000000 01100100"; // 100
       scope.carryBit = true
       scope.instructionRegister = "00111000 01111000"; //BCD 120
       scope._interpret();
       expect(scope.instructionCounter).toEqual("00000000 01111000"); // 120
       scope.instructionCounter = "00000000 01100100"; // 100
       scope.carryBit = false
       scope.instructionRegister = "00111000 01111000"; //BCD 120
       scope._interpret();
       expect(scope.instructionCounter).toEqual("00000000 01100100"); // 100
    });
    it('can BD', function(){
       scope.instructionCounter = "00000000 01100100"; // 100
       scope.instructionRegister = "00100000 01111000"; //BD 120
       scope._interpret();
       expect(scope.instructionCounter).toEqual("00000000 01111000"); // 120
    });
    it('can END', function(){
       scope.stop = false;
       scope.instructionRegister = "00000000 00000000"; //BD 120
       scope._interpret();
       expect(scope.stop).toBe(true);
    });

});
