
var Util = {};
Util.fmtDate = function(date,fmt){
    if(!(date instanceof Date)) return null;
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    month = month<10? '0' + month : '' + month;
    var day = date.getDate();
    day = day<10? '0' + day : '' + day;
    //fmt: yyyy-MM-dd HH:mm;ss
    fmt = fmt || 'yyyy-MM-dd HH:mm:ss';
    var hour = date.getHours(), minute = date.getMinutes(), second = date.getSeconds();
    return fmt.replace('yyyy',year).replace('MM',month).replace('dd',day).replace(/hh/i,hour<10?'0'+hour : hour).replace('mm',minute<10?'0'+minute : minute).replace('ss',second<10?'0'+second : second);
};
Util.getDayNum = function(from, to, isBetween){
    if(typeof from !== 'string' || typeof to !== 'string') throw 'invalid param';
    var i = new Date(to).getTime() - new Date(from).getTime();
    i = i>0? i : i*-1;
    var n = parseInt(i/864e5);
    return isBetween? n+1 : n;
}
//console.log(Util.fmtDate(new Date()));
module.exports = Util;

// console.log(RtnUtil.getRtnFail("error"));
// console.log(RtnUtil.getRtnOK());
// console.log(RtnUtil.getRtnOK({aaa:111, bbb:222}));