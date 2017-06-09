var config = require('../config/config'); //配置
var log4js = require('log4js');
log4js.configure(config.logger);
console.log('===========================aaaaaaaaa');
module.exports.getLogger = function(cate, level){
    var logger = log4js.getLogger('app');
    logger.setLevel(level||'INFO');
    return logger;
};
