'use strict';

var Promise = require('bluebird');
var userRemote = require('../remote/dubboRemote').userRemote;
var XXTea = require('../util/XXTeaUtil');
var env = require('../config/config').env;
var USER_ENCRYPT_KEY = 'center'; //与会员服务约定的uid解密key
var UserService = {
    /**
     * 查询当前用户id，sync method
     * @param req
     * @returns uid
     */
    queryUserId: function queryUserId(req) {
        if (!req) return null;
        try {
            var pgc = req.cookies.PGC;
            if (!pgc) return null;
            return XXTea.decryptFromBase64(pgc, USER_ENCRYPT_KEY);
        } catch (e) {}
        return null;
    },
    /**
     * 查询当前用户信息
     * @param req
     * @returns a  promise of userInfo
     */
    queryUserInfo: function queryUserInfo(req) {
        var uid = this.queryUserId(req);
        return new Promise(function (resolve, reject) {
            if (env == 'DEV') {
                return resolve({ rs: 1, data: { trueName: 'test', userId: 123456 } });
            }
            if (!uid) return reject({ rs: 0, msg: '当前未登录或已过期' });
            userRemote.excute('queryUser', [{ $class: 'java.lang.Long', '$': parseFloat(uid) }], function (err, dto) {
                if (err) {
                    console.log('invoke queryUser error:', err);
                    return reject({ rs: 0, msg: '内部服务异常' });
                }
                //处理数据
                if (!dto) {
                    return reject({ rs: 0, msg: '用户不存在' });
                }
                resolve({ rs: 1, data: dto });
            });
        });
    }
};
module.exports = UserService;

//# sourceMappingURL=userService-compiled.js.map