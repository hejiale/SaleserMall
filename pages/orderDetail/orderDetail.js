// pages/orderDetail/orderDetail.js
var app = getApp();

Page({
  data: {
    orderDetail: null,
    showFoot: 'hide',
    productList: [],
    isShowOpmetory: 'hide',
    defaultOpmetory: null,
    isShowMemberRights: 'hide'
  },
  onLoad: function (options) {
    var that = this;

    let parameter = {
      orderId: options.id
    };

    app.globalData.request.queryOrderDetail(parameter, function (data) {

      var products = data.result.snapshots;

      for (var j = 0; j < products.length; j++) {
        var goods = products[j];
        if (goods.models.length > 0) {

          var appendStr = '';
          for (var z = 0; z < goods.models.length; z++) {
            var spec = goods.models[z];
            appendStr += spec.specificationName + ':' + spec.specificationValue + ' ';
            goods.specification = appendStr;
          }
        }
      }

      that.setData({ orderDetail: data.result });
    });
  },
  onCall: function(){
    var that = this;

    wx.makePhoneCall({
      phoneNumber: that.data.orderDetail.order.netPointPhone,
    })
  }
})