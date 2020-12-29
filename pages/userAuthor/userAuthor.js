const app = getApp();
import api from '../api/api';
import wxBizDataCrypt from '../../utils/WXBizDataCrypt'
Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false,
    title: 'Hello',
    date:'',
    userInfo:'',
    hasUserInfo:false,
    isUpdate:false
  },
  onLoad:function(){
    var that = this;
			//that.isUpdate = that.$parseURL().isUpdate
			 if (that.canIUse){
				// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
				// 所以此处加入 callback 以防止这种情况
				app.userInfoReadyCallback = res => {
					that.userInfo=res.userInfo;
					that.hasUserInfo=true;
					that.getWeixinUserInfo()
				}
			}
      console.log(app.globalData)
  },
  getWeixinUserInfo(){
    let params = {
      unionId:app.globalData.unionId,
      appletOpenId:app.globalData.appletOpenId,
      headUrl:app.globalData.userInfo.avatarUrl,//这些是用户的基本信息
      nickName: app.globalData.userInfo.nickName,//获取昵称
      sex: app.globalData.userInfo.gender,//获取性别
      country: app.globalData.userInfo.country,//获取国家
      province: app.globalData.userInfo.province,//获取省份
      city: app.globalData.userInfo.city//获取城市
    };
    api.getWeixinUserInfo(params).then(res=>{
      console.log(res,'getWeixinUserInfo');
      if(res.isOk){
        app.globalData.weixinUserId = res.data.weixinUserId;
        //绑定类型为业主，是否绑定过
        app.globalData.ownerBind = res.data.ownerBind;
        app.globalData.cardType = res.data.cardType;
        app.globalData.cardNum = res.data.cardNum;
        app.globalData.realName = res.data.realName;
        app.globalData.isCretification = res.data.isCretification;
        wx.redirectTo({
          url: '../index/index'
        })
      }else{
        wx.showModal({
          title:'失败提示',
          content: result.info,
          showCancel:false
        })
      }
    })
  },
  wxGetUserInfo: function(e) {
    console.log(e,'e');
    let appId = app.globalData.appId;
    let sessionKey = app.globalData.sessionKey;
    if(e.detail.errMsg=='getUserInfo:ok'){
      app.globalData.hasAuthorize = true;
      console.log(app.globalData.hasAuthorize);
      let encryptedData = e.detail.encryptedData;
      let iv =  e.detail.iv;
      console.log(sessionKey,encryptedData,iv);

      let pc = new wxBizDataCrypt(appId, sessionKey);
      let data = pc.decryptData(encryptedData , iv);
      console.log(data,'sessionKey-data');
      app.globalData.unionId = data.unionId;
      app.globalData.appletOpenId = data.openId;
      this.userInfo=data;
      app.globalData.userInfo = data;
      this.hasUserInfo=true;
      this.getWeixinUserInfo()
    }else if(e.detail.errMsg=='getUserInfo:fail index deny'){
      app.globalData.hasAuthorize = false;
      wx.redirectTo({
        url:'../author/author'
      })
    }
  }

})
