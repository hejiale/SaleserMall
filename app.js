//app.js
var request = require('utils/Request.js')
var MD5 = require('utils/md5.js')

App({
  onLaunch: function () {
    var that = this

    that.getSystemInfo(function (systemInfo) {
      that.globalData.singleLayoutWidth = ((systemInfo.windowWidth * 0.8 * 9) / 16);
      that.globalData.doubleLayoutWidth = ((systemInfo.windowWidth * 0.5 * 0.8 * 9) / 16);
    })
  },
  //获取设备信息
  getSystemInfo: function (cb) {
    var that = this;
    if (that.globalData.systemInfo) {
      typeof cb == "function" && cb(that.globalData.systemInfo)
    } else {
      wx.getSystemInfo({
        success: function (res) {
          that.globalData.systemInfo = res;
          typeof cb == "function" && cb(that.globalData.systemInfo)
        }
      })
    }
  },
  //用户登录
  userLogin: function (cb) {
    var that = this;

    let appId = "wx88733d8309af5807";//(冰点云公众号)

    wx.login({
      success: function (res) {
        console.log(res);
        let options = {
          jsCode: res.code,
          appid: appId,//公众号id 
          webappId: 'wx5b154126263c8ae8',//小程序id
          webappSecret: '9991e37811529d7cd0a5812add295d62'//小程序密钥
        };

        that.globalData.request.login(options, function (data) {
          that.globalData.customer = data.result.weChatUserInfo.customer;
          that.globalData.weChatUser = data.result.weChatUserInfo.weChatUserKey;
          that.globalData.weChatAccountObject = data.result.weChatAccountObject;
          that.globalData.request.setSessionId(data.result.sessionId);
          typeof cb == "function" && cb();
        });
      }
    });
  },
  //校验用户登录状态
  valityLogigStatus: function (cb) {
    var that = this;

    that.globalData.request.valityLoginStatus(function (data) {
      if (data.retCode == 201 || data.retCode == 203) {
        typeof cb == "function" && cb(false);
      } else {
        typeof cb == "function" && cb(true);
      }
    });
  },
  //获取公司信息
  getCompanyInfo: function (cb) {
    var that = this;

    let appId = "wx88733d8309af5807";//(冰点云公众号)

    let options = {
      appid: appId,//公众号id 
    };

    that.globalData.request.getCompanyInfo(options, function (data) {
      if (data.retCode == 202) {
        wx.showToast({
          title: data.retMsg,
          icon: 'none'
        })
      }
      that.globalData.belongCompany = data.result;
      typeof cb == "function" && cb();
    });
  },
  globalData: {
    //微信登录用户信息
    userInfo: null,
    //设备信息
    systemInfo: null,
    request: request,
    MD5: MD5,
    //公司id
    belongCompany: null,
    //登录用户信息
    customer: null,
    weChatUser: null,
    weChatAccountObject: null,
    //本地保存商品搜索记录key
    historySearchWords: 'historySearchWordsKey',
    //下单商品集合
    orderProducts: null,
    //专场详情object
    templateObject: null,
    //商品双排 单排高度
    singleLayoutWidth: 0,
    doubleLayoutWidth: 0,
    //公众号key
    wechatAppId:'b2qux4BoxIrHE6VFqg54VHKtwAbZ02wwYfdXhKQZH+A='
  }
})