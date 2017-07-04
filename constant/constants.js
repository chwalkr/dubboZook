const deepFreeze = require('../util/DeepFreeze');
const orderStatus = {
    PENDING:'新建',
    PROCESSING:'处理中',
    CONFIRMED:'已确认',
    CANCELLED:'已撤销',
    CHANGED:'已更换',
    FINISHED:'已成交'

};
deepFreeze(orderStatus);
const paymentStatus = {
    WAITING_TO_PAY:'等待支付',
    SUCCESS:'支付成功',
    NEED_CHECK:'交易待查',
    PROCESSING:'交易处理中',
    FAILED:'支付失败',
    PARTIALPAY:'部分支付'

};
deepFreeze(paymentStatus);
module.exports.orderStatus = orderStatus;
module.exports.paymentStatus = paymentStatus;