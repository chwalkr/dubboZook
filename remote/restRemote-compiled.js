'use strict';

var zd = require('./restZook');
module.exports.visaProductDatumTableService = zd.getInvoker('com.woqu.visa.v2.product.service.VisaProductDatumTableService', { timeout: 10000 });
module.exports.visaProductInfoService = zd.getInvoker('com.woqu.visa.v2.product.service.VisaProductInfoService', { timeout: 10000 });
module.exports.visaProductPriceService = zd.getInvoker('com.woqu.visa.v2.product.service.VisaProductPriceService', { timeout: 10000 });
module.exports.visaOrderDatumTableService = zd.getInvoker('com.woqu.visa.v2.order.service.VisaOrderDatumTableService', { timeout: 10000 });
module.exports.visaOrderFlowService = zd.getInvoker('com.woqu.visa.v2.order.service.VisaOrderFlowService', { timeout: 10000 });

//# sourceMappingURL=restRemote-compiled.js.map