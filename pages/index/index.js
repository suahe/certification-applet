const app = getApp();
import api from '../api/api';
import checkIdCard from '../../utils/idCard'
Page({
    data: {
        hiddenBtn1: false,
        hiddenBtn2: true,
        hiddenBtn3:true,
        ownerBind: false,
        name: '',
        idCardNumber: '',
        isVeri: false,
        url: '',
        memberId: '',
        thoseAppid: 'wx0eb3c92db42a7596',//文房云展销小程序appid
        hnAppletAppid: 'wx7c24c7523f3e8853',//海南小程序appid
        redirectAppid:'',
        displayFlag:'',
        isCretification:0,
        isDisplay:false,
        checkAliveType:1,
        checkAliveTypeArray:[
            {'checkAliveType':0,'checkAliveTypeText':'读数字'},
            {'checkAliveType':1,'checkAliveTypeText':'屏幕闪烁'},
            {'checkAliveType':2,'checkAliveTypeText':'自动识别'}
        ]
    },
    // 获取输入真实姓名
    nameInput: function (e) {
        this.setData({
            name: e.detail.value
        })
    },
    // 获取输入密码
    idCardNumberInput: function (e) {
        this.setData({
            idCardNumber: e.detail.value
        })
    },
    bindCheckAliveTypeChange:function(e){
        //改变index值，通过setData()方法重绘界面
        this.setData({
            checkAliveType: e.detail.value
        });
    },
    onShow: function () {
        //小程序跳转实名认证
        let _this = this;
        //用于wxml页面按钮显示
        _this.setData({
            displayFlag:app.globalData.source
        })
        console.log(wx.getLaunchOptionsSync());
        let _refInfo = wx.getLaunchOptionsSync().referrerInfo;
        // wx.showToast({
        //   title: JSON.stringify(_refInfo.extraData),
        //   icon: 'none'
        // })
        //文房云展销小程序跳转
        if (_refInfo.appId && _refInfo.appId == this.data.thoseAppid) {
            console.log("文房云展销小程序跳转");
            _this.data.redirectAppid = _refInfo.appId;
            if (_refInfo.extraData && _refInfo.extraData.idcard && _refInfo.extraData.name && _refInfo.extraData.memberId) {
                wx.showToast({
                    title: '请点击下方按钮完成实名认证',
                    icon: 'none'
                })
                console.log('跳转参数:name='+_refInfo.extraData.name+',idcard='+_refInfo.extraData.idcard+',memberId='+_refInfo.extraData.memberId)
                _this.setData({
                    name: _refInfo.extraData.name,
                    idCardNumber: _refInfo.extraData.idcard,
                    memberId: _refInfo.extraData.memberId
                })
            }
        }
        //海南小程序跳转
        if (_refInfo.appId && _refInfo.appId == this.data.hnAppletAppid) {
            console.log("海南小程序跳转");
             _this.data.redirectAppid = _refInfo.appId;
            app.globalData.source = 'hn';
            if (_refInfo.extraData  && _refInfo.extraData.name && _refInfo.extraData.idcard&&_refInfo.extraData.weixinUserId) {
                wx.showToast({
                    title: '请点击下方按钮完成实名认证',
                    icon: 'none'
                })
                console.log('跳转参数:name='+_refInfo.extraData.name+
                    ',idcard='+_refInfo.extraData.idcard+
                    ',weixinUserId='+_refInfo.extraData.weixinUserId
                    +",realName="+_refInfo.extraData.realName
                    +",cardType="+_refInfo.extraData.cardType
                    +",cardNum="+_refInfo.extraData.cardNum
                    +",ownerBind="+_refInfo.extraData.ownerBind
                    +",isCretification="+_refInfo.extraData.isCretification);
                app.globalData.realName = _refInfo.extraData.realName;
                app.globalData.cardType = _refInfo.extraData.cardType;
                app.globalData.cardNum = _refInfo.extraData.cardNum;
                app.globalData.ownerBind = _refInfo.extraData.ownerBind;
                app.globalData.isCretification =_refInfo.extraData.isCretification;
                app.globalData.weixinUserId =_refInfo.extraData.weixinUserId;
                _this.setData({
                    name: _refInfo.extraData.name,
                    idCardNumber: _refInfo.extraData.idcard,
                });
                //身份证信息绑定，只能用该身份证信息人脸实名认证
                if (app.globalData.cardType == 'IDCard' && app.globalData.ownerBind) {
                    _this.setData({
                        ownerBind: true
                    })
                }
            }
        }
        //海南公众号跳转
        if (app.globalData.source == 'hn'||app.globalData.source == 'hk') {
            _this.setData({
                isCretification: app.globalData.isCretification,
                isDisplay: true
            });
            if (app.globalData.cardType == 'IDCard') {
                _this.setData({
                    name: app.globalData.realName,
                    idCardNumber: app.globalData.cardNum
                })
            }
            //身份证信息绑定，只能用该身份证信息人脸实名认证
            if (app.globalData.cardType == 'IDCard' && app.globalData.ownerBind) {
                _this.setData({
                    ownerBind: true
                })
            }
        }
    },
    // 实名认证
    auth: function (data) {
        let that = this;
        if(data){
            console.log('提交的证件信息：'+JSON.stringify(data.detail.value));
            that.data.name =  data.detail.value.name;
            that.data.idCardNumber = data.detail.value.idCardNumber;
        }
        if (that.data.name.length == 0 || that.data.idCardNumber.length == 0) {
            wx.showToast({
                title: '姓名和身份证号不能为空',
                icon: 'none',
                duration: 2000
            })
        } else {
            //未从其他实名认证公众号或小程序跳转过来
            if (!app.globalData.source&&!that.data.redirectAppid ) {
                console.log('无应用来源实名认证');
                /*wx.showModal({
                    title: '失败提示',
                    content: '需要从对应实名认证的公众号或小程序跳转，才能进行实名认证',
                    showCancel: false
                });
                return;*/
            }
            //校验身份证号
            if (!checkIdCard(that.data.idCardNumber)) {
                wx.showModal({
                    title: '失败提示',
                    content: '请填写正确的身份证号码',
                    showCancel: false
                });
                return;
            }
            //如果是海南校验实名认证，调用海南后端接口
            if (app.globalData.source == 'hn'||app.globalData.source == 'hk') {
                that.hnVerify();
            }else {
                this.startFacialRecognitionVerify()
            }

        }
    },
    //调用人脸识别
    startFacialRecognitionVerify:function(){
        let that = this;
        //调用微信的实名认证isCretification
        wx.startFacialRecognitionVerify({
            name: that.data.name,
            idCardNumber: that.data.idCardNumber,
            checkAliveType: that.data.checkAliveType,
            success(res) {
                console.log(res.verifyResult);
                console.log("调用实名认证后端接口")
                if (app.globalData.source == 'hn'||app.globalData.source == 'hk') {
                    that.subHnAuthInfo(res.verifyResult)
                }
                if (that.data.redirectAppid && that.data.redirectAppid == that.data.thoseAppid) {
                    that.backEndVeri(res.verifyResult);
                }
            },
            fail(res) {
                console.log(res);
                console.log('fail')
                console.log('msg:' + res.errMsg);
                console.log('errCode:' + res.errCode);
                console.log('verifyResult:' + res.verifyResult);
                if(res.errMsg&&res.errMsg.indexOf("光线太亮")!=-1){
                    //如果关系太暗就设置为0，采用读数字方式核验
                    wx.showModal({
                        title: '失败提示',
                        content: '光线太亮,是否切换人脸核验方式为数字重新核验?',
                        showCancel: true
                        ,success(res) {
                            if (res.confirm) {
                                console.log('用户点击确定，切换核验方式为读数字方式重新核验');
                                that.setData({
                                    checkAliveType: 0
                                });
                                that.auth();
                            }
                        }
                    });
                }
            },
            complete: function (res){
                console.log('complete')
                console.log('msg:' + res.errMsg);
                console.log('errCode:' + res.errCode);
                console.log('verifyResult:' + res.verifyResult);
            }
        })
    },
    //校验海南公众号提交认证的身份信息
    hnVerify: function () {
        let that = this;
        //判断已经非身份证类型不能人脸实名认证
        if (app.globalData.cardType != 'IDCard' && app.globalData.ownerBind) {
            wx.showModal({
                title: '失败提示',
                content: '非身份证类型绑定，请通过申诉实名认证',
                showCancel: false
            });
            return false;
        }
        //判断是否已经实名认证过了
        if (app.globalData.isCretification == '1'
            && app.globalData.realName == that.data.name
            && app.globalData.cardType == 'IDCard'
            && app.globalData.cardNum == that.data.idCardNumber) {
            if(that.data.redirectAppid){
                wx.showModal({
                    title: '失败提示',
                    content: '该身份证号已实名认证过',
                    showCancel: false
                });
            }else {
                wx.showModal({
                    title: '失败提示',
                    content: '该身份证号已实名认证过,您可以到公众号绑定房屋',
                    showCancel: false
                });
            }
            return false;
        }
        this.startFacialRecognitionVerify()
    },
    subHnAuthInfo: function (verifyResult) {
        let that = this;
        //请求后端
        api.certification({
            verifyResult: verifyResult,
            weixinUserId: app.globalData.weixinUserId,
            name: that.data.name,
            idCardNumber: that.data.idCardNumber,
        }).then(res => {
            console.log(res);
            if (res.isOk) {
                wx.showToast({
                    title: '实名认证成功',
                    icon: 'success',
                    duration: 2000
                });
                //设置按钮隐藏
                that.setData({
                    isVeri: true,
                    isCretification:1
                });
            } else {
                wx.showModal({
                    title: '失败提示',
                    content: res.info,
                    showCancel: false
                })
            }
        })
    },
    //文房云展销小程序跳转实名认证
    backEndVeri: function (result) {
        console.log("小程序调用后端接口，verify_result="+result)
        let _this = this;
        wx.request({
            url: 'https://wcfdczxpt.iwy360.com/fczx/center/wx/rg/secondVerify',
            data: {
                verify_result: result,
                membId: _this.data.memberId,
                // membId: '04b8ba8cfbd64fc6be5b7b3e3014283b',
                name: _this.data.name,
                idcard: _this.data.idCardNumber
            },
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            success(res) {
                res = res.data;
                console.log("调用小程序后端接口返回数据："+JSON.stringify(res));
                if (res.data === '0') {
                    console.log(res.data);

                    wx.showToast({
                        title: '身份验证完成！',
                        icon: 'none'
                    });
                    _this.setData({
                        isVeri: true
                    });

                } else {
                    if (res.message == '未携带用户ID！') {
                        wx.showToast({
                            title: '用户校验失败！请确认是否从【文房云展销】小程序进入。',
                            icon: 'none',
                            duration: 3000
                        })
                    }
                }
            }
        })
    },
    backApp: function () {
        let _this = this;
        //文房云展销小程序返回
        if (_this.data.memberId && _this.data.memberId.length > 0) {
            console.log("点击返回文房云展销小程序")
            wx.showToast({
                title: '正在返回。',
                icon: 'none'
            });
            wx.navigateBackMiniProgram({
                extraData: {
                    membId: _this.data.memberId
                },
                success(res) {
                    // 返回成功
                }
            })
        }
        //海南小程序返回
        if (app.globalData.weixinUserId && app.globalData.weixinUserId.length > 0 && app.globalData.source == 'hn') {
            console.log("点击返回海南小程序")
            wx.showToast({
                title: '正在返回。',
                icon: 'none'
            });
            wx.navigateBackMiniProgram({
                extraData: {
                    weixinUserId: app.globalData.weixinUserId
                },
                success(res) {
                    // 返回成功
                }
            })
        }

    },
});
