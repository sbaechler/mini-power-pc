'use strict';

describe('Controller: MemoryCtrl', function () {
  // load the controller's module
  var memory, MEMORYSIZE;

  // Load the module first
  beforeEach(module('memoryProvider'));

  // Inject the assembler Service into the namespace
  beforeEach(inject(function ($memory) {
    memory = $memory;
    MEMORYSIZE = memory.MEMORY;
  }));

    it("should have a memory array", function(){
       expect(memory.memory().length).toBe(MEMORYSIZE);
    });

    it("should set words", function(){
        var word = "00000000 00001010";
        memory.setWord(500, word);
        expect(memory.memory(500,502)).toEqual(["00000000", "00001010"]);

    });
    it("should get words", function(){
        var word = "00000000 00001010";
        memory.setMemory(500, "00000000");
        memory.setMemory(501, "00001010");
        expect(memory.getWord(500)).toEqual(word);
        expect(memory.getWord(400)).toEqual("");
//        expect(memory.getWord(501)).toThrow("Invalid memory address");
//        expect(memory.getWord(2000)).toThrow("Out of memory error");
    });
    it("should set and get words", function(){
        var word = "00000000 00001010";
        memory.setWord(500, word);
        expect(memory.getWord(500)).toEqual(word);
    });
    it("should set and get decimals", function(){
        memory.setDecimal(400, 10);
        memory.setDecimal(410, "20");
        expect(memory.getDecimal(400)).toBe(10);
        expect(memory.getDecimal(410)).toBe(20);
    });


});

