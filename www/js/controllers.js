angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope, $rootScope, Messages) {
	var db = window.sqlitePlugin.openDatabase("epaper.db","1.0", "EPaper", 5000000);
	$scope.messages = Messages.all();
	$scope.remove = function(message){
		Messages.remove(message);
	};
	$scope.reject = function(message){
		Messages.reject(message);
		alert(message.phoneNo + '는 거부되었습니다.');
	};
})

.controller('SendCtrl', function($scope, $ionicModal, SendSvc){
	
	$ionicModal.fromTemplateUrl('templates/modal-shop.html', {
		scope : $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});	
	$scope.close = function(){
		$scope.modal.hide();
	};

	$scope.message = SendSvc.init();
	$scope.max = $scope.message.count;
	$scope.send = function(message){
		console.log(message);
		SendSvc.send(message);
		alert('발송되었습니다.');
		$scope.message = SendSvc.init();
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
	
    function successHandler (result) {
        var strResult = "";
        if(typeof result === 'object') {
            strResult = JSON.stringify(result);
        } else {
            strResult = result;
        }
        alert("SUCCESS: \r\n"+strResult );
    }

    function errorHandler (error) {
        alert("ERROR: \r\n"+error );
    }
})

.controller('SendListCtrl', function($scope, SendSvc){
	$scope.messages = SendSvc.all();
	$scope.remove = function(message){
		SendSvc.remove(message);
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