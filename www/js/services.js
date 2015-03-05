var ages = [
            {code:10, name:'10대', checked:true}
            , {code:20, name:'20대', checked:true}
            , {code:30, name:'30대', checked:true}
            , {code:40, name:'40대', checked:true}
            , {code:50, name:'50대', checked:true}
            , {code:60, name:'60대이상', checked:true}
            ];

angular.module('starter.services', [])
.factory('DbAccess', function($q){
	var DbAccess = {};
	var db = openDatabase("epaper.db","1.0", "EPaper", 5000000);
	
	DbAccess.ClearDownDB = function(tx) {
		var deferred = $q.defer();
		tx.executeSql('CREATE TABLE IF NOT EXISTS input_box (id integer primary key, date text, phone_no text, content text)',[], function(tx, res){
			tx.executeSql('CREATE TABLE IF NOT EXISTS send_box (id integer primary key, date text, sex text, age1 integer, age2 integer,'
					+ 'age3 integer, age4 integer, age5 integer, age6 integer, distance integer, paper_cnt integer, content text)', function(tx, res){
						console.log('Clear DB');
						$q.resolve(res);
					});
		});

		/*
		tx.executeSql('DROP TABLE IF EXISTS input_box',[], function(tx, res) {
			tx.executeSql('DROP TABLE IF EXISTS send_box',[], function(tx, res){
				tx.executeSql('CREATE TABLE IF NOT EXISTS input_box (id integer primary key, date text, phone_no text, content text)',[], function(tx, res){
					tx.executeSql('CREATE TABLE IF NOT EXISTS send_box (id integer primary key, date text, sex text, age1 integer, age2 integer,'
							+ 'age3 integer, age4 integer, age5 integer, age6 integer, distance integer, paper_cnt integer, content text)', function(tx, res){
								$q.resolve(res);
							});
				});
			});
		});
		*/
		
		return deferred.promise;
	};
	
	DbAccess.insertTest = function(tx) {
		var deferred = $q.defer();
		var messages = [
		                ['2015-03-02 09:22:33', '01022223333', '강아지 찾아요~ 요크셔테리 검은색, 빨간색 조끼에 방울 달았습니다. 찾아주시는 분에게 사례하겠습니다.'],
		                ['2015-03-02 10:25:43', '01022224444', '신사시장 입구 오이야채가게에서 지금부터1시간동안만 반짝세일합니다, 쪽파한단500원, 시금치한단600원, 브로컬리2송이 500원 어서들 오세요~'],
		                ['2015-03-02 10:32:13', '01022225555', '30분뒤 같이 소주한잔 하실분 연락주세요']
		               ];
		var send = ['2015-03-01 14:22:11', 'M', 1, 1, 1, 0, 0, 0, 1000, 100, '신림,봉청,낙성대역 근처 27세여자 경리직 구합니다. 3년경력 있고, 엑셀/파워포인트 아주 잘 다룹니다.'];
		var query1 = "INSERT INTO input_box(date, phone_no, content) VALUES (?,?,?)";
		var query2 = "INSERT INTO send_box (date, sex, age1, age2, age3, age4, age5, age6, distance, paper_cnt, content) ";
			query2 += "values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		tx.executeSql(query1, messages[0], function(tx, res){
			tx.executeSql(query1, messages[1], function(tx, res){
				tx.executeSql(query1, messages[2], function(tx, res){
					tx.executeSql(query2, send, function(tx, res){
						console.log("INSERT TEST");
						console.log(JSON.stringify(res));
						deferred.resolve(res);
					});
				});
			});
		});
		
	    return deferred.promise;
	};
	
	DbAccess.SingleResultHandler = function(deferred) {
		return function(tx, results) {
			var len = results.rows.length;
			var output_results = [];

			for (var i = 0; i < len; i++) {
				output_results.push(results.rows.item(i));
			}
			deferred.resolve(output_results[0]);
		};
	};

	DbAccess.MultipleResultHandler = function(deferred) {
		return function(tx, results) {
			var len = results.rows.length;
			var output_results = [];

			for (var i = 0; i < len; i++) {
				output_results.push(results.rows.item(i));
			}

			console.log('query executed!');
			deferred.resolve(output_results);
		};
	};
	
	DbAccess.DefaultErrorHandler = function(err) {
		console.log("Error processing SQL: " + JSON.stringify(err));
	};

	DbAccess.promisedQuery = function(query, successCB, errorCB) {
	    //console.log(query);
		var deferred = $q.defer();
		db.transaction(function(tx) {
			tx.executeSql(query, [], successCB(deferred), errorCB);
		}, errorCB);
		console.log(query);
		return deferred.promise;
	};
	
	DbAccess.executeQuery = function(query, args, errorCB){
		var deferred = $q.defer();
		db.transaction(function(tx) {
			tx.executeSql(query, args, function(tx,result){ deferred.resolve(result); }, errorCB);
		}, errorCB);
		console.log(query);
		return deferred.promise;
	};

//	db.transaction(DbAccess.ClearDownDB, DbAccess.DefaultErrorHandler);
//	db.transaction(DbAccess.insertTest, DbAccess.DefaultErrorHandler);
	
	return DbAccess;
})

.factory('Messages', function(DbAccess){
	var messages = [];
	return {
		all: function(){
			var query = "select * from input_box";
			messages = DbAccess.promisedQuery(query, DbAccess.MultipleResultHandler, DbAccess.DefaultErrorHandler);
			return messages;
		},
		remove: function(message){
			var query = "delete from input_box where id = ?";
			DbAccess.executeQuery(query, [message.id], DbAccess.DefaultErrorHandler);
			messages.splice(messages.indexOf(message), 1);
		},
		reject: function(message){
			this.remove(message);
		}
	};
})

.factory('SendSvc', function(){
	var sendlist = [{
		date: '2015-03-01 14:22:11',
		sex: 'M',
		ages: [10,20,30],
		distance: 1000,
		count: 100,
		content: '신림,봉청,낙성대역 근처 27세여자 경리직 구합니다. 3년경력 있고, 엑셀/파워포인트 아주 잘 다룹니다.'
	}];
	
	return {
		all: function(){
			return sendlist;
		},
		remove: function(message){
			sendlist.splice(sendlist.indexOf(message), 1);
		},
		send: function(message){
			sendlist.push(message);
		},
		init: function(){
			return {sex:'A'
				, ages: ages
				, distance: '0'
				, content: ''
				, count: 100};
		}
	};
	
})

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