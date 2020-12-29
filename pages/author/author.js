const app = getApp();
import api from '../api/api';
import wxBizDataCrypt from '../../utils/WXBizDataCrypt'

Page({
    data: {},
    onLoad: function (options) {
        console.log('跳转参数：' + JSON.stringify(options));
        let that = this;
        options.source= 'hn'; //模拟海南跳转测试
        // options.source= 'hk'; //模拟海口跳转测试
        if (options&&options.source) {
            app.globalData.source = options.source;
            if (options.source == 'hn') {
                console.log("海南公众号跳转");
                that.hnAuthor();
            }else if(options.source == 'hk'){
                console.log("海口公众号跳转");
                that.hnAuthor();
            }
        } else {//未从其他应用跳转过来
            console.log("无应用跳转");
            //that.hnAuthor();
            wx.redirectTo({
                url: '../index/index'
            })
        }
    },
    hnAuthor() {
        let that = this;
        wx.login({
            success: (res_login) => {
                console.log(res_login);
                api.login({code: res_login.code, source: '1'}).then(result => {
                    console.log(result);
                    if (result.isOk) {
                        app.globalData.sessionKey = result.data.sessionKey;
                        app.globalData.appId = result.data.appId;
                        wx.getSetting({
                            success: (res) => {
                                if (res.authSetting['scope.userInfo']) {
                                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                                    app.globalData.hasAuthorize = true;
                                    wx.getUserInfo({
                                        withCredentials: true,
                                        lang: 'zh_CN',
                                        success: res => {
                                            // 可以将 res 发送给后台解码出 unionId
                                            app.globalData.userInfo = res.userInfo;
                                            console.log(res, 'getUserInfo');
                                            debugger
                                            /*let appId = result.data.appId;
                                            let sessionKey = result.data.sessionKey;*/
                                            let appId = 'wx7c24c7523f3e8853';
                                            let sessionKey = 'Etc6aKfwzOiOjx5q3OUiaQ==';
                                            let encryptedData = res.encryptedData;
                                            let iv = res.iv;
                                            console.log(sessionKey, encryptedData, iv);
                                            let pc = new wxBizDataCrypt(appId, sessionKey);
                                            let data = pc.decryptData(encryptedData, iv);
                                            console.log(data, 'sessionKey-data');
                                            app.globalData.unionId = data.unionId;
                                            app.globalData.appletOpenId = data.openId;
                                            app.globalData.userInfo = res.userInfo;
                                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                                            // 所以此处加入 callback 以防止这种情况
                                            if (app.userInfoReadyCallback) {
                                                app.userInfoReadyCallback(res);
                                                console.log(res, 'calback');
                                            }
                                            that.getWeixinUserInfo()
                                        }
                                    })
                                } else {
                                    wx.redirectTo({
                                        url: '../userAuthor/userAuthor'
                                    })
                                }
                            },
                        })
                    } else {
                        wx.showModal({
                            title: '失败提示',
                            content: result.info,
                            showCancel: false
                        })
                    }
                })
            },
        })
    },
    getWeixinUserInfo() {
        let that = this;
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
        api.getWeixinUserInfo(params).then(res => {
            console.log(res, 'getWeixinUserInfo');
            if (res.isOk) {
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
            } else {
                wx.showToast({
                    title: '小程序授权失败，失败原因：' + res.info,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    }
})
