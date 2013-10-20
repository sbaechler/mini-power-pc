'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('miniPowerPCControllers'));
  beforeEach(module('memoryProvider'));

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
});
