'use strict';
var miniPowerPCControllers = angular.module('miniPowerPCControllers', []);

miniPowerPCControllers.controller('MainCtrl', ['$scope', '$memory', '$sysconv',
    function MainCtrl($scope, $memory, $sysconv) {
        console.log("Power PC ready. Memory: " + $memory.memory().length + " Bytes.");

        $scope.r00 = null;  // Akku
        $scope.r01 = null;  // R01
        $scope.r10 = null;  // R02
        $scope.r11 = null;  // R03
        $scope.speicherWert = null; // Temp. Variable bei Direkteingabe von Werten.
        $scope.instructionCounter = 100;
        $scope.instructionRegister = null;
        $scope.carryBit = 0;
        $scope.assemblerCommands =  [
            {"name": "CLR Rnr", "regex": /^0000([01]{2})101[01]{7}$/, "assemblerFunction": function(matches) {
                    $scope['r'+matches[1]] = "00000000 00000000";
                }},

            {"name": "ADD Rnr", "regex": /^0000([01]{2})111[01]{7}$/, "assemblerFunction": function(matches) {
                    var regValue = $sysconv.bintodecoutput($scope['r'+matches[1]]);
                    var akkuValue = $sysconv.bintodecoutput($scope.r00);
                    var result = regValue+akkuValue;

                    $scope.r00 = $sysconv.decinputtobin(result);
                }},

            {"name": "ADDD #Zahl", "regex": /^1([01]{15})$/,  "assemblerFunction": function(matches) {
                var akkuValue = $sysconv.bininputtobin($scope.r00);
                var zahl = $sysconv.bininputtobin(matches[1]);
                var result = $sysconv.binadd(akkuValue, zahl);
                $scope.r00 = $sysconv.bintobinoutput(result);
                }
            },

            {"name": "INC", "regex": /^00000001[01]{8}$/, "assemblerFunction": function(matches) {
                $scope.r00 = $sysconv.binarray2word($sysconv.binaddone(
                                            $sysconv.bininputtobin($scope.r00)));
                }},
            {"name": "DEC", "regex": /^00000100[01]{8}$/, "assemblerFunction": function(matches) {
                }},

            {"name": "LWDD Rnr, #Adr", "regex": /^010[01]{1}([01]{2})([01]{10})$/, "assemblerFunction": function(matches) {
                    var addrInDec = $scope.get_decimal(matches[2]);
                    var arrayOfAdress = $scope.get_memory(addrInDec, addrInDec+1);

                    $scope['r'+matches[1]] = ""+arrayOfAdress[0]+" "+arrayOfAdress[1];
            }},


            {"name": "SWDD Rnr, #Adr", "regex": /^011[01]{1}([01]{2})([01]{10})$/, "assemblerFunction": function(matches) {
                   var regValue = $scope['r'+matches[1]];
                   var address = $sysconv.bintodecoutput(matches[2]);
                   $memory.setWord(address, regValue);
            }},
            {"name": "SRA", "regex": /^00000101[01]{8}$/, "assemblerFunction": function(matches) {
            }},
            {"name": "SLA", "regex": /^00001000[01]{8}$/,"assemblerFunction": function(matches) {
                     $scope.r00 = $scope.binten($scope.r00);
            }},
            {"name": "SRL Rnr", "regex": /^00001001[01]{8}$/, "assemblerFunction": function(matches) {
            }},
            {"name": "SLL Rnr", "regex": /^00001101[01]{8}$/, "assemblerFunction": function(matches) {
            }},

            {"name": "AND Rnr", "regex": /^0000[01]{2}100[01]{7}$/, "assemblerFunction": function(matches) {
            }},
            {"name": "OR Rnr", "regex": /^0000[01]{2}110[01]{7}$/, "assemblerFunction": function(matches) {
            }},
            {"name": "NOT", "regex": /^000000001[01]{7}$/, "assemblerFunction": function(matches) {
            }},

            {"name": "BZ Rnr", "regex": /^0001([01]{2})10[01]{7}$/, "assemblerFunction": function(matches) {
            }},
            {"name": "BNZ Rne", "regex": /^0001([01]{2})01[01]{7}$/, "assemblerFunction": function(matches) {
            }},
            {"name": "BC Rnr", "regex": /^0001([01]{2})11[01]{7}$/, "assemblerFunction": function(matches) {
            }},
            {"name": "B Rnr", "regex": /^0001([01]{2})00[01]{7}$/, "assemblerFunction": function(matches) {
            }},

            {"name": "BZD #Adr", "regex": /^00110[01]{1}([01]{11})$/, "assemblerFunction": function(matches) {
            }},
            {"name": "BNZD #Adr", "regex": /^00101[01]{1}([01]{11})$/,"assemblerFunction": function(matches) {
            }},
            {"name": "BCD #Adr", "regex": /^00111[01]{1}([01]{11})$/, "assemblerFunction": function(matches) {
            }},
            {"name": "BD #Adr", "regex": /^00100[01]{1}([01]{11})$/, "assemblerFunction": function(matches) {
            }},

            {"name": "END", "regex": "/^[0-1]{1}$/","assemblerFunction": function(matches) {
            }}
        ];
        $scope.get_memory = function(start, end){
                                return $memory.memory(start, end);
                            }
        $scope.get_decimal = function(addr){
                                return $memory.getDecimal(addr);
                            }
        $scope.executionCounter = 0;
        $scope.currentSteps = [];  // Hilfsarray zur Darstellung.
        $scope._get_instruction = function(){
                    $scope.instructionRegister = $memory.getWord($scope.instructionCounter);
        }
        $scope.updateUI = function(){
                    var mem = [];
                    var start = $scope.instructionCounter>=5 ? $scope.instructionCounter-5 : 5,
                        end = $scope.instructionCounter <= ($memory.MEMORY-10) ?
                                        $scope.instructionCounter+10 : $memory.MEMORY-10;
                    for (var i=start; i<=end; i++) {
                    mem.push({'value': $memory.memory()[i], 'index': i,
                                  'class': i==$scope.instructionCounter ? 'success': ''});
                    }
                    $scope.currentSteps = mem;
                    $scope._get_instruction();
                };
        $scope.updateUI();
        $scope.step = function(){
            // Befehl auslesen
            this._get_instruction();
            // Befehl interpretieren
            this._interpret();

            // Resultat in Speicher schreiben
            // Ev. Befehlszähler erhöhen. (Wenn kein Sprung)
            this.instructionCounter += 2;

            this.executionCounter += 1;
            this.updateUI();
        };
        $memory.listen($scope.updateUI);
        $scope.reset = function(){
            this.instructionCounter = 100;
            this.executionCounter = 0;
            $memory.wipe();
            this.updateUI();
        }
        $scope.storeValue = function(addr){
            $memory.setDecimal(addr, this.speicherWert);
        }
        $scope._interpret = function(){
            var instruction = this.instructionRegister.replace(" ", "");

            for (var i=0;i<this.assemblerCommands.length;i++)
            {
                var regex = this.assemblerCommands[i].regex;
                if(instruction.match(regex)){
                    console.log("Assemblercode: "+this.assemblerCommands[i].name+"-"+regex);
                    var matches = regex.exec(instruction);
                    this.assemblerCommands[i].assemblerFunction(matches);
                    console.log(matches);
                    break;
                }
            }

                //$sysconv.bin2dec
            //$scope['r'+nr] = "00000000 00000001"
        }
  }]);




// angular.element($0).scope()