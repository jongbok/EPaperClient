
angular.module('starter.services', [])
.factory('Setting', function(){
	var setting = {
		sex: 'A',
		age: 0,
		count: 30,
		reject: 5
	};
	
	return {
		init: function(){
			return setting;
		},
		modify: function(arg){
			setting = arg;
		},
		resetReject: function(arg){
			setting.reject = 0;
			return setting;
		}
	};
});