// pages/store/store.js
// var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
// var map = new QQMapWX({
//   key: '7KFBZ-DM533-AJE3Q-YOEM3-ZLKOS-EGBBL'
// });
var amapFile = require('../../utils/amap-wx.js');
var app = getApp();

Page({
  data: {
    storeList: null,
    keyword: '',
    imageHeight: 0
  },
  onLoad: function () {
    var that = this;
    that.queryStoreList();

    app.getSystemInfo(function (systemInfo) {
      that.setData({
        imageHeight: (((systemInfo.windowWidth - 40)*9)/16),
      })
    })
  },
  onSelectStore: function (event) {
    var that = this;
    var item = event.currentTarget.dataset.key;

    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]  //上一个页面

    prevPage.setData({
      currentStore: item
    })
    wx.navigateBack()
  },
  onSearchInput: function (event) {
    var that = this;
    that.setData({ keyword: event.detail.value, storeList: null });
    that.queryStoreList();
  },
  onCall: function (event){
    var that = this;
    var item = event.currentTarget.dataset.key;

    wx.makePhoneCall({
      phoneNumber: item.phone,
    })
  },
  //查询门店列表
  queryStoreList: function () {
    var that = this;

    let options = {
      key: app.globalData.wechatAppId,
      keyword: that.data.keyword
    };

    wx.showLoading({})

    app.globalData.request.queryStoreList(options, function (data) {
      if(data.result.content.length > 0){
        that.setData({ storeList: data.result.content });
      }else{
        wx.showToast({
          title: '未搜索到附近门店',
          icon:'none'
        })
      }
      wx.hideLoading();
    });
  },
  //计算店铺距离
  calculateDistance: function (stores) {
    var that = this;

    for (var i = 0; i < stores.length; i++) {
      (function (i) {
        var store = stores[i];
        map.calculateDistance({
          to: [{
            latitude: store.latitude,
            longitude: store.longitude
          }],
          complete: function (res) {
            console.log(res);
            // var longDistance = res.result.elements[0].distance;

            store.distance = longDistance

            // if (longDistance >= 1000) {
            //   var distance = (longDistance / 1000).toFixed(0);
            //   store.distance = distance + '公里';
            // } else {
            //   store.distance = distance + '米';
            // }
            that.setData({ storeList: stores });

            if (i == stores.length - 1) {
              wx.hideLoading();
            }
          }
        })
      }(i))
    }
  }
})

