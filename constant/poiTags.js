const tags = [{value:'手工艺品',label:'手工艺品'},
    {value:'小商品',label:'小商品'},
    {value:'书籍和音像制品店',label:'书籍和音像制品店'},
    {value:'服饰/鞋帽',label:'服饰/鞋帽'},
    {value:'便利店',label:'便利店'},
    {value:'礼品店',label:'礼品店'},
    {value:'化妆品',label:'化妆品'},
    {value:'家居',label:'家居'},
    {value:'超市',label:'超市'},
    {value:'购物中心',label:'购物中心'},
    {value:'体育用品',label:'体育用品'},
    {value:'电子产品',label:'电子产品'},
    {value:'珠宝店',label:'珠宝店'},
    {value:'Outlets',label:'Outlets'},
    {value:'儿童用品店',label:'儿童用品店'},
    {value:'烟/酒类出售',label:'烟/酒类出售'},
    {value:'花店',label:'花店'},
    {value:'跳蚤市场',label:'跳蚤市场'},
    {value:'其他购物中心',label:'其他购物中心'},
    {value:'时尚购物',label:'时尚购物'},
    {value:'购物街/商圈',label:'购物街/商圈'},
    {value:'药店',label:'药店'},
    {value:'连锁店',label:'连锁店'},
    {value:'集市',label:'集市'},
    {value:'食品',label:'食品'},
    {value:'退税',label:'退税'}
];
const deepFreeze = require('../util/DeepFreeze');
deepFreeze(tags);
module.exports = tags;