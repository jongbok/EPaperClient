// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])

.run(function($ionicPlatform, $rootScope, $http, $cordovaSQLite, $cordovaGeolocation, $cordovaPush, $cordovaToast, $ionicLoading) {
	$rootScope.server_uri = 'https://ec2-54-65-104-219.ap-northeast-1.compute.amazonaws.com';
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    
    var db = $cordovaSQLite.openDB({ name: "epage.db", bgType: 1 });
    async.waterfall([
                     function(callback){
                    	 $ionicLoading.show({template : '<ion-spinner icon="bubbles" ></ion-spinner>시스템정보를 확인하는 중입니다...', animation: 'fade-in',  noBackdrop: false});
                    	 callback(null, db, $rootScope, $cordovaSQLite);
                     },
                     initInputBox,
                     initSendBox,
                     function(callback){
                    	callback(null, $cordovaPush, $rootScope, $http, $cordovaToast); 
                     },
                     initNotification,
                     function(regId, callback){
                    	 var user = {registration_id: regId};
                    	 var telephoneNumber = cordova.require("cordova/plugin/telephonenumber");
                    	 telephoneNumber.get(function(phone_no) {
                    		 user.phone_no = phone_no;
                    		 callback(null, user);
                    	 },
                    	 function(){
                    		 var msg = '해당기기의 전화번호를 가져올 수 없습니다.\n 전화번호가 없는 기기에서는 전단지를 발송할 수 없습니다.';
                    		 console.error(msg);
                    		 $cordovaToast.showLongCenter(msg);
                    		 callback(null, user);
                    	 });
                     },
                     function(user, callback){
                    	 $cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: true, maximumAge:1000*60*5}).then(
                    			 function(position) {
                    				 user.latitude = position.coords.latitude;
                    				 user.longitude = position.coords.longitude;
                    				 console.log('Geolocation::lat=' + user.latitude + ',long=' + user.longitude);
                    				 callback(null, user);
                    			 },
                    			 function(err){
                    				 var msg = '위치정보를 가져올 수 없어 사용이 제한될 수 있습니다.\n위치정보를 사용할 수 있도록 설정해 주세요!';
                    				 console.error(msg);
                    				 $cordovaToast.showLongCenter(msg);
                    				 callback(null, user);
                    			 });
                     },
                     function(user, callback){
                    	 $http({
                    		 method: 'POST',
                    		 url: $rootScope.server_uri + '/users',
                    		 data: user,
                    		 headers: {'Content-Type': 'application/json; charset=utf-8'}
                    	 })
                    	 .success(function(data, status, headers, config){
                    		if(!data || (data.result && data.result === 'fail')){
                    			var err = new Error('사용자정보를 가져오는중 에러가 발생하였습니다.');
                    			callback(err);
                    			return;
                    		}
                    		callback(null, data);
                    	 })
                    	 .error(function(data, status, headers, config){
                    		 console.error('get user:: ' + status);
                    		 var err = new Error('서버와 연결이 원활하지 않습니다.');
                    		 callback(err);
                    	 });
                     },
                     function(user, callback){
                    	 $rootScope.user = user;
                    	 receiveMessage($http, $rootScope, function(){
                    		 callback(null, user);
                    	 });
                     }
            ],
            function(err, result){
    			$ionicLoading.hide();
    			if(err){
    				console.error('init error', err);
    				alert('오류가 발생하여 사용할 수 없습니다.');
    				navigator.app.exitApp();
    			}else{
    				console.log('loadding success!');
    			}
    });
    
	if(typeof inappbilling !== "undefined"){
		  inappbilling.init(function(resultInit) {
	          inappbilling.getPurchases(function(result) {
	              console.log("PURCHASE RESPONSE -> " + JSON.stringify(result));
	          }, 
	          function(errorPurchases) {
	              console.error("PURCHASE ERROR -> " + errorPurchases);
	              throw errorPurchases;
	          });
	      }, 
	      function(errorInit) {
	          console.error("INITIALIZATION ERROR -> " + errorInit);
	          throw errorInit;
	      }, 
	      {showLog: true},
	      ["paper_coin_50"]);
	}
    
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'HomeCtrl'
      }
    }
  })

  .state('tab.send', {
      url: '/send',
      views: {
        'tab-send': {
          templateUrl: 'templates/tab-send.html',
          controller: 'SendCtrl'
        }
      }
    })
    .state('tab.sendlist', {
      url: '/sendlist',
      views: {
        'tab-sendlist': {
          templateUrl: 'templates/tab-sendlist.html',
          controller: 'SendListCtrl'
        }
      }
    })

  .state('tab.setting', {
      url: '/setting',
      views: {
        'tab-setting': {
          templateUrl: 'templates/tab-setting.html',
          controller: 'SettingCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

});


function receiveMessage($http, $rootScope, callback){
	 $http({
		 method: 'GET',
		 url: $rootScope.server_uri + '/messages/' + $rootScope.user.id,
		 data: {user_id: $rootScope.user.id},
		 headers: {'Content-Type': 'application/json; charset=utf-8'}
	 })
	 .success(function(data, status, headers, config){
		 if(!data){
			 console.error('get message:: response data is null!');
			 throw new Error('서버로부터 전단지를 가져오는중 오류가 발생하였습니다.');
		 }
		 if(data.result && data.result === 'fail'){
			 console.error('get message:: response fail[' + data.message + ']');
			 throw new Error(data.message);
		 }
		 
		 console.log('get message::' + JSON.stringify(data));
		 for(var i=0; i<data.length; i++){
			 var message = {
					 date: data[i].create_dt, 
					 phone_no: data[i].phone_no,
					 content: data[i].content
					 };
			 $rootScope.InputBox.insert(message);
		 }
		 callback();
	 })
	 .error(function(data, status, headers, config){
		 console.error('get message:: http error!');
		 throw new Error('서버로부터 전단지를 가져오는중 오류가 발생하였습니다.');
	 });	
}

function initInputBox(db, $rootScope, $cordovaSQLite, callback){
    var query_create = 'CREATE TABLE IF NOT EXISTS input_box (id integer primary key, date text, phone_no text, content text)';
    var query_drop = 'DROP TABLE IF EXISTS input_box';
    var query_insert = 'INSERT INTO input_box(date, phone_no, content) VALUES (?,?,?)';
    var query_select = 'SELECT * FROM input_box order by date desc';
    
    async.waterfall([
        function(callback){
        	$cordovaSQLite.execute(db, query_create, []).then(function(res){
        		console.log('input_box :: create');
        		callback(null);
        	});
        },
        function(callback){
        	$cordovaSQLite.execute(db, query_select, []).then(function(res){
        		$rootScope.messages = [];
        		for(var i=0; i<res.rows.length; i++){
        			$rootScope.messages.push(res.rows.item(i));
        		}
        		console.log('input_box :: selected');
        		callback(null);
        	});
        }
    ],
    function(err, result){
    	if(err){ throw err; }
    	callback(null, db, $rootScope, $cordovaSQLite);
    });
    
    $rootScope.InputBox = {
    	remove: function(message){
    		var query = 'DELETE FROM input_box where id=?';
    		$cordovaSQLite.execute(db, query, [message.id]).then(function(res){
    			$rootScope.messages.splice($rootScope.messages.indexOf(message), 1);
    			console.log('input_box :: delete[id:' + message.id + ']');
    		});
    	},
    	insert: function(message){
    		var query = query_insert;
    		var args = [message.date, message.phone_no, message.content];
    		$cordovaSQLite.execute(db, query, args).then(function(res){
    			message.id = res.insertId;
    			$rootScope.messages.splice(0, 0, message);
    			console.log('input_box :: insert ' + JSON.stringify(message));
    		});
    	}
    };	
}

function initSendBox(db, $rootScope, $cordovaSQLite, callback){
	var query_create = 'CREATE TABLE IF NOT EXISTS send_box (id integer primary key, date text, sex text, age1 integer, age2 integer,'
						+ 'age3 integer, age4 integer, age5 integer, age6 integer, distance integer, paper_cnt integer, content text)';
	var query_drop = 'DROP TABLE IF EXISTS send_box';
	var query_insert = 'INSERT INTO send_box (date, sex, age1, age2, age3, age4, age5, age6, distance, paper_cnt, content) '
						+ 'values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
	var query_select = 'select * from send_box order by date desc';

	async.waterfall([
	    function(callback){
	    	$cordovaSQLite.execute(db, query_create, []).then(function(res){
	    		console.log('send_box :: create');
	    		callback(null);
	    	});
	    },
	    function(callback){
	    	$cordovaSQLite.execute(db, query_select, []).then(function(res){
        		$rootScope.sendlist = [];
        		for(var i=0; i<res.rows.length; i++){
        			var obj = res.rows.item(i);
            		$rootScope.sendlist.push(formatSendBox(obj));
        		}
        		console.log('send_box :: selected');
        		callback(null);
	    	});
	    }
	],
	function(err, result){
		if(err){ throw err; }
		console.log('send_box :: end');
		callback(null);
	});
	
    $rootScope.SendBox = {
        	remove: function(message){
        		var query = 'DELETE FROM send_box where id=?';
        		$cordovaSQLite.execute(db, query, [message.id]).then(function(res){
        			$rootScope.sendlist.splice($rootScope.sendlist.indexOf(message), 1);
        			console.log('send_box :: delete');
        		});
        	},
        	insert: function(message){
        		var args = [message.date, message.sex, message.age1, message.age2, message.age3, message.age4
        		            , message.age5, message.age6, message.distance, message.paper_cnt, message.content];
        		$cordovaSQLite.execute(db, query_insert, args).then(function(res){
        			message.id = res.insertId;
        			$rootScope.sendlist.splice(0, 0, formatSendBox(message));
        			console.log('send_box :: insert>' + JSON.stringify(message));
        		});
        	}
        };		
}

function initNotification($cordovaPush, $rootScope, $http, $cordovaToast, callback) {
	if (device.platform.toUpperCase() == 'ANDROID') {
		$cordovaPush.register({
			'senderID' : '185776228328'
		}).then(function(result) {
			console.log('GCM success::' + JSON.stringify(result));

		}, function(err) {
			console.error('GCM error::' + JSON.stringify(err));
			throw new Error('기기의 정보를 받아올 수 없습니다.');
		});

		$rootScope.$on('$cordovaPush:notificationReceived',
			function(event, notification) {
				switch (notification.event) {
				case 'registered':
					if (notification.regid.length > 0) {
						console.log('GCM:: registration ID = ' + notification.regid);
						callback(null, notification.regid);
					} else {
						console.error('GCM error:: cannot get registration ID');
						throw new Error('GCM error:: cannot get registration ID');
					}
					break;
				case 'message':
					receiveMessage($http, $rootScope, function(){
						console.log('GCM:: message receive!');
						$cordovaToast.showLongCenter('새로운 전단지가 도착했습니다!');
					});
					console.log('GCM:: message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
					// TODO 메세지 수신
					break;
				case 'error':
					console.error('GCM error :: ' + notification.msg);
					throw new Error('GCM error:: ' + notification.msg);
					break;
				default:
					console.error('GCM error:: An unknown GCM event has occurred');
					throw new Error('GCM error:: An unknown GCM event has occurred');
					break;
				}
			});
	}else{
		throw new Error('GCM error:: 안드로이드 기기가 아닙니다.');
	}
}

function formatSendBox(obj){
	switch(obj.sex){
		case 'A':
			obj.fmt_sex = '전체';
			break;
		case 'M':
			obj.fmt_sex = '남자';
			break;
		case 'F':
			obj.fmt_sex = '여자';
			break;
	}
	
	obj.fmt_age = '';
	if(obj.age1 === 1)
		obj.fmt_age = '10대';
	if(obj.age2 === 1){
		obj.fmt_age += obj.fmt_age? ',':'';
		obj.fmt_age += '20대';
	}
	if(obj.age3 === 1){
		obj.fmt_age += obj.fmt_age? ',':'';
		obj.fmt_age += '30대';
	}
	if(obj.age4 === 1){
		obj.fmt_age += obj.fmt_age? ',':'';
		obj.fmt_age += '40대';
	}
	if(obj.age5 === 1){
		obj.fmt_age += obj.fmt_age? ',':'';
		obj.fmt_age += '50대';
	}
	if(obj.age6 === 1){
		obj.fmt_age += obj.fmt_age? ',':'';
		obj.fmt_age += '60대';
	}
	switch(obj.distance){
		case 0:
			obj.fmt_distance = '전체';
			break;
		case 500:
			obj.fmt_distance = '500M';
			break;
		case 1000:
			obj.fmt_distance = '1KM';
			break;
		case 3000:
			obj.fmt_distance = '3KM';
			break;
		case 5000:
			obj.fmt_distance = '5KM';
			break;
		case 10000:
			obj.fmt_distance = '10KM';
			break;
		case 30000:
			obj.fmt_distance = '30KM';
			break;
		case 50000:
			obj.fmt_distance = '50KM';
			break;
	}
	return obj;
}
