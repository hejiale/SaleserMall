// pages/searchPage/searchPage.js
var app = getApp();

Page({
  data: {
    historySearchWords: [],
    allProductList: [],
    isShowProductList: 'hide',
    isShowSearchView: '',
    showOrHide: 'hide',
    classList: [],
    parameterList: [],
    currentPage: 1,
    keyWord: '',
    startPrice: '',
    endPrice: '',
    lowPriceStr: '',
    heighPriceStr: '',
    isEndLoading: false,
    pageSize: 20,
    isFilter: false,
    scrollTop: 0,
    selectAllClass: [],
    selectAllParameter: [],
    doubleLayoutWidth: 0
  },
  //--------------页面初始化 加载分类商品参数----------------//
  onLoad: function () {
    var that = this;

    that.setData({ doubleLayoutWidth: app.globalData.doubleLayoutWidth});

    var historyKeywords = wx.getStorageSync(app.globalData.historySearchWords);
    if (historyKeywords.length > 0) {
      that.setData({ historySearchWords: historyKeywords });
    }
  },
  //--------------点击搜索记录查询商品----------------//
  onLastesItem: function (e) {
    var that = this;
    that.setData({ isShowProductList: '', isShowSearchView: 'hide', keyWord: e.currentTarget.dataset.key, isFilter: false });
    that.onResetProperty();
    that.filterProductsRequest();
  },
  //--------------清空搜索记录----------------//
  onClearHistoryWords: function () {
    var that = this;
    wx.removeStorage({
      key: app.globalData.historySearchWords,
      success: function (res) {
        that.setData({ historySearchWords: [] });
      }
    })
  },
  //--------------点击分类----------------//
  onClassClicked: function () {
    var that = this;
    that.setData({ showOrHide: '' });
    wx.showLoading({});

    let options = { companyId: app.globalData.belongCompany.id};

    app.globalData.request.queryProductCategory(options, function (data) {
      var classTypes = data.types;
      var parameters = data.parameters;

      for (var i = 0; i < that.data.selectAllClass.length; i++) {
        var item = that.data.selectAllClass[i];
        for (var j = 0; j < classTypes.length; j++) {
          var object = classTypes[j];
          if (object.type.typeId == item.type.typeId) {
            object.selected = true;
          }
        }
      }

      for (var i = 0; i < that.data.selectAllParameter.length; i++) {
        var item = that.data.selectAllParameter[i];
        for (var z = 0; z < parameters.length; z++) {
          var object = parameters[z];
          for (var j = 0; j < object.goodsParameters.length; j++) {
            var parameter = object.goodsParameters[j];
            if (parameter.id == item.id) {
              parameter.selected = true;
            }
          }
        }
      }
      that.setData({ classList: classTypes, parameterList: parameters, lowPriceStr: that.data.startPrice, heighPriceStr: that.data.endPrice });

      wx.hideLoading();
    })
  },
  onBgClicked: function () {
    this.setData({ showOrHide: 'hide', classList: null, parameterList: null });
  },
  onProductDetail: function (event) {
    var value = event.currentTarget.dataset.key;
    wx.navigateTo({
      url: '../productDetail/productDetail?id=' + value.goodsId,
    })
  },
  //--------------加载更多（提前加载）----------------//
  onLoadMore: function () {
    var that = this;
    that.data.currentPage += 1;
    that.queryProductsRequest();
  },
  //--------------选择类别操作----------------//
  onChooseClass: function (e) {
    var that = this;
    var item = e.currentTarget.dataset.key;

    for (var i = 0; i < that.data.classList.length; i++) {
      var object = that.data.classList[i];
      if (object.type.typeId == item.type.typeId) {
        object.selected = !item.selected;
      } else {
        object.selected = false;
      }
    }
    that.setData({ classList: that.data.classList });
  },
  chooseClass: function () {
    var that = this;

    for (var i = 0; i < that.data.classList.length; i++) {
      var object = that.data.classList[i];
      if (object.selected) {
        return object.type.typeId;
      }
    }
  },
  //--------------选择规则参数操作----------------//
  onSelectProperty: function (e) {
    var that = this;
    var item = e.currentTarget.dataset.key;

    for (var i = 0; i < that.data.parameterList.length; i++) {
      var object = that.data.parameterList[i];
      for (var j = 0; j < object.goodsParameters.length; j++) {
        var parameter = object.goodsParameters[j];
        if (parameter.id == item.id) {
          parameter.selected = !item.selected;
        }
      }
    }
    that.setData({ parameterList: that.data.parameterList });
  },
  chooseParameter: function () {
    var that = this;
    var allParameter = new Array();

    for (var i = 0; i < that.data.parameterList.length; i++) {
      var object = that.data.parameterList[i];
      for (var j = 0; j < object.goodsParameters.length; j++) {
        var parameter = object.goodsParameters[j];
        if (parameter.selected) {
          allParameter.push(parameter.id);
        }
      }
    }
    return allParameter;
  },
  //--------------确认操作----------------//
  onSureFilterProducts: function () {
    var that = this;
    that.addFilterParameter();
    that.setData({ showOrHide: 'hide', keyWord: '', isFilter: true });
    that.filterProductsRequest();
  },
  addFilterParameter: function () {
    var that = this;
    that.data.selectAllClass.splice(0, 1);
    that.data.selectAllParameter.splice(0, that.data.selectAllParameter.length);

    for (var i = 0; i < that.data.classList.length; i++) {
      var object = that.data.classList[i];
      if (object.selected) {
        that.data.selectAllClass.push(object);
      }
    }

    for (var i = 0; i < that.data.parameterList.length; i++) {
      var object = that.data.parameterList[i];
      for (var j = 0; j < object.goodsParameters.length; j++) {
        var parameter = object.goodsParameters[j];
        if (parameter.selected) {
          that.data.selectAllParameter.push(parameter);
        }
      }
    }
    that.setData({ startPrice: that.data.lowPriceStr, endPrice: that.data.heighPriceStr });
  },
  //--------------重置操作----------------//
  onResetProperty: function () {
    var that = this;
    that.clearFilterData();
  },
  //--------------清除筛选数据----------------//
  clearFilterData: function () {
    var that = this;

    for (var i = 0; i < that.data.classList.length; i++) {
      var object = that.data.classList[i];
      object.selected = false;
    }

    for (var i = 0; i < that.data.parameterList.length; i++) {
      var object = that.data.parameterList[i];
      for (var j = 0; j < object.goodsParameters.length; j++) {
        var parameter = object.goodsParameters[j];
        parameter.selected = false;
      }
    }
    that.setData({ parameterList: that.data.parameterList, classList: that.data.classList, lowPriceStr: '', heighPriceStr: '' });
  },
  //--------------输入价格操作----------------//
  onStartPriceClicked: function (event) {
    var that = this;
    if (parseFloat(event.detail.value) > parseFloat(that.data.heighPriceStr)) {
      that.setData({ lowPriceStr: '' });
      return;
    }
    that.setData({ lowPriceStr: event.detail.value });
  },
  onEndPriceClicked: function (event) {
    var that = this;
    that.setData({ heighPriceStr: event.detail.value });
  },
  //--------------输入框搜索商品----------------//
  onSearchInput: function (e) {
    var that = this;
    that.setData({ keyWord: e.detail.value, isFilter: false });
    that.onUpdateHistorySearchWords();
    that.onResetProperty();
    that.filterProductsRequest();
  },
  //--------------搜索商品初始化查询----------------//
  filterProductsRequest: function () {
    wx.showLoading({});

    var that = this;

    that.setData({ isShowProductList: '', isShowSearchView: 'hide', currentPage: 1, isEndLoading: false, scrollTop: 0, allProductList: [] });
    that.queryProductsRequest();
  },
  //--------------查询商品----------------//
  queryProductsRequest: function () {
    var that = this;

    if (that.data.isEndLoading) return;

    var options = new Object();
    options.companyId = app.globalData.belongCompany.id;
    options.pageNumber = that.data.currentPage;
    options.pageSize = that.data.pageSize;

    if (that.data.isFilter) {
      options.minPrice = that.data.startPrice;
      options.maxPrice = that.data.endPrice;
      if (that.chooseClass() > 0) {
        options.typeId = that.chooseClass();
      }
      if (that.chooseParameter().length > 0) {
        options.goodsParameterIds = that.chooseParameter().join(',');
      }
    } else {
      options.keyword = that.data.keyWord;
    }

    app.globalData.request.queryProductList(options, function (data) {
      that.setData({ allProductList: that.data.allProductList.concat(data.resultList) });

      wx.hideLoading();

      // if (data.resultList.length == 0) {
      //   if (that.data.allProductList.length == 0) {
      //     wx.showToast({
      //       title: '未查询到任何商品',
      //       icon: 'none',
      //       duration: 2000
      //     })
      //   }
      //   else {
      //     wx.showToast({
      //       title: '全部商品加载完',
      //       icon: 'none',
      //       duration: 2000
      //     })
      //   }
      // }
    })
  },
  //--------------本地保存商品搜索记录----------------//
  onUpdateHistorySearchWords: function () {
    var that = this;

    if (that.data.keyWord.length == 0) return;

    if (that.data.historySearchWords.length > 0) {
      if (that.data.historySearchWords.indexOf(that.data.keyWord) == -1) {
        that.data.historySearchWords.push(that.data.keyWord);
        wx.setStorageSync(app.globalData.historySearchWords, that.data.historySearchWords);
      }
    } else {
      var historyList = new Array();
      historyList.push(that.data.keyWord);

      wx.setStorage({
        key: app.globalData.historySearchWords,
        data: historyList,
      })
    }
  },
})