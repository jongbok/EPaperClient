cordova.define("com.forif.cordova.plugin.kakao.KakaoPlugin.KakaoPlugin", function(require, exports, module) { /*global cordova, module*/

var KakaoPlugin = {
	link: function(options, successCallback, errorCallback){
		cordova.exec(successCallback, errorCallback, "KakaoPlugin", "link", [options]);
	}
};

module.exports = KakaoPlugin;
});
