'use strict';

angular.module('memoryProvider', ['sysconvProvider'], function($provide){
    $provide.factory('$memory', ['$sysconv', function($sysconv){
       var MEMORYSIZE = 1024,
           wordmatch = /^[01]{8} [01]{8}$/,
           listeners = [],
           memory = Array(MEMORYSIZE);
       return {
           MEMORY: MEMORYSIZE,
           _validateAddr: function(addr){
                    if (addr < 0) { throw("Invalid memory address"); }
                    else if (addr > MEMORYSIZE-1) { throw("Out of memory error"); }
                    return parseInt(addr);
           },
           memory :    function(start, end){ return memory.slice(start, end); },
           setMemory:  function(addr, value){
                            var addr = this._validateAddr(addr);
                            memory[addr] = value;
                        },
           setWord : function(addr, value) {
                       var addr = this._validateAddr(addr);
                       if(!value.match(wordmatch)) {
                           throw("Can only save words (16 bit strings): " + value);
                       }
                       value = value.split(' ');
                       memory[addr] = value[0];
                       memory[addr+1] = value[1];
                       },
           getWord : function(addr){
                       var addr = this._validateAddr(addr);
                       if(memory[addr] !== undefined) {
                           return ""+memory[addr]+" "+memory[addr+1];
                       }
                       return "";

           },
           getDecimal: function(addr){
                        var addr = this._validateAddr(addr);
                        if(addr%2){ return "" }
                        return parseInt($sysconv.bin2dec(this.getWord(addr)));
           },
           setDecimal: function(addr, value){
               if(addr%2){ return false; }
               this.setWord(addr, $sysconv.bintobinoutput(
                   $sysconv.dec2twoscomplement(value.toString())));
           },
           listen: function(callback){
                       listeners.push(callback);
           },
           notify: function(){
                       listeners.forEach(function(callback){
                           callback();
                       });
           },
           wipe: function(){
               memory = Array(MEMORYSIZE);
           }
       };
    }]);
});
