(function () {
  var app = angular.module("appDirectives", []);

  app.factory('ConfigFactory', function ($http) {
    return {
      config: window.document.location.origin,
      getConfig: function () {
        return $http.get('/api/config');
      }
    }
  });


})();