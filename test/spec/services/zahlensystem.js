'use strict';

describe('Controller: sysconvProvider', function () {
  // load the controller's module
  var sysconv;

  // Load the module first
  beforeEach(module('sysconvProvider'));

  // Inject the assembler Service into the namespace
  beforeEach(inject(function ($sysconv) {
    sysconv = $sysconv;
  }));

    it("should convert twoscomplement to decimal", function(){
       expect(sysconv.twoscomplement2dec("00000000 11111111")).toBe(255);
       expect(sysconv.twoscomplement2dec("11111111 00000001")).toBe(-255);
       expect(sysconv.twoscomplement2dec("00000000 00000000")).toBe(0);
       expect(sysconv.twoscomplement2dec("00111110 10000000")).toBe(16000);
       expect(sysconv.twoscomplement2dec("11000001 10000000")).toBe(-16000);
       expect(sysconv.twoscomplement2dec("01111111 11111111")).toBe(32767);
       expect(sysconv.twoscomplement2dec("10000000 00000001")).toBe(-32767);
    });



});