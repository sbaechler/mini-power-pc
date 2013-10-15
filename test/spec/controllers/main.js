'use strict';

describe('Controller: MainCtrl', function () {
  var $compile;
  var $rootScope;

  // load the controller's module
  beforeEach(module('miniPowerPCControllers'));
  beforeEach(module('miniPowerPCAssemblers'));

  var MainCtrl, AssemblerCtrl,
    scope;

//  beforeEach(inject(function(_$compile_, _$rootScope_){
//      $compile = _$compile_;
//      $rootScope = _$rootScope_;
//  }));

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
    AssemblerCtrl = $controller('AssemblerCtrl', {
        $scope: scope
    });
  }));

  it('should set the instruction counter to 100', function () {
    expect(scope.instructionCounter).toBe(100);
  });
});
