angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope, $rootScope, $http) {
	$scope.remove = function(message){
		$rootScope.InputBox.remove(message);
	};
	
	$scope.reject = function(message){
		 $http({
			 method: 'POST',
			 url: $rootScope.server_uri + '/users/' + $rootScope.user.id + '/reject',
			 data: {
				 	id: $rootScope.user.id,
				 	phone_no: $rootScope.user.phone_no
			 },
			 headers: {'Content-Type': 'application/json; charset=utf-8'}
		 })
		 .success(function(data, status, headers, config){
			 if(!data){
				 console.error('reject:: response data is null!');
				 alert('거부처리 하는중 에러가 발생하였습니다.');
				 return;
			 }
			 if(data.result && data.result === 'fail'){
				 console.error('reject:: response fail[' + data.message + ']');
				 alert('거부처리 하는중 에러가 발생하였습니다.');
				 return;
			 }
		
			 $rootScope.InputBox.remove(message);
			 $rootScope.user.reject_cnt += 1;
			 console.log('reject:: success!');
			 alert('거부처리 되었습니다.');
		 })
		 .error(function(data, status, headers, config){
			 console.error('send message:: http error![status:' + status + ']');
			 alert('거부처리 하는중 에러가 발생하였습니다.');
		 });
	};
})

.controller('SendCtrl', function($scope, $filter, $rootScope, $ionicModal, $http){
	
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
		$scope.sendMsg = angular.copy(defaultObj);
		$scope.sendMsg.date = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
		$scope.sendMsg.paper_cnt = angular.copy($rootScope.user.paper_coin);
		$scope.$watch('sendMsg.paper_cnt', function(){
			if($scope.sendMsg.paper_cnt > $rootScope.user.paper_coin){
				alert('사용가능한 전단지가 ' + $rootScope.user.paper_coin + '장 남았습니다.');
				$scope.sendMsg.paper_cnt = $rootScope.user.paper_coin;
			}
		});
		$scope.$watch('sendMsg.content', function(){
			if($scope.sendMsg.content.length > 3000){
				alert('전단지내용은 3000자 이상 입력할 수 없습니다.');
			}
		});
	};

	$scope.send = function(message){
		console.log(message);
		 $http({
			 method: 'POST',
			 url: $rootScope.server_uri + '/messages',
			 data: {
				 	user_id: $rootScope.user.id,
				 	phone_no: $rootScope.user.phone_no,
				 	sex: message.sex,
				 	age1: message.age1,
				 	age2: message.age2,
				 	age3: message.age3,
				 	age4: message.age4,
				 	age5: message.age5,
				 	age6: message.age6,
				 	distance: message.distance,
				 	paper_cnt: message.paper_cnt,
				 	content: message.content
			 },
			 headers: {'Content-Type': 'application/json; charset=utf-8'}
		 })
		 .success(function(data, status, headers, config){
			 if(!data){
				 console.error('send message:: response data is null!');
				 alert('전단지를 발송하는 중 오류가 발생하였습니다.');
				 return;
			 }
			 if(data.result && data.result === 'fail'){
				 console.error('send message:: response fail[' + data.message + ']');
				 alert('전단지를 발송하는 중 오류가 발생하였습니다.');
				 return;
			 }
			 if(!data.send_count){
				 console.error('send message:: cannot find send_count');
				 return;
			 }
			 
			 $rootScope.SendBox.insert(message);
			 alert('전단지 ' + data.send_count + '장이 발송되었습니다.');
			 $scope.sendMsg = angular.copy(defaultObj);
			 $scope.sendMsg.date = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
			 $rootScope.user.paper_coin -= data.send_count;
			 $scope.sendMsg.paper_cnt = angular.copy($rootScope.user.paper_coin);
			 console.log('send message:: success!');
		 })
		 .error(function(data, status, headers, config){
			 console.error('send message:: http error![status:' + status + ']');
			 alert('전단지를 발송하는 중 오류가 발생하였습니다.');
		 });
	};
	
	$scope.buy = function(productId){
		var paper_cnt = 0;
        switch(coin_id){
	        case 'paper_coin_50':
	                paper_cnt = 50;
	                break;
	        case 'paper_coin_100':
	                paper_cnt = 100;
	                break;
	        case 'paper_coin_500':
	                paper_cnt = 500;
	                break;
	        case 'paper_coin_1000':
	                paper_cnt = 1000;
	                break;
	        case 'paper_coin_5000':
	                paper_cnt = 5000;
	                break;
	        case 'paper_coin_10000':
	                paper_cnt = 10000;
	                break;
        }
		
  	  inappbilling.buy(function(resultBuy) {
 		 $http({
			 method: 'POST',
			 url: $rootScope.server_uri + '/users/' + $rootScope.user.id + '/charge',
			 data: {
				 	id: $rootScope.user.id,
				 	coin_id: productId
			 },
			 headers: {'Content-Type': 'application/json; charset=utf-8'}
		 })
		 .success(function(data, status, headers, config){
			 if(!data){
				 console.error('charge:: response data is null!');
				 alert('전단지 구매중 에러가 발생하였습니다.[' + productId + ']\n 에러화면을 캡처하여 고객센터로 문의 바랍니다.');
				 return;
			 }
			 if(data.result && data.result === 'fail'){
				 console.error('charge:: response fail[' + data.message + ']');
				 alert('전단지 구매중 에러가 발생하였습니다.[' + productId + ']\n 에러화면을 캡처하여 고객센터로 문의 바랍니다.');
				 return;
			 }
		
			 
			 $rootScope.user.paper_coin += paper_cnt;
			 console.log('charge:: success!');
			 alert('전단지 ' + paper_cnt + '장을 구매하였습니다.');
		 })
		 .error(function(data, status, headers, config){
			 console.error('charge:: http error![status:' + status + ']');
			 alert('전단지 구매중 에러가 발생하였습니다.[' + productId + ']\n 에러화면을 캡처하여 고객센터로 문의 바랍니다.');
		 });  		  
  		  
			console.log("PURCHASE SUCCESSFUL");
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