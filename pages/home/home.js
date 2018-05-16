// pages/home/home.js
var app = getApp()

Page({
  data: {
    classList: [{ typeName: '精选' }],
    isShowClassView: 'hide',
    isShowProductListView: 'hide',
    isShowTemplateView: 'show',
    productList: [],
    templateList: null,
    currentType: "精选",
    currentPage: 1,
    pageSize: 20,
    singleLayoutWidth: 0,
    doubleLayoutWidth: 0,
    deviceWidth: 0,
    scrollLeft: 0,
    isShowEmpty: 'hide'
  },
  onLoad: function (options) {
    var that = this;
    that.setData({ singleLayoutWidth: app.globalData.singleLayoutWidth, doubleLayoutWidth: app.globalData.doubleLayoutWidth })

    app.getSystemInfo(function (systemInfo) {
      that.setData({
        deviceWidth: systemInfo.windowWidth,
      })
    })

    wx.showLoading({});
    that.getCompanyTemplate();
  },
  onSearchProduct: function () {
    wx.navigateTo({
      url: '../searchPage/searchPage',
    })
  },
  onShowClassView: function () {
    this.setData({ isShowClassView: '' });
  },
  onCloseClassCover: function () {
    this.setData({ isShowClassView: 'hide' });
  },
  onClassItemClicked: function (e) {
    var that = this;
    var item = e.currentTarget.dataset.key;

    that.setData({ scrollLeft: e.currentTarget.offsetLeft });
    that.chooseClassItem(item);
  },
  onCoverItemClicked: function (e) {
    var that = this;
    var item = e.currentTarget.dataset.key;
    that.chooseClassItem(item);
  },
  //选择类目
  chooseClassItem: function (item) {
    var that = this;

    that.setData({ currentType: item.typeName, isShowClassView: 'hide' });

    if (item.typeName == '精选') {
      that.getCompanyTemplate();
    } else {
      that.setData({ isShowProductListView: '', isShowTemplateView: 'hide', productList: [] });
      that.queryProductsRequest(item.typeId);
    }
  },
  onTemplateDetail: function (e) {
    var that = this;
    var item = e.currentTarget.dataset.key;

    app.globalData.templateObject = item;

    wx.navigateTo({
      url: '../productList/productList',
    })

  },
  onGoodsDetail: function (e) {
    var that = this;
    var item = e.currentTarget.dataset.key;

    wx.navigateTo({
      url: '../productDetail/productDetail?id=' + item.goodsId,
    })
  },
  onLoadMore: function () {
    var that = this;
    that.data.currentPage += 1;
    that.queryProductsRequest();
  },
  onBottomMenuToOrder: function () {
    wx.showLoading();

    app.valityLogigStatus(function (e) {
      if (e == false) {
        app.userLogin(function () {
          if (app.globalData.customer != null) {
            wx.hideLoading();

            wx.navigateTo({
              url: '../order/order',
            })
          } else {
            wx.hideLoading();

            wx.navigateTo({
              url: '../bindPhone/bindPhone',
            })
          }
        });
      } else {
        wx.hideLoading();

        wx.navigateTo({
          url: '../order/order',
        })
      }
    })
  },
  onBottomMenuToCart: function () {
    wx.showLoading();

    app.valityLogigStatus(function (e) {
      if (e == false) {
        app.userLogin(function () {
          if (app.globalData.customer != null) {
            wx.hideLoading();

            wx.navigateTo({
              url: '../cart/cart',
            })
          } else {
            wx.hideLoading();

            wx.navigateTo({
              url: '../bindPhone/bindPhone',
            })
          }
        });
      } else {
        wx.hideLoading();

        wx.navigateTo({
          url: '../cart/cart',
        })
      }
    })
  },

  onBgClicked: function () {
    this.setData({ isShowClassView: 'hide' });
  },
  //获取商店展示模板
  getCompanyTemplate: function () {
    var that = this;

    that.setData({ isShowProductListView: 'hide', isShowTemplateView: '', templateList: [], classList: [{ typeName: '精选' }] });

    app.getCompanyInfo(function () {
      let options = { companyId: app.globalData.belongCompany.id };

      app.globalData.request.getCompanyTemplate(options, function (data) {
        if (data.retCode == 401) {
          wx.showToast({
            title: '请前去后台配置模板',
            icon: 'none'
          })
        } else {
          var viewList = [];

          for (var i = 0; i < data.result.previewData.length; i++) {
            var value = data.result.previewData[i];
            if (value.type == "SESSION") {
              viewList.push(value);
            } else if (value.type == "NAVIGATION") {
              for (var j = 0; j < value.navDataBeans.length; j++) {
                var bean = value.navDataBeans[j];
                if (!bean.hide) {
                  that.data.classList.push(bean);
                }
              }
            }
          }

          if (viewList.length > 0) {
            that.setData({ isShowEmpty: 'hide' })
          } else {
            that.setData({ isShowEmpty: '' })
          }

          that.setData({ templateList: viewList, classList: that.data.classList });
          wx.hideLoading();
        }
      })
    })
  },
  //--------------查询商品----------------//
  queryProductsRequest: function (typeId) {
    var that = this;

    let options = {
      companyId: app.globalData.belongCompany.id,
      pageNumber: that.data.currentPage,
      pageSize: that.data.pageSize,
      typeId: typeId
    };

    app.globalData.request.queryProductList(options, function (data) {
      that.setData({ productList: that.data.productList.concat(data.resultList) });
      wx.hideLoading();
    })
  },
})