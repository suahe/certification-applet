import http from '../../utils/wxRequest';

export default {
  //获取小程序appletOpenId
  login(params){
        return http.request_post('/api/wx/user/getAppletUserBase',params);
  },
  //授权登录设置用户信息
  getWeixinUserInfo (params) {
    return http.request_post('/api/wx/user/appletCertificationGetUserInfo', params);
  },
  //实名认证
  certification (params) {
    return http.request_json_post('/api/wx/user/appletCertification', params);
  },

}


