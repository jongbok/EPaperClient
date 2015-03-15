angular.module('starter.controllers', ['ngDraggable'])

.controller('HomeCtrl', function($scope, $rootScope, $http, $window) {
	$scope.phoneCall = function(message){
		document.location.href = 'tel:' + message.phone_no;
		console.log('hold obj::' + JSON.stringify(message));
	};
	
	$scope.onDropComplete = function(message, event){
		var width = $window.innerWidth;
		var active = Math.round(width * 10 / 100);
		var left = active;
		var right = width - active;
		var endX = event.x;
		if(endX < left){
			var b = confirm('메세지를 보낸 사용자를 차단하시겠습니까?');
			if(!b){
				return;
			}
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
		}
		if(endX > right){
			$rootScope.InputBox.remove(message);
		}
	};
})

.controller('SendCtrl', function($scope, $filter, $rootScope, $ionicModal, $ionicLoading, $http){
	
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
		if($rootScope.user && $rootScope.user.paper_coin){
			console.log('send init:: paper_coin=' + $rootScope.user.paper_coin);
			$scope.sendMsg.paper_cnt = angular.copy($rootScope.user.paper_coin);
		}
		
		$scope.checkPaperCnt = function(message){
			console.log('send checkPaperCnt:: [보유:' + $rootScope.user.paper_coin + ', 요청:' + $scope.sendMsg.paper_cnt + ']');
			if($scope.sendMsg.paper_cnt > $rootScope.user.paper_coin){
				alert('사용가능한 전단지가 ' + $rootScope.user.paper_coin + '장 남았습니다.');
				$scope.sendMsg.paper_cnt = $rootScope.user.paper_coin;
			}
		};
		
		$scope.checkContent = function(message){
			if(message.content.length > 2000){
				alert('전단지내용은 2,000자 이상 입력할 수 없습니다.');
				message.content = message.content.substr(0, 2000);
			}
		}
		
		$rootScope.$watch('user.paper_coin', function(newVal, oldVal){
			console.log('send init:: newVal=' + newVal);
			$scope.sendMsg.paper_cnt = newVal;
		});
		
	};

	$scope.send = function(message){
		$ionicLoading.show({template : '전단지를 발송중 입니다...' });
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
			 $ionicLoading.hide();
			 if(!data){
				 console.error('send message:: response data is null!');
				 alert('전단지를 발송하는 중 오류가 발생하였습니다.');
				 return;
			 }
			 if(data.result && data.result === 'fail'){
				 console.error('send message:: response fail[' + data.message + ']');
				 if(data.message){
					 alert(data.message);
				 }else{
					 alert('전단지를 발송하는 중 오류가 발생하였습니다.');
				 }
				 return;
			 }
			 
			 alert('전단지 ' + data.send_count + '장이 발송되었습니다.');
			 message.paper_cnt = data.send_count;
			 $rootScope.SendBox.insert(message);
			 $scope.sendMsg = angular.copy(defaultObj);
			 $scope.sendMsg.date = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
			 $rootScope.user.paper_coin -= data.send_count;
			 $scope.sendMsg.paper_cnt = angular.copy($rootScope.user.paper_coin);
			 console.log('send message:: success!');
		 })
		 .error(function(data, status, headers, config){
			 $ionicLoading.hide();
			 console.error('send message:: http error![status:' + status + ']');
			 alert('전단지를 발송하는 중 오류가 발생하였습니다.');
		 });
	};
	
	$scope.buy = function(productId){
		var paper_cnt = 0;
        switch(productId){
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
        
        var b = confirm('전단지 ' + paper_cnt + '장을 구매하겠습니까?');
        if(!b){
        	alert('전단지 구매가 취소되었습니다.');
        	return;
        }

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
				 $scope.isError = true;
				 $scope.errorMsg = '전단지 구매중 에러가 발생하였습니다.[' + productId + ']\n 에러화면을 캡처하여 고객센터로 문의 바랍니다.';
				 return;
			 }
			 if(data.result && data.result === 'fail'){
				 console.error('charge:: response fail[' + data.message + ']');
				 $scope.isError = true;
				 $scope.errorMsg = '전단지 구매중 에러가 발생하였습니다.[' + productId + ']\n 에러화면을 캡처하여 고객센터로 문의 바랍니다.';
				 return;
			 }
		
			 
			 $rootScope.user.paper_coin += paper_cnt;
			 $scope.sendMsg.paper_cnt = angular.copy($rootScope.user.paper_coin); 
			 console.log('charge:: success!');
			 alert('전단지 ' + paper_cnt + '장을 구매하였습니다.');
		 })
		 .error(function(data, status, headers, config){
			 console.error('charge:: http error![status:' + status + ']');
			 $scope.isError = true;
			 $scope.errorMsg = '전단지 구매중 에러가 발생하였습니다.[' + productId + ']\n 에러화면을 캡처하여 고객센터로 문의 바랍니다.';
		 });  		  
        
		 /*
  	  inappbilling.buy(function(resultBuy) {
  		  
			console.log("PURCHASE SUCCESSFUL");
		}, function(errorBuy) {
			alert('시스템 오류로 결재가 취소 되었습니다.');
			console.log("ERROR BUYING -> " + errorBuy);
		}, productId);
		*/    	  
	};
	$scope.list = function(){
  	  inappbilling.getPurchases(function(result) {
			console.log("PURCHASES -> " + JSON.stringify(result));
		}, function(errorPurchases) {
			console.log("PURCHASE ERROR -> " + errorPurchases);
		});
	};
	
})

.controller('SendListCtrl', function($scope, $rootScope, $window){
	$scope.onDropComplete = function(message, event){
		var width = $window.innerWidth;
		var active = Math.round(width * 10 / 100);
		var left = active;
		var right = width - active;
		var endX = event.x;
		
		if(endX < left || endX > right){
			$rootScope.SendBox.remove(message);
		}
	};
})

.controller('SettingCtrl', function($scope, $rootScope, $http){
	$scope.modify = function(user){
		 $http({
			 method: 'PUT',
			 url: $rootScope.server_uri + '/users/' + user.id,
			 data: {
				 	id: user.id,
				 	sex: user.sex,
				 	age: user.age
			 },
			 headers: {'Content-Type': 'application/json; charset=utf-8'}
		 })
		 .success(function(data, status, headers, config){
			 if(!data){
				 console.error('user modify:: response data is null!');
				 alert('사용자정보를 변경 하는중 에러가 발생하였습니다.');
				 return;
			 }
			 if(data.result && data.result === 'fail'){
				 console.error('user modify:: response fail[' + data.message + ']');
				 alert('사용자정보를 변경 하는중 에러가 발생하였습니다.');
				 return;
			 }
		
			 console.log('user modify:: success!');
		 })
		 .error(function(data, status, headers, config){
			 console.error('user modify:: http error![status:' + status + ']');
			 alert('사용자정보를 변경 하는중 에러가 발생하였습니다.');
		 });		
	};
	
	$scope.resetReject = function(user){
		 $http({
			 method: 'DELETE',
			 url: $rootScope.server_uri + '/users/' + user.id + '/reject',
			 data: {
				 	id: user.id,
			 },
			 headers: {'Content-Type': 'application/json; charset=utf-8'}
		 })
		 .success(function(data, status, headers, config){
			 if(!data){
				 console.error('reset reject:: response data is null!');
				 alert('수신거부목록을 초기화중 에러가 발생하였습니다.');
				 return;
			 }
			 if(data.result && data.result === 'fail'){
				 console.error('reset reject:: response fail[' + data.message + ']');
				 alert('수신거부목록을 초기화중 에러가 발생하였습니다.');
				 return;
			 }
		
			 console.log('reset reject:: success!');
			 user.reject_cnt = 0;
			 alert('수신거부목록이 초기화 되었습니다.');
		 })
		 .error(function(data, status, headers, config){
			 console.error('reset reject:: http error![status:' + status + ']');
			 alert('수신거부목록을 초기화중 에러가 발생하였습니다.');
		 });		
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