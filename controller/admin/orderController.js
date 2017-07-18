var visaOrderDatumTableService = require('../../remote/restRemote').visaOrderDatumTableService;
var visaOrderFlowService = require('../../remote/restRemote').visaOrderFlowService;
var visaFlowTplService = require('../../remote/restRemote').visaFlowTplService;
var userService = require('../../service/userService');
var visaQueryFacadeRemote = require('../../remote/dubboRemote').visaQueryFacadeRemote;
var visaOperationFacedeRemote = require('../../remote/dubboRemote').visaOperationFacadeRemote;
var DateUtil = require('../../util/DateUtil');
var DeepCopy = require('../../util/DeepCopy');
var constants = require('../../constant/constants');

module.exports = function (app) {
    /**
     * 列表查询
     * 1、按国家查询流程模版
     * 2、依据模版和查询条件信息进行统计查询
     * 3、查询签证订单信息
     * req.body = {pageNo:1,pageSize:10,country:'usa',orderCD:'xxx',guestName:'xxx',contactWay:'13355555555',flowNode:'xxx'}
     */
    app.post('/visa/v2/order/search', function (req, res, next) {
        console.log('order search :', req.body);
        var country = req.body.country;
        if(!req.body.country){
            req.body.country = null;
        }else if(typeof req.body.country === 'string'){
            var ct = req.body.country;
            delete req.body.country;
            req.body.country = {name:ct};
        }
        if(isNaN(req.body.orderCD)){
            var orderItemCD = req.body.orderCD;
            delete req.body.orderCD;
            req.body.orderItemCD = orderItemCD;
        }
        req.body.bookingSource = {name:'SROUTINE'};
        var flow_req = DeepCopy(req.body);

        visaFlowTplService.excute('queryVisaFlowTplByCountry', (country?{country:country}:{}), function (err, crs) {
            if(err) return res.json({rs:0, msg:err}).end();
            console.log('queryVisaFlowTplByCountry result', JSON.stringify(crs));
            if(crs.rs!=1){
                return res.json({rs:0, msg:'内部服务异常'}).end();
            }
            var nodes = crs.data.nodes;
            var rtn = {rs:1,data:{pageSize:(req.body.pageSize||10),nodes:nodes}};
            var queryCount = function(idx){
                if(idx>=nodes.length){
                    console.log('===========queryVisaOrderForPage:' + JSON.stringify(flow_req));
                    visaQueryFacadeRemote.excute('queryVisaOrderForPage',
                        [{$class:'com.woqu.order.booking.bo.visa.VisaOrderQueryRequest', $: flow_req}],
                        function (err, orderPag) {
                            console.log('===========queryVisaOrderForPage result :' + JSON.stringify(orderPag));
                            if (err) return res.json({rs: 0, msg: err.message}).end();
                            if(!orderPag.result){
                                return res.json({rs: 0, msg: orderPag.returnMessage}).end();
                            }
                            rtn.data.totalPage = orderPag.totalPage;
                            rtn.data.total = orderPag.total;
                            rtn.data.currentPage = orderPag.currentPage;
                            rtn.data.list = [];
                            var lists = orderPag.resultList;
                            lists.forEach(function (visaOrder) {
                                var one = {
                                    orderItemCD: visaOrder.orderItemCD,
                                    orderCD: visaOrder.orderCD,
                                    title: visaOrder.productTitle,
                                    pkgDesc: '',
                                    guests: '',
                                    contact:'',
                                    currency: visaOrder.receivableCurrency.name,
                                    amount: visaOrder.receivableAmount,
                                    orderStatus:constants.orderStatus[(visaOrder.orderStatus||{}).name],
                                    paymentStatus:constants.paymentStatus[(visaOrder.paymentStatus||{}).name]
                                };
                                if(visaOrder.contact){
                                    one.contact = visaOrder.contact.firstName + (visaOrder.contact.surname ? ' ' + visaOrder.contact.surname : '');
                                    if(visaOrder.contact.cellphone) one.contact += '(' + visaOrder.contact.cellphone + ')';
                                }
                                visaOrder.viasPackageItems.forEach(function(p,idx){
                                    one.pkgDesc += p.packageItemCN + (idx==visaOrder.viasPackageItems.length-1 ? '' : '-');
                                });
                                visaOrder.visaGuestInfo.forEach(function(g,idx){
                                    one.guests += g.firstName + (idx==visaOrder.visaGuestInfo.length-1 ? '' : ',');
                                });
                                nodes.forEach(function (no) {
                                    if( no.code == visaOrder.currentFlowNode ){
                                        one.currentNodeCode = no.code;
                                        one.currentNodeName = no.name;
                                        one.command = (typeof no.command == 'string' ? JSON.parse(no.command):no.command)
                                    }
                                });
                                if(!one.currentNodeCode){
                                    one.currentNodeCode = '';
                                    one.currentNodeName = '已结束';
                                    one.command = [];
                                }
                                rtn.data.list.push(one);
                            });
                            res.json(rtn).end();
                        }
                    );

                }else{
                    req.body.flowNode = nodes[idx].code;
                    console.log('====================countVisaOrder:' + JSON.stringify(req.body));
                    visaQueryFacadeRemote.excute('countVisaOrder',
                        [{$class: 'com.woqu.order.booking.bo.visa.VisaOrderQueryRequest', $: req.body}],
                        function (err, crs) {
                            if(err){
                                return res.json({rs:0,msg:err.message}).end();
                            }
                            nodes[idx].count = crs;
                            queryCount(++idx);
                        });
                }
            };
            queryCount(0);
        });;
    });
    /**
     * 处理订单流程
     */
    app.get('/visa/v2/order/flow/process', function (req, res, next) {
        //按钮事件GET /visa/v2/order/flow/process?key=xxx&orderItemCD=xxx&note=xxx
        console.log('process order flow',req.query);
        userService.queryUserInfo(req).then(function (use) {
            var userName = use.data.trueName || use.data.trueName;
            visaOrderFlowService.excute('processOrderFlowCurrent',
                {orderItemCD: req.query.orderItemCD, currentNode:req.query.currentNode, command: req.query.key, operator: userName, note: req.query.note},
                function (err, crs) {
                    if(err) return res.json({rs: 0, msg: err}).end();
                    console.log('processOrderFlow result', JSON.stringify(crs));
                    if(!crs.rs) return res.json({rs: 0, msg: '流程处理失败'});
                    //更新订单冗余的currentFlowNode字段
                    var next = crs.data;
                    visaOperationFacedeRemote.excute('updateVisaCurrentFlowNode',[{$class: 'java.lang.String', $:req.query.orderItemCD},{$class: 'java.lang.String', $:next}],
                    function (err, crs) {
                        console.error('updateVisaCurrentFlowNode error:', err);
                        if (err) return res.json({rs: 0, msg: err.message}).end();
                        console.log('updateVisaCurrentFlowNode result', JSON.stringify(crs));
                        if (!crs.result) return res.json({rs: 0, msg: crs.returnMessage});
                        res.json({rs:1}).end();
                    });
            })
        });
    });


    /**
     * 查询国家对应处理流程
     */
    app.get('/visa/v2/order/flowtpl/:country', function (req, res, next) {
        console.log('query flow template',req.params.country);
        visaFlowTplService.excute('queryVisaFlowTplByCountry',{country:req.params.country},function (err, flowTpl) {
            if(err) res.json({rs:0, msg:err}).end();
            console.log('queryVisaFlowTplByCountry result', JSON.stringify(flowTpl));
            res.json(flowTpl).end();
        });
    });

    /**
     * 订单详情
     */
    app.get('/visa/v2/order/detail/:orderItemCD', function (req, res, next) {
        console.log('=========query order info: ', req.params.orderItemCD);
        visaQueryFacadeRemote.excute('queryOrder',[{$class:'java.lang.String',$:req.params.orderItemCD}],function(err, order){
            if(err) res.json({rs:0, msg:err}).end();
            console.log("==========query order result" ,JSON.stringify(order));

            var info = {
                title:order.productTitle,
                visaCode:order.productBusinessId,
                orderCD:order.orderCD,
                orderItemCD:order.orderItemCD,
                contact:{name:order.contact.firstName,mobile:order.contact.cellphone,email:order.contact.email},
                amount:order.receivableAmount,
                currency:order.receivableCurrency.name,
                orderStatus:constants.orderStatus[order.orderStatus.name],
                paymentStatus:constants.paymentStatus[order.paymentStatus.name],
                pkg:{},
                areaCode:'',
                areaName:'',
                guests:[],
                createTime:DateUtil.fmtDate(order.createTime,'yyyy-MM-dd HH:mm:ss')
            };
            order.visaGuestInfo.forEach(function(g){
                info.guests.push({guestId:g.guestInfoId,name:g.firstName,type:g.personType.name});
            });
            order.viasPackageItems.forEach(function(g){
                if(!isNaN(g.packageItemCode)){
                    info.pkg.code = g.packageItemCode;
                    info.pkg.name = g.packageItemCN;
                }else{
                    info.areaCode = g.packageItemCode;
                    info.areaName = g.packageItemCN;
                }
            });
            visaOrderFlowService.excute('queryOrderFlow',{orderItemCD:order.orderItemCD},function(err, crs){
                if(err) return res.json({rs:0, msg:err}).end();
                if(!crs.rs) res.json(crs).end();
                info.flow = crs.data;
                delete info.flow.orderItemCD;
                var crs = {rs: 1, data: info}
                res.json(crs).end();
            });
        });
    });
    /**
     *查询一个旅客的证件材料和表格信息
     */
    app.get('/visa/v2/order/guest/datum-table/:orderItemCD/:guestId', function (req, res, next) {
        console.log('=========query datums and table of guest : ', req.params.orderItemCD, req.params.guestId);
        visaOrderDatumTableService.excute('queryGuestDatumAndTable',{orderItemCD:req.params.orderItemCD,guestId:req.params.guestId}, function(err, crs){
            if(err) return res.json({rs:0,msg:err}).end();
            console.log('========================query datums and table of guest result:', crs);
            res.json(crs).end();
        });
    });
    /**
     * 保存客人资料和识别信息
     */
    app.post('/visa/v2/order/guest/datum/update/:orderItemCD/:guestId', function (req, res, next) {
        console.log('=========update guest datum : ', req.params.orderItemCD, req.params.guestId, req.body);
        req.body.orderItemCD = req.params.orderItemCD;
        req.body.guestId = req.params.guestId;
        var recoInfos = req.body.recoInfos||[];
        delete req.body.recoInfos;
        var answers = {};
        recoInfos.forEach(function(a){
            answers[a.questionCode] = a.answer;
        });
        visaOrderDatumTableService.excute('updateGuestDatum',req.body, function(err, crs){
            if(err) return res.json({rs:0,msg:err}).end();
            console.log('========================update guest datum result:', crs);
            var data = answers;
            data.orderItemCD = req.params.orderItemCD;
            data.guestId = req.params.guestId;
            console.log('=========update guest datum reco info : ', data);
            visaOrderDatumTableService.excute('updateGuestTableWithAnswer',data, function(err, crs){
                if(err) return res.json({rs:0,msg:err}).end();
                console.log('========================update guest datum reco info result:', crs);
                res.json(crs).end();
            });
        });
    });

    /**
     * 更新客人表格信息
     */
    app.post('/visa/v2/order/guest/table/update/:orderItemCD/:guestId', function (req, res, next) {
        console.log('=========update guest table : ', req.params.orderItemCD, req.params.guestId, req.body);
        var table = req.body||{};
        table.orderItemCD = req.params.orderItemCD;
        table.guestId = req.params.guestId;
        visaOrderDatumTableService.excute('updateGuestTable',table, function(err, crs){
            if(err) return res.json({rs:0,msg:err}).end();
            console.log('========================update guest table result:', crs);
            res.json(crs).end();
        });
    });
};