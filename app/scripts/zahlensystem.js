// view-source:http://manderc.manderby.com/concepts/umrechner/index.php

sysconv = {

    // Removes all prefixing zeros from the binary array.
    removezeros: function(bin){
      var i = 0;
      while((i < bin.length) && (!bin[i])){i++;}
      if(i == bin.length){
        return this.filledarray(false, 1);
      }else{
        return bin.slice(i);
      }
    },

    // Computes a binary array out of a decimal input string
    decinputtobin: function(decinput){
      var len = decinput.length;
      if(len == 0){return this.filledarray(false, 1);}
      var bin = new Array();
      var digit = new Array(4);
      for (var i = 0; i < len; i++){
        switch (decinput[i]){
        case '0': digit[0] = false; digit[1] = false; digit[2] = false; digit[3] = false; break;
        case '1': digit[0] = false; digit[1] = false; digit[2] = false; digit[3] = true;  break;
        case '2': digit[0] = false; digit[1] = false; digit[2] = true;  digit[3] = false; break;
        case '3': digit[0] = false; digit[1] = false; digit[2] = true;  digit[3] = true;  break;
        case '4': digit[0] = false; digit[1] = true;  digit[2] = false; digit[3] = false; break;
        case '5': digit[0] = false; digit[1] = true;  digit[2] = false; digit[3] = true;  break;
        case '6': digit[0] = false; digit[1] = true;  digit[2] = true;  digit[3] = false; break;
        case '7': digit[0] = false; digit[1] = true;  digit[2] = true;  digit[3] = true;  break;
        case '8': digit[0] = true;  digit[1] = false; digit[2] = false; digit[3] = false; break;
        case '9': digit[0] = true;  digit[1] = false; digit[2] = false; digit[3] = true;  break;
        default: continue;
        }
        bin = this.binadd(this.binten(bin), digit);
      }
      return this.removezeros(bin);
    },
    // Computes a binary array out of a binary input string
    bininputtobin : function(bininput){
      var len = bininput.length;
      if(len == 0){return filledarray(false, 1);}
      var bin = new Array(len);
      var j = 0;
      for (var i = 0; i < len; i++){
        switch (bininput[i]){
        case '0': bin[j++] = false; break;
        case '1': bin[j++] = true; break;
        default: break;
        }
      }
      return removezeros(bin.slice(0, j));
    },
    // Formats the given binary array to a decimal output string
    bintodecoutput: function(bin){
      var len = bin.length;
      var decoutput = String();
      var work = new Array(len);
      var outputlen = 0;
      for(var i=0; i<len; i++){work[i] = bin[i];}
      while(len){
        // as long as a remaining value exists
        var lead = false;
        var bit0;
        var bit1;
        var bit2;
        var bit3;
        var value;
        var i = 0;
        while(i < len-3){
          // walk through the remaining value
          bit0 = work[i+3];
          bit1 = work[i+2];
          bit2 = work[i+1];
          bit3 = work[i+0];
          value = (bit3<<3) | (bit2<<2) | (bit1<<1) | (bit0<<0);
          if(value >= 10){
            // For nibbles greaterequal than 10, adjust the bits accordingly.
            work[i+0] = true; work[i+1] = bit2 && bit1; work[i+2] = !bit1;
          }else{
            work[i+0] = lead;
            if(lead){
              // When the previous nibble was 8 or 9, adjust the bits accordingly
              work[i+1] = !bit1; work[i+2] = !bit1;
              lead = bit1;
            }else{
              // otherwise, just leave the bits as they are.
              if(value >= 8){lead = true;}
            }
          }
          i++;
        }
        // extract the decimal value of the remaining bits
        if(len==1){
          bit0 = work[0];
          bit1 = false;
          bit2 = false;
        }else if(len==2){
          bit0 = work[1];
          bit1 = work[0];
          bit2 = false;
        }else{
          bit0 = work[i + 2];
          bit1 = work[i + 1];
          bit2 = work[i + 0];
        }
        bit3 = lead;
        var value = (bit3<<3) | (bit2<<2) | (bit1<<1) | (bit0<<0);
        if(!(outputlen%3)){decoutput = ' ' + decoutput;}
        decoutput = value + decoutput;
        outputlen++;
        len = i;
      }
      // Remove zeros
      var i = 0;
      outputlen = decoutput.length;
      while((i < outputlen) && ((decoutput[i] == '0') || (decoutput[i] == ' '))){i++;}
      if(i == outputlen){
        return "0";
      }else{
        return decoutput.slice(i);
      }
    },

    // Formats the given binary array to a binary output string
    bintobinoutput: function(bin){
      var len = bin.length;
      var binoutput = String();
      for(var i=0; i<len; i++){
        if((i > 0) && !(i%8)){binoutput = " " + binoutput;}
        if(bin[len - 1 - i]){binoutput = "1" + binoutput;}else{binoutput = "0" + binoutput;}
      }
      // todo: make faster
      return binoutput;
    },

    // Returns an array of a given size filled with the given value.
    filledarray: function(value, size){
      var a = new Array(size);
      for(var i=0; i<size; i++){a[i] = value;}
      return a;
    },

    // Addition of two binary arrays
    binadd: function(bin1, bin2){
      var i1 = bin1.length;
      var i2 = bin2.length;
      var i3 = (i1 > i2) ? (i1 + 1) : (i2 + 1);
      var result = new Array(i3);
      var c = 0;
      // Add the two arrays as long as there exist elements in the arrays
      while((i1 > 0) && (i2 > 0)){
        i1--;
        i2--;
        i3--;
        if(bin1[i1]){c++;}
        if(bin2[i2]){c++;}
        result[i3] = (c%2) ? true : false;
        c >>= 1;
      }
      // copy the remaining elements
      if(i1){
        for(var i=0; i<i1; i++){result[i+1] = bin1[i];}
      }else{
        for(var i=0; i<i2; i++){result[i+1] = bin2[i];}
      }
      // add the remaining carry
      var carry = c ? true : false;
      while(c && (i3 > 1)){
        i3--;
        result[i3] = !result[i3];
        c = !result[i3];
      }
      // Return result with carry if necessary
      if (c==1){
        result[0] = true;
        return result;
      }else{
        return result.slice(1);
      }
    },

    // Addition of 1 to a binary array
    binaddone: function(bin){
      var len = bin.length;
      var result = new Array(len + 1);
      var c = true;   // carry bit
      var i = len;   // i points at the bit in bin one after the untouched bit
      while(c && (i > 0)){
        i--;
        c = bin[i];
        result[i+1] = !c;
      }
      if(i){
        // Return remaining untouched bin concatenated with the touched bits
        return bin.slice(0, i).concat(result.slice(i+1));
      }else{
        if(c){
          // Return full result with carry as prefix
          result[0] = true;
          return result;
        }else{
          // Return result without carry
          return result.slice(1);
        }
      }
    },

    // Multiplication of a binary array with 10 (Ten)
    binten: function(bin){
      var len = bin.length;
      var result = new Array(len + 4);
      result[len + 3] = false;
      result[len + 2] = bin[len - 1];
      result[len + 1] = bin[len - 2];
      var cnum = 0;
      var c = false
      for(var i=len - 1; i>=2; i--){
        var a = bin[i];
        var b = bin[i-2];
        result[i + 1] = a ^ b ^ c;
    //    c = (a & b) | (a & c) | (b & c);
        cnum = a + b + c;
        c = (cnum>>1) ? true : false;
      }
      result[2] = bin[1] ^ c;
      c = bin[1] & c;
      result[1] = bin[0] ^ c;
      c = bin[0] & c;
      if(c){
        result[0] = true;
        return result;
      }else{
        return result.slice(1);
      }
    },

    // Either truncates the binary array or fills the MSBs with 0 to fit the size.
    bintruncate: function(bin, size){
      var len = bin.length;
      if(len < size){
        return this.filledarray(false, size-len).concat(bin);
      }else{
        return bin.slice(len - size);
      }
    },

    // Computes the one's complement of the binary number
    onescomplement: function(bin){
      var len = bin.length;
      var onebin = new Array(len);
      for (var i=0; i<len; i++){onebin[i] = !bin[i];}
      return onebin;
    },

    // Computes the two's complement of the given binary one's complement
    twoscomplement: function(binonecomplement){
      return this.binaddone(binonecomplement);
    },

    dec2twoscomplement: function(dec, size){
        var size = size || 16;
        var bin = this.decinputtobin(dec);
        if (dec[0] === '-'){
            return this.twoscomplement(this.onescomplement(this.bintruncate(bin, size)));
        } else {
            return this.bintruncate(bin, size);
        }
    },
    bin2dec: function(bininput){
        return bintodecoutput(bininputtobin(bininput));
    }
}
