'use strict';

angular.module('memoryProvider', [], function($provide){
    $provide.factory('$memory', function(){
       var MEMORYSIZE = 1024,
           wordmatch = /^[01]{8} [01]{8}$/,
           memory = Array(MEMORYSIZE);
       return {
           MEMORY: MEMORYSIZE,
           _validateAddr: function(addr){
                    if (addr < 0) { throw("Invalid memory address") }
                    else if (addr > MEMORYSIZE-1) { throw("Out of memory error")}
           },
           memory :    function(start, end){ return memory.slice(start, end); },
           setWord : function(addr, value) {
                       this._validateAddr(addr);
                       if(!value.match(wordmatch)) {
                           throw("Can only save words (16 bit strings)")
                       }
                       value = value.split(' ');
                       memory[addr] = value[0];
                       memory[addr+1] = value[1];
                       },
           getWord : function(addr){
                       this._validateAddr(addr);
                       if(memory[addr] != undefined) {
                           return memory[addr]+" "+memory[addr+1];
                       } else {
                           return "";
                       }

           },
           getDecimal: function(addr){
                        this._validateAddr(addr);
                        if(addr%2){ return "" }
                        else {
                            return sysconv.bin2dec(this.getWord(addr));
                        }
           }
       };
    });
});
