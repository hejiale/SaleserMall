// pages/person/order/order.js
var app = getApp();

Page({
  data: {
    orderList: [],
    currentPage: 1,
    orderType: null,
    keyword: null,
  },
  onLoad: function () {
    var that = this;
    that.queryOrderList();
  },
  onShow: function () {

  },
  onAllOrder: function () {
    var that = this;
    that.setData({ orderType: null, orderList: [], currentPage: 1, keyword: null });
    that.queryOrderList();
  },
  onUnProcess: function () {
    var that = this;
    that.setData({ orderType: 'UNTREATED', orderList: [], currentPage: 1, keyword: null });
    that.queryOrderList();
  },
  onProcess: function () {
    var that = this;
    that.setData({ orderType: 'PROCESSED', orderList: [], currentPage: 1, keyword: null });
    that.queryOrderList();
  },
  //跳转订单详情页面
  onOrderDetail: function (event) {
    var value = event.currentTarget.dataset.key;

    wx.navigateTo({
      url: '../orderDetail/orderDetail?id=' + value.order.orderId
    })
  },
  onSearchInput: function (e) {
    var that = this;
    that.setData({ keyword: e.detail.value, orderList: [], currentPage: 1 });
    that.queryOrderList();
  },
  //加载更多
  onLoadMore: function () {
    var that = this;
    that.data.currentPage += 1;
    that.queryOrderList();
  },
  //查询订单列表
  queryOrderList: function () {
    var that = this;

    //PROCESSED 已处理 UNTREATED
    wx.showLoading();

    let options = {
      pageNumber: that.data.currentPage,
      pageSize: 10,
      order: { orderStatus: that.data.orderType, orderSerialNumber: that.data.keyword },
    };

    app.globalData.request.queryOrderList(options, function (data) {

      for (var i = 0; i < data.result.resultList.length; i++){
        var products = data.result.resultList[i].snapshots;
        for(var j = 0; j < products.length; j++){
          var goods = products[j];
          if (goods.models.length > 0){
      
            var appendStr = '';
            for (var z = 0; z < goods.models.length; z++) {
              var spec = goods.models[z];
              appendStr += spec.specificationName + ':' + spec.specificationValue + ' ';
              goods.specification = appendStr;
            }
          }
        }
      }

      that.setData({ orderList: that.data.orderList.concat(data.result.resultList) })

      wx.hideLoading();

      if (data.resultList.length == 0) {
        if (that.data.orderList.length == 0) {
          wx.showToast({
            title: '未查询到任何订单',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '全部订单加载完',
            icon: 'none',
            duration: 2000
          })
        }
      }
    });
  }
})