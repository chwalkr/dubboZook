
var DateUtil = require('./DateUtil');
var UUID = require('node-uuid');
var Util = {};

Util.genOrderCD = function(){
    var dateStr = DateUtil.fmtDate(new Date());
    var id = 'P' + dateStr.replace(/-/g, '') + (Date.now() - new Date(dateStr).getTime());
    return id;
};

Util.v1 = function(){
   return UUID.v1();
};

Util.genOutTradeNo = function(){
    var dateStr = DateUtil.fmtDate(new Date());
    var id = 'T' + dateStr.replace(/-/g, '') + (Date.now() - new Date(dateStr).getTime());
    return id;
}
Util.sessionID = function(){
    return Util.v1();
}
Util.genOutRefundNo = function(){
    var dateStr = DateUtil.fmtDate(new Date());
    var id = 'R' + dateStr.replace(/-/g, '') + (Date.now() - new Date(dateStr).getTime());
    return id;
}
module.exports = Util;
