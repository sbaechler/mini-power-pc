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
    // expect(Object.keys(scope.mnemonics).length).toBe(3);
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
  });

  it('should correctly increment and decrement', function(){
     expect(scope.mnemonics.INC()).toBe("00000001 00000000");
     expect(scope.mnemonics.DEC()).toBe("00000100 00000000");
  });

  it('should read from memory and write to memory', function(){
     var a100 = "00 01100100",
         a500 = "01 11110100";
     // assume undefined bit is 0
     expect(scope.mnemonics.LWDD("00","100")).toEqual("010000"+a100);
     expect(scope.mnemonics.LWDD("10","500")).toEqual("010010"+a500);

     expect(scope.mnemonics.SWDD("00", "100")).toEqual("011000"+a100);
     expect(scope.mnemonics.SWDD("01", "500")).toEqual("011001"+a500);
  });

  it('should create shift codes', function(){
      expect(scope.mnemonics.SRA()).toBe("00000101 00000000");
      expect(scope.mnemonics.SLA()).toBe("00001000 00000000");
      expect(scope.mnemonics.SRL()).toBe("00001001 00000000");
      expect(scope.mnemonics.SLL()).toBe("00001100 00000000");
  });

  it('should create logical operator codes', function(){
      expect(scope.mnemonics.AND("00")).toBe("00000010 00000000");
      expect(scope.mnemonics.AND("10")).toBe("00001010 00000000");
      expect(scope.mnemonics.OR("00")).toBe("00000011 00000000");
      expect(scope.mnemonics.OR("10")).toBe("00001011 00000000");
      expect(scope.mnemonics.NOT()).toBe("00000000 10000000");
  });

  it('should create jump commands', function(){
      expect(scope.mnemonics.BZ("00")).toBe("00010010 00000000");
      expect(scope.mnemonics.BNZ("10")).toBe("00011001 00000000");
      expect(scope.mnemonics.BC("00")).toBe("00010011 00000000");
      expect(scope.mnemonics.B("10")).toBe("00011000 00000000");
  });

  it('should create direct jump commands', function(){
      var a100 = "00 01100100",
         a500 = "01 11110100";
      expect(scope.mnemonics.BZD("100")).toBe("00110" + a100);
      expect(scope.mnemonics.BNZD("500")).toBe("00101" + a500);
      expect(scope.mnemonics.BCD("100")).toBe("00111" + a100);
      expect(scope.mnemonics.BD("500")).toBe("00100" + a500);
  });

  it('should create END command', function(){
      expect(scope.mnemonics.END()).toBe("00000000 00000000");
  });




});
