/**
 * 请求方法,这里就写两种最常用的
 * 其他的请求方式同理(微信官网提供了OPTIONS,HEAD,PUT,DELETE,TRACE,CONNECT)
 */
function request_post(url, data) {
    let param = packagingParam(url, data, "POST", "application/x-www-form-urlencoded;charset=UTF-8");
    return WXRequest(param);
}

function request_get(url, data) {
    let param = packagingParam(url, data, "GET", "application/x-www-form-urlencoded;charset=UTF-8");
    return WXRequest(param);
}

function request_json_post(url, data) {
    let param = packagingParam(url, data, "POST", "application/json;charset=UTF-8");
    return WXRequest(param);
}

function request_json_get(url, data) {
    let param = packagingParam(url, data, "GET", "application/json;charset=UTF-8");
    return WXRequest(param);
}

/**
 * 封装参数
 */
function packagingParam(url, data, method, contentType) {
    var param = {};
    param.url = url;
    param.data = data;
    param.method = method;
    param.contentType = contentType;
    return param;
}

/**
 * 发送请求
 * 这里的header只写了一种，一般都需要传输token，用户前后接口的调用的校验
 * 还有的加入了Cookie，加入到header中即可
 */

// const hnBaseURL = 'https://wuye.iwy360.com';//海南正式环境
const hnBaseURL = 'http://xmzhxq.hymake.net';//测试环境
const hkBaseURL = 'https://haimai.iwy360.com';//海口正式环境
// const hkBaseURL = 'http://jjzhxq.hymake.net/';//测试环境

// const hkBaseURL = 'http://8i94y2.natappfree.cc';//本地环境

function WXRequest(param) {
    //用于请求的计时
    console.time('请求用时：');
    //遮罩提示，这个可以写成公用的调用，这里就简单说明
    //授权认证有转圈提示不需要遮罩层
    if (param.url != '/api/wx/user/getAppletUserBase'
        && param.url != '/api/wx/user/appletCertificationGetUserInfo') {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
    }
    return new Promise((resolv, reject) => {
        var app = getApp();
        var baseURL = '';
        if (app.globalData.source == 'hn') {
            baseURL = hnBaseURL;
        } else if (app.globalData.source == 'hk') {
            baseURL = hkBaseURL;
        }
        console.log('请求地址：' + baseURL + param.url);
        if (baseURL != null && baseURL != '') {
            wx.request({
                url: baseURL + param.url,
                data: param.data,
                method: param.method,
                header: {
                    'Content-Type': param.contentType
                },
                success: function (res) {
                    if (res.data == '服务器异常') {
                        wx.showModal({
                            title: '提示',
                            content: '网络错误或服务器繁忙!',
                        })
                    } else {
                        resolv(res.data);
                    }
                },
                fail: function (err) {
                    reject(err)
                    wx.showModal({
                        title: '提示',
                        content: '网络错误或服务器繁忙!',
                    })
                },
                complete: function (com) {
                    wx.hideLoading();
                    console.timeEnd('请求用时：' + param.url);
                }
            })
        }
    })
}

//最后把方法暴露出去
module.exports = {
    request_post, request_get, request_json_post, request_json_get
}
