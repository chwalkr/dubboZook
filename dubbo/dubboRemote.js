var zd = require('./dubboZook');
module.exports.visaProductDatumTableService = zd.getInvoker('com.woqu.visa.v2.product.service.VisaProductDatumTableService',{timeout:10000});
module.exports.visaProductInfoService = zd.getInvoker('com.woqu.visa.v2.product.service.VisaProductInfoService',{timeout:10000});
module.exports.visaProductPriceService = zd.getInvoker('com.woqu.visa.v2.product.service.VisaProductPriceService',{timeout:10000});
