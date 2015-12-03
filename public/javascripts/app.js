(function(){
  var app = angular.module('whoNightApp', ['ui.bootstrap']);
  
  app.controller('SearchCtrl', function($http, $scope){
    var that = this;
    this.term = '';
    this.location = '';
    this.businesses = [];
    
    $scope.today = function() {
      $scope.dt = new Date();
    };
    $scope.today();    
    
    $scope.open = function($event) {
      $scope.status.opened = true;
    };    
    
    $scope.status = {
      opened: false
    };    
    
    $scope.dateChanged = function(){
      console.log('Date changed!');
      that.businesses = [];
    }
    
    var getDate = function(){
//      var dateObj = new Date();
      var dateObj = $scope.dt;
      return dateObj.getUTCFullYear() + '-' + 
          (dateObj.getUTCMonth() + 1) + '-' + 
          dateObj.getUTCDate();
    };
    
    this.msg = '';
    
    this.onDate = getDate();
    
    this.search = function(){
      if(that.term == ''){
        that.msg = 'Please enter What.';
        return;
      }
      if(that.location == ''){
        that.msg = 'Please enter Where.';
        return;
      }
      that.msg = 'Searching....';
      that.businesses = [];
      console.log('searching', that);
      var params = {term: that.term, location: that.location, onDate: getDate()};
      $http({url: '/api/search', method: 'get', params: params}).then(function(data){
        if(data.data.status == 'success'){
          console.log('search succes', data);
          that.msg = '';
          that.businesses = data.data.response.businesses;
        }else{
          console.log('search fail, response did come', data);
          that.msg = 'Failed to search! ' + data.data.err.source.text;
        }
      }, function(err){
        console.log('search fail', err);
        that.msg = 'Failed to search!';
      });
    };
    
    this.test = function(){
      console.log('Date=', $scope.dt);
    };
    
    this.addGoing = function(business){
      console.log('add going ', business);
      
      var params = {placeId: business.id, 
                    placeName: business.name, 
                    onDate: getDate(),
                    placeAddress: business.location.display_address};
      var url = '/api/addGoing';
      if(business.going) url = '/api/removeGoing';
      $http.post(url, params).success(function(data){
        console.log(data);
        //that.businesses = data.businesses;
        if(data.status == 'success'){
          if(data.operation == 'added'){
            business.going = true;
            business.goingCount++;
          }else{
            //removed
            business.going = false;
            business.goingCount--;
          }
        }
      });
    };
    
    
    
    
  });
  
  
})();