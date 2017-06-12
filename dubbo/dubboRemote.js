var zd = require('./dubboZook');
var visaProductDatumTableService = zd.getInvoker('com.woqu.visa.v2.product.service.VisaProductDatumTableService',{timeout:10000});
module.exports.visaProductDatumTableService = visaProductDatumTableService;
