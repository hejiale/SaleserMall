var app = getApp();
var request = require('../utils/Request.js')

//用户登录
function userLogin(cb) {
  var that = this;

  wx.login({
    success: function (res) {
      let options = {
        jsCode: res.code,
        appid: ConfigData.wechatId
      };

      request.login(options, function (data) {
        //保存客户登录信息
        Customer.openId = data.result.weChatUserInfo.weChatUserKey.openId;
        Customer.weChatAccount = data.result.weChatAccountObject.wechatAccount;
        //登录sessionId
        request.setSessionId(data.result.sessionId);

        typeof cb == "function" && cb(data.result.weChatUserInfo.customer);
      });
    }
  });
}
//校验用户登录状态
function valityLogigStatus(cb) {
  var that = this;

  request.valityLoginStatus(function (data) {
    if (data.retCode == 201 || data.retCode == 203) {
      typeof cb == "function" && cb(false);
    } else {
      typeof cb == "function" && cb(true);
    }
  });
}

var ConfigData = {
  //公众号key
  wechatAppKey: 'b2qux4BoxIrHE6VFqg54VHKtwAbZ02wwYfdXhKQZH+A=',
  //公众号密钥
  wechatSecret: '5FEE9C288C8442B6AAF74077A203DCB8',
  //公众号id 
  wechatId: 'wx88733d8309af5807',
  //qq地图key
  qqMapKey: '7KFBZ-DM533-AJE3Q-YOEM3-ZLKOS-EGBBL'
}

var Customer = {
  sessionId: null,
  weChatAccount: null,
  openId: null,
  companyId: null
}

module.exports = {
  userLogin: userLogin,
  valityLogigStatus: valityLogigStatus,
  ConfigData,
  Customer
}

