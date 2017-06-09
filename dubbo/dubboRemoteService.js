var Zook = require('./dubboZook');
var zd = new ZD({
    connection: 'inner.dubbo1.woqu.com:2188,inner.dubbo2.woqu.com:2188,inner.dubbo3.woqu.com:2188',
    version: '2.8.4'
});
zd.client.on('connected', function(rsp) {
    console.log('zookeeper client connected!', rsp);
});
// connect to zookeeper
zd.connect();

//add service here
module.exports.visaProductInfoServiceRemote = zd.getInvoker('com.woqu.visa.v2.product.service.VisaProductInfoService',{timeout:10000});