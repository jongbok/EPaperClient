angular.module('starter.controllers', ['ngDraggable','ionic','monospaced.elastic','angularMoment'])

.controller('HomeCtrl', function($scope, $rootScope, $http, $window, $ionicModal, $ionicScrollDelegate, $timeout, epaperConfig) {
	$ionicModal.fromTemplateUrl('templates/modal-chat.html', {
		scope : $scope
	}).then(function(modal) {
		$scope.chatwin = modal;
		initialChat($scope, $ionicScrollDelegate, $timeout, epaperConfig.server_uri);
	});
	
	$scope.admin_no = epaperConfig.admin_no;
	$scope.phoneCall = function(message){
		if(message.phone_no !== epaperConfig.admin_no){
			document.location.href = 'tel:' + message.phone_no;
		}
	};
	
	$scope.onDropComplete = function(message, event){
		var width = $window.innerWidth;
		var active = Math.round(width * 10 / 100);
		var left = active;
		var right = width - active;
		var endX = event.x;
		if(endX < left){
			if(message.phone_no === epaperConfig.admin_no){
				alert('운영자가 보낸 메세지는 차단할 수 없습니다.');
				return;
			}
			
			var b = confirm('메세지를 보낸 사용자를 차단하시겠습니까?');
			if(!b){
				return;
			}
			 $http({
				 method: 'POST',
				 url: epaperConfig.server_uri + '/users/' + $rootScope.user.id + '/reject',
				 data: {
					 	id: $rootScope.user.id,
					 	phone_no: $rootScope.user.phone_no
				 },
				 headers: epaperConfig.getHttpHeader()
			 })
			 .success(function(data, status, headers, config){
				 if(!data){
					 console.error('reject:: response data is null!');
					 alert('메세지를 차단 하는중 에러가 발생하였습니다.');
					 return;
				 }
				 if(data.result && data.result === 'fail'){
					 console.error('reject:: response fail[' + data.message + ']');
					 alert('메세지를 차단 하는중 에러가 발생하였습니다.');
					 return;
				 }
			
				 $rootScope.InputBox.remove(message);
				 $rootScope.user.reject_cnt += 1;
				 console.log('reject:: success!');
				 alert('차단 되었습니다.');
			 })
			 .error(function(data, status, headers, config){
				 console.error('send message:: http error![status:' + status + ']');
				 alert('메세지를 차단 하는중 에러가 발생하였습니다.');
			 });			
		}
		if(endX > right){
			$rootScope.InputBox.remove(message);
		}
	};
})

.controller('SendCtrl', function($scope, $filter, $rootScope, $ionicModal, $ionicLoading, $http, $ionicScrollDelegate, $timeout, epaperConfig){
	
	$ionicModal.fromTemplateUrl('templates/modal-shop.html', {
		scope : $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});	
	$scope.close = function(){
		$scope.modal.hide();
	};
	
	$ionicModal.fromTemplateUrl('templates/modal-chat.html', {
		scope : $scope
	}).then(function(modal) {
		$scope.chatwin = modal;
		initialChat($scope, $ionicScrollDelegate, $timeout, epaperConfig.server_uri);
	});
	
	var defaultObj = {
			date: '2015-03-01 14:22:11',
			sex: 'A',
			age1: 1,
			age2: 1,
			age3: 1,
			age4: 1,
			age5: 1,
			age6: 1,
			distance: 5000,
			paper_cnt: 10,
			content: ''
	};
	
	$scope.sendMsg = angular.copy(defaultObj);
	
	$rootScope.$watch('user.paper_coin', function(newVal, oldVal){
		if(newVal === oldVal) return;
		$scope.sendMsg.paper_cnt = newVal;
	});
	
	$scope.init = function(){
		$scope.sendMsg = angular.copy(defaultObj);
		$scope.sendMsg.date = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
		if($rootScope.user && $rootScope.user.paper_coin){
			console.log('send init:: paper_coin=' + $rootScope.user.paper_coin);
			$scope.sendMsg.paper_cnt = angular.copy($rootScope.user.paper_coin);
		}
	};

	$scope.send = function(message){
		if(!$rootScope.user || !$rootScope.user.id){
			alert('사용자정보가 존재하지 않습니다. 재설치 후 사용 바랍니다.');
			return;
		}
		if(!$rootScope.user.phone_no || $rootScope.user.phone_no.length < 4){
			alert('전화번호를 알 수 없는 기기에서는 메세지를 발송 할 수 없습니다.');
			return;
		}
		
		$ionicLoading.show({template : '<i class="ion-loading-c"></i>전단지를 발송중 입니다...' });
		 $http({
			 method: 'POST',
			 url: epaperConfig.server_uri + '/messages',
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
			 headers: epaperConfig.getHttpHeader()
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
			 
			 $scope.input.create(message.id, message.content);
		 })
		 .error(function(data, status, headers, config){
			 $ionicLoading.hide();
			 console.error('send message:: http error![status:' + status + ']');
			 alert('전단지를 발송하는 중 오류가 발생하였습니다.');
		 });
	};
	
	$scope.buy = function(productId){
		if(!$rootScope.user || !$rootScope.user.id){
			alert('사용자정보가 존재하지 않습니다. 재설치 후 사용 바랍니다.');
			return;
		}
		if(!$rootScope.user.phone_no || $rootScope.user.phone_no.length < 4){
			alert('전화번호를 알 수 없는 기기에서는 메세지를 발송 할 수 없습니다.');
			return;
		}		
		if(typeof inappbilling === "undefined"){
			alert('결재정보를 가져올 수 없어 구매할 수 없습니다.');
			return;
		}
		
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

		inappbilling.buy(function(resultBuy) {
			 $http({
				 method: 'POST',
				 url: epaperConfig.server_uri + '/users/' + $rootScope.user.id + '/charge',
				 data: {
					 	id: $rootScope.user.id,
					 	coin_id: productId
				 },
				 headers: epaperConfig.getHttpHeader()
			 })
			 .success(function(data, status, headers, config){
				 if(!data){
					 console.error('charge:: response data is null!');
					 $scope.isError = true;
					 $scope.errorMsg = '전단지 구매중 에러가 발생하였습니다.[' + productId + ']\n 에러화면을 캡처하여 asdkf20@gmail.com 메일을 보내주세요!';
					 return;
				 }
				 if(data.result && data.result === 'fail'){
					 console.error('charge:: response fail[' + data.message + ']');
					 $scope.isError = true;
					 $scope.errorMsg = '전단지 구매중 에러가 발생하였습니다.[' + productId + ']\n 에러화면을 캡처하여 asdkf20@gmail.com 메일을 보내주세요!';
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
				 $scope.errorMsg = '전단지 구매중 에러가 발생하였습니다.[' + productId + ']\n 에러화면을 캡처하여 asdkf20@gmail.com 메일을 보내주세요!';
			 });  		  
		}, function(errorBuy) {
			alert('시스템 오류로 결재가 취소 되었습니다.');
			console.log("ERROR BUYING -> " + errorBuy);
		}, productId);
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

.controller('SettingCtrl', function($scope, $rootScope, $http, epaperConfig){
	var origin = angular.copy($rootScope.user);
	$scope.modified = false;
	var isModified = function isModified(newVal, oldVal){
		if(!newVal){ return; }
		$scope.modified = !angular.equals($rootScope.user.name, origin.name)
						|| !angular.equals($rootScope.user.sex, origin.sex)
						|| parseInt($rootScope.user.age) !== parseInt(origin.age);
	};
	$rootScope.$watch('user.name',isModified);
	$rootScope.$watch('user.sex',isModified);
	$rootScope.$watch('user.age',isModified);
	
	$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
		if(fromState.name === 'tab.setting'){
			$rootScope.user = angular.copy(origin);
			console.log('setting:: leave!');
		}
	});
	
	$scope.modify = function(user){
		 $http({
			 method: 'PUT',
			 url: epaperConfig.server_uri + '/users/' + user.id,
			 data: {
				 	id: user.id,
				 	name: user.name,
				 	sex: user.sex,
				 	age: user.age
			 },
			 headers: epaperConfig.getHttpHeader()
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
			 
			 origin = angular.copy(user);
			 $scope.modified = false;
			 alert('사용자정보가 저장되었습니다.');
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
			 url: epaperConfig.server_uri + '/users/' + user.id + '/reject',
			 data: {
				 	id: user.id,
			 },
			 headers: epaperConfig.getHttpHeader()
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

.directive('autolinker', ['$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        $timeout(function() {
          var eleHtml = element.html();

          if (eleHtml === '') {
            return false;
          }

          var text = Autolinker.link(eleHtml, {
            className: 'autolinker',
            newWindow: false
          });

          element.html(text);

          var autolinks = element[0].getElementsByClassName('autolinker');

          for (var i = 0; i < autolinks.length; i++) {
            angular.element(autolinks[i]).bind('click', function(e) {
              var href = e.target.href;
              console.log('autolinkClick, href: ' + href);

              if (href) {
                //window.open(href, '_system');
                window.open(href, '_blank');
              }

              e.preventDefault();
              return false;
            });
          }
        }, 0);
      }
    }
  }
])

.filter('nl2br', ['$sanitize', function($sanitize) {
	var tag = (/xhtml/i).test(document.doctype) ? '<br />' : '<br>';
	return function(msg) {
		// ngSanitize's linky filter changes \r and \n to &#10; and &#13; respectively
		msg = (msg + '').replace(/(\r\n|\n\r|\r|\n|&#10;&#13;|&#13;&#10;|&#10;|&#13;)/g, tag + '$1');
		return $sanitize(msg);
	};
}]);

var socket;
function initialChat($scope, $ionicScrollDelegate, $timeout, url){
	
	function getSocket(){
		if(socket && socket.connected){
			return socket;
		}else{
			socket = io.connect(url, {'force new connection': true});
			
			  socket.on('connected', function(){
				  console.log('chat:: connected!');
			  });
			  
			  socket.on('disconnect', function(){
				  $scope.chatwin.hide();
				 console.log('chat:: disconnect'); 
			  });

			  socket.on('created', function(){
					var msg = {system:true, text:'채팅을 시작합니다.'};
					$scope.chats.push(msg);
					$scope.chatwin.show();
					$scope.input.disable = false;
					console.log('chat:: created');
				  });

			  socket.on('joined', function(data){
				var msg = {system:true, text:data.userName + '님이 접속했습니다.'};
				$scope.chats.push(msg);
				$scope.chatwin.show();
				$scope.input.disable = false;
				console.log('chat:: joined');
			  });

			  socket.on('end', function(){
				  alert('채팅이 종료되었습니다.');
				  $scope.input.disable = true;
				  console.log('chat:: end');
			  });

			  socket.on('chat', function(data){
				console.log('chat:: receive!');
				data.date = new Date();
				$scope.chats.push(data);
				keepKeyboardOpen();
			    delete $scope.input.message;
			    
			    $timeout(function() {
			        keepKeyboardOpen();
			        viewScroll.scrollBottom(true);
			      }, 0);
			  });

			  socket.on('leave1', function(){
				  var msg = {system:true, text:'방장이 채팅을 종료해서 더 이상 채팅할 수 없습니다.'};
				  $scope.chats.push(msg);
				  $scope.input.disable = true;
				  console.log('chat:: leave1');
			  });

			  socket.on('leave2', function(data){
				  var msg = {system:true, text: data.userName + '님이 채팅방을 나갔습니다.'};
				  $scope.chats.push(msg);
				  $scope.input.disable = true;
				  console.log('chat:: leave2');
			  });
			  
			  socket.on('error', function(err){
				 console.error('socket error', err);
			  });

			return socket;
		}
	}
	
	$scope.chats = [];	
    $scope.input = { message: '' };	
	var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
    var footerBar; // gets set in $ionicView.enter
    var txtInput; // ^^^

	$scope.$on('$ionicView.enter', function() {
		console.log('UserMessages $ionicView.enter');
		
		$timeout(function() {
		  footerBar = $scope.chatwin.el.querySelector('#userMessagesView .bar-footer');
		  var footerInput = footerBar.querySelector('textarea');
		  txtInput = angular.element(footerInput);
		}, 0);
	});

	$scope.sendMessage = function(sendMessageForm) {
		var socket = getSocket();
		socket.emit('send', $scope.input.message);
		keepKeyboardOpen();
    };	
    
	function keepKeyboardOpen() {
		console.log('keepKeyboardOpen');
		txtInput.one('blur', function() {
			console.log('textarea blur, focus back on it');
			txtInput[0].focus();
	    });
	}

	$scope.$on('taResize', function(e, ta) {
		console.log('taResize');
		if (!ta) return;
		var taHeight = ta[0].offsetHeight;
		console.log('taHeight: ' + taHeight);
		
		if (!footerBar) return;
		var newFooterHeight = taHeight + 10;
		newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;
		footerBar.style.height = newFooterHeight + 'px';
	});	
	
  $scope.input.join = function(roomId, content){
	  console.log('chat:: emit join');
	  var socket = getSocket();
	  $scope.input.content = content;
	  socket.emit('join', {roomId:roomId, userId: $scope.user.id, userName: $scope.user.name});
  };
  
  $scope.input.create = function(roomId, content){
	  var socket = getSocket();
	  $scope.input.content = content;
	  socket.emit('create', {roomId:roomId, userId: $scope.user.id, userName: $scope.user.name});
  };
  
  $scope.input.leave = function(){
	  var socket = getSocket();
	  socket.emit('leave');
	  socket.disconnect();
	  $scope.chatwin.hide();
	  $scope.chats = [];	
  };
  
}