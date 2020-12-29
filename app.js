//app.js
App({

  onLaunch: function () {
    var that = this
    wx.getSystemInfo({
    success: function (res) {
      that.globalData.screenWidth = res.windowWidth;
      that.globalData.screenHight = res.windowHeight;
      that.globalData.screenWidthScale = res.windowWidth/750;
      that.globalData.screenHightScale = res.windowHeight/1334;
    }
    })
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    screenWidthScale:0.0,
    screenHightScale:0.0,
    screenWidth:0,
    screenHight:0,
    source:null,//跳转来源
    userInfo:null,
    weixinUserId:null,
    unionId:null,
    appletOpenId:null,
    isIos:false,
    sessionKey:null,
    appId:null,
    handleUnbind:false,
    hasAuthorize:false,
    ownerBind:false,//绑定类型为业主的，是否绑定过房屋
    cardType:null,
    cardNum:null,
    realName:null,
    isCretification:null //是否实名认证过 1为实名认证过
  }
})
