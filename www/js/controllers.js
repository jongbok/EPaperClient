angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope, $rootScope) {
	$scope.remove = function(message){
		$rootScope.InputBox.remove(message);
	};
	$scope.reject = function(message){
		$rootScope.InputBox.remove(message);
		alert(message.phone_no + '는 거부되었습니다.');
	};
})

.controller('SendCtrl', function($scope, $filter, $rootScope, $ionicModal){
	
	$ionicModal.fromTemplateUrl('templates/modal-shop.html', {
		scope : $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});	
	$scope.close = function(){
		$scope.modal.hide();
	};
	
	var defaultObj = {
			date: '2015-03-01 14:22:11',
			sex: 'A',
			age1: 1,
			age2: 1,
			age3: 1,
			age4: 1,
			age5: 1,
			age6: 1,
			distance: 0,
			paper_cnt: 10,
			content: ''
	};
	
	$scope.init = function(){
		var msg = angular.copy(defaultObj);
		msg.date = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
		msg.paper_cnt = angular.copy($rootScope.max_count);
		$scope.sendMsg = msg;
	};

	$scope.send = function(message){
		console.log(message);
		$rootScope.SendBox.insert(message);
		alert('발송되었습니다.');
		var msg = angular.copy(defaultObj);
		msg.date = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
		msg.paper_cnt = angular.copy($rootScope.max_count);
		$scope.sendMsg = msg;
	};
	$scope.buy = function(productId){
  	  inappbilling.buy(function(resultBuy) {
			console.log("PURCHASE SUCCESSFUL")
		}, function(errorBuy) {
			console.log("ERROR BUYING -> " + errorBuy);
		}, productId);    	  
	};
	$scope.list = function(){
  	  inappbilling.getPurchases(function(result) {
			console.log("PURCHASES -> " + JSON.stringify(result));
		}, function(errorPurchases) {
			console.log("PURCHASE ERROR -> " + errorPurchases);
		});
	};
	
})

.controller('SendListCtrl', function($scope, $rootScope){
	$scope.remove = function(message){
		$rootScope.SendBox.remove(message);
	};
})

.controller('SettingCtrl', function($scope, $ionicModal, Setting){
	$scope.setting = Setting.init();
	$scope.modify = function(setting){
		Setting.modify(setting);
	};
	$scope.resetReject = function(setting){
		console.log(setting);
		$scope.setting = Setting.resetReject(setting);
		alert('수신거부가 초기화 되었습니다.');
	};
})

.directive('textarea', function() {
	return {
		restrict : 'E',
		link : function(scope, element, attr) {
			var update = function() {
				element.css("height", "auto");
				var height = element[0].scrollHeight;
				element.css("height", element[0].scrollHeight + "px");
			};
			scope.$watch(attr.ngModel, function() {
				update();
			});
		}
	};
});