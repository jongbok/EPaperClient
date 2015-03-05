// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
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
    
	var inputs = [{
		phoneNo: '01022223333',
		date: '2015-03-02 09:22:33',
		content: '강아지 찾아요~ 요크셔테리 검은색, 빨간색 조끼에 방울 달았습니다. 찾아주시는 분에게 사례하겠습니다.'
	},
	{
		phoneNo: '01022224444',
		date: '2015-03-02 10:25:43',
		content: '신사시장 입구 오이야채가게에서 지금부터1시간동안만 반짝세일합니다, 쪽파한단500원, 시금치한단600원, 브로컬리2송이 500원 어서들 오세요~'
	},
	{
		phoneNo: '01022225555',
		date: '2015-03-02 10:32:13',
		content: '30분뒤 같이 소주한잔 하실분 연락주세요'
	}];
    var db = window.sqlitePlugin.openDatabase("epaper.db","1.0", "EPaper", 5000000);
    db.transaction(function(tx) {
    	tx.executeSql('DROP TABLE IF EXISTS input_box',[], function(tx,res){
    		tx.executeSql('CREATE TABLE IF NOT EXISTS input_box (id integer primary key, date text, phone_no text, content text)',[], function(tx, res){
    			for(var i=0; i<inputs.length; i++){
    				tx.executeSql('INSERT INTO input_box(date, phone_no, content) VALUES (?, ?, ?)', [inputs[i].date, inputs[i].phoneNo, inputs[i].content]);
    			}
    		});
    	});
    });
    
	var sendlist = [{
		date: '2015-03-01 14:22:11',
		sex: 'M',
		age1: true,
		age2: true,
		age3: true,
		age4: false,
		age5: false,
		age6: false,
		distance: 1000,
		paper_cnt: 100,
		content: '신림,봉청,낙성대역 근처 27세여자 경리직 구합니다. 3년경력 있고, 엑셀/파워포인트 아주 잘 다룹니다.'
	}];
	db.transaction(function(tx) {
		tx.executeSql('DROP TABLE IF EXISTS send_box',[], function(tx, res){
			tx.executeSql('CREATE TABLE IF NOT EXISTS send_box (id integer primary key, date text, sex text, age1 integer, age2 integer,'
					+ 'age3 integer, age4 integer, age5 integer, age6 integer, distance integer, paper_cnt integer, content text)',[], function(tx, res){
						for(var i=0; i<sendlist.length; i++){
							tx.executeSql('INSERT INTO send_box (date, sex, age1, age2, age3, age4, age5, age6, distance, paper_cnt, content) ' 
									+ 'values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
									, [sendlist[i].date, sendlist[i].sex, sendlist[i].age1, sendlist[i].age2, sendlist[i].age3, sendlist[i].age4, sendlist[i].age5, sendlist[i].age6
									   , sendlist[i].distance, sendlist[i].paper_cnt, sendlist[i].content]);
						}
					});			
		});
	});
    db.close(function(){
    	console.log('database closed');
    	}, function(err){
    		console.error(err);
    	});
	
    var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });
    if(device.platform.toUpperCase() == 'ANDROID'){
      window.plugins.pushNotification.register(successHandler,errorHandler, {
        "senderID" : "185776228328", // Google GCM 서비스에서 생성한 Project Number를 입력한다.
        "ecb" : "onNotificationGCM" // 디바이스로 푸시가 오면 onNotificationGCM 함수를 실행할 수 있도록 ecb(event callback)에 등록한다.
      });
      
      if(typeof inappbilling !== "undefined"){
    	  inappbilling.init(function(resultInit) {
              inappbilling.getPurchases(function(result) {
                  console.log("PURCHASE RESPONSE -> " + JSON.stringify(result));
              }, 
              function(errorPurchases) {
                  console.log("PURCHASE ERROR -> " + errorPurchases);
              });
          }, 
          function(errorInit) {
              console.log("INITIALIZATION ERROR -> " + errorInit);
          }, 
          {showLog: true},
          ["paper_coin_50"]);
      }
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
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

/**
 * onNotificationGCM
 *
 * @param e
 *
 * 안드로이드 디바이스로 푸시 메세지를 받을 때 호출되는 함수, window.plugins.pushNotification.register 옵션에 설정에서 ecb의 이름에 매칭된다.
 */
function onNotificationGCM (e){
    switch (e.event) {
    case 'registered': // 안드로이드 디바이스의 registerID를 획득하는 event 중 registerd 일 경우 호출된다.
      console.log('registerID:' + e.regid);
      break;
    case 'message': // 안드로이드 디바이스에 푸시 메세지가 오면 호출된다.
      {
        if (e.foreground){ // 푸시 메세지가 왔을 때 앱이 실행되고 있을 경우
          var soundfile = e.soundname || e.payload.sound;
          var my_media = new Media("/android_asset/www/" + soundfile);
          my_media.play();
        } else { // 푸시 메세지가 왔을 때 앱이 백그라운드로 실행되거나 실행되지 않을 경우
          if (e.coldstart) { // 푸시 메세지가 왔을 때 푸시를 선택하여 앱이 열렸을 경우
            console.log("알림 왔을 때 앱이 열리고 난 다음에 실행 될때");
          } else { // 푸시 메세지가 왔을 때 앱이 백그라운드로 사용되고 있을 경우
            console.log("앱이 백그라운드로 실행될 때");
          }
        }

        console.log(e.payload.title);

        navigator.notification.alert(e.payload.title);
      }
      break;
    case 'error': // 푸시 메세지 처리에 에러가 발생하면 호출한다.
      console.log('error:' + e.msg);
      break;
    case 'default':
      console.log('알수 없는 이벤트');
      break;
    }
  }


function onSuccess(position) {
	console.log('Latitude: '  + position.coords.latitude + ', Longitude:' + position.coords.longitude);
}

 // onError Callback receives a PositionError object
 //
 function onError(error) {
     alert('code: '    + error.code    + '\n' +
           'message: ' + error.message + '\n');
 }
 
 /**
  * errorHandler
  *
  * @param err
  *
  * 에러 핸들러 콜백 함수.
  */
 function errorHandler(err){
	 var strError = "";
	 if(typeof err === 'object') {
		 strError = JSON.stringify(err);
	 } else {
		 strError = err;
	 }	 
	 alert('error:' + strError);
 }

 /**
  * successHandler
  *
  * @param result
  *
  * 디바이스로 푸시 메세지를 받았을 때 뱃지처리 이후 호출하는 콜백함수
  */
 function successHandler(result){
	 var strResult = "";
	 if(typeof result === 'object') {
		 strResult = JSON.stringify(result);
	 } else {
		 strResult = result;
	 }	 
	 alert('result:' + strResult);
 }
