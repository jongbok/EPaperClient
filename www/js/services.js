var ages = [
            {code:10, name:'10대', checked:true}
            , {code:20, name:'20대', checked:true}
            , {code:30, name:'30대', checked:true}
            , {code:40, name:'40대', checked:true}
            , {code:50, name:'50대', checked:true}
            , {code:60, name:'60대이상', checked:true}
            ];

angular.module('starter.services', [])

.factory('Messages', function(){
	var messages = [];
	return {
		all: function(){
			var db = window.sqlitePlugin.openDatabase("epaper.db","1.0", "EPaper", 5000000);
			db.transaction(function(tx) {
				tx.executeSql("select * from input_box", [], function(tx, res) {
					for(var i=0; i<res.rows.length; i++){
						messages.push({
							id: res.rows.item(i).id,
							date: res.rows.item(i).date,
							phoneNo: res.rows.item(i).phone_no,
							content: res.rows.item(i).content
						});
					}
					return messages;
				});
			},
			function(e) {
		        console.log("ERROR: " + e.message);
		    });
		},
		remove: function(message){
			/*
			db.transaction(function(tx) {
				tx.executeSql("delete from input_box where id=?", [message.id], function(tx, res){
					messages.splice(messages.indexOf(message), 1);
				});
			},
			function(e) {
		        console.log("ERROR: " + e.message);
		    });
			*/
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