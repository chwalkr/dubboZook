var visaProductDatumTableService = require('../../remote/restRemote').visaProductDatumTableService;
var visaProductInfoService = require('../../remote/restRemote').visaProductInfoService;

var userService = require('../../service/userService');

module.exports = function (app) {
    app.get('/visa/v2/product/datum/tpl/search', function (req, res, next) {
        console.log('=========product datum tpl search : ', req.query);
        var name = req.query.name||'';
        visaProductDatumTableService.excute('searchVisaDatumTplByName',{name:name}, function(err, crs){
            if(err) return res.json({rs:0,msg:err}).end();
            console.log('========================product datum tpl result:', crs);
            res.json(crs).end();
        });
    });

    app.post('/visa/v2/product/datum/tpl/save', function (req, res, next) {
        console.log('=========save product datum tpl', req.body);
        userService.queryUserInfo(req).then(function (userCrs) {
            var uname = userCrs.data.trueName||userCrs.data.loginName;
            req.body.modifier = uname;
            req.body.creator = uname;
            visaProductDatumTableService.excute('saveVisaDatumTpl',req.body, function(err, crs){
                if(err) return res.json({rs:0,msg:err}).end();
                res.json(crs).end()||'';
            });
        }).catch(function (crs) {
            res.json(crs);
        });
    });

    app.get('/visa/v2/product/datum/tpl/del/:id', function (req, res, next) {
        console.log('=========del product datum tpl id : ', req.params.id);
        userService.queryUserInfo(req).then(function (userCrs) {
            var uname = userCrs.data.trueName||userCrs.data.loginName;
            visaProductDatumTableService.excute('delVisaDatumTpl',{id:req.params.id, operator:uname}, function(err, crs){
                if(err) return res.json({rs:0,msg:err}).end();
                res.json(crs).end();
            });
        }).catch(function (crs) {
            res.json(crs);
        });
    });


    app.get('/visa/v2/product/datum-table/:visaCode', function (req, res, next) {
        console.log('=========query datums of product visaCode: ', req.params.visaCode);
        visaProductDatumTableService.excute('queryVisaDatums',{visaCode:req.params.visaCode}, function(err, crs){
            if(err) return res.json({rs:0,msg:err}).end();
            var datums = crs.data;
            visaProductDatumTableService.excute('queryVisaTableTpl',{visaCode:req.params.visaCode,withQuestions:false}, function(err, crs){
                if(err) return res.json({rs:0,msg:err}).end();
                var table = crs.data;
                visaProductInfoService.excute('queryProductByCode',{visaCode:req.params.visaCode}, function(err, crs){
                    if(err) return res.json({rs:0,msg:err}).end();
                    var info = crs.data;
                    res.json({rs:1,data:{table:table,datums:datums,feedback:info.feedback||''}}).end();
                });
            });
        });
    });

    app.post('/visa/v2/product/datums/save', function (req, res, next) {
        console.log('=========save datums of product', req.body);
        var feedback = req.body.feedback||'';
        var datums = req.body.datums||[];
        visaProductDatumTableService.excute('saveVisaDatums',datums, function(err, crs){
            if(err) return res.json({rs:0,msg:err}).end();

            var ids = crs.data;
            visaProductInfoService.excute('updateProductFeedbackByCode',{visaCode:req.params.visaCode,feedback:feedback,operator:'admin01'}, function(err, crs2){
                if(err) return res.json({rs:0,msg:err}).end();
                res.json({rs:1,data:ids}).end();
            });
        });
    });

   /* app.get('/visa/v2/table/attach/:visaCode/:tableTplId', function (req, res, next) {
        console.log('=========attach visa table of product ', req.params);
        visaProductDatumTableService.excute('attachVisaTable',{visaCode:req.params.visaCode,tableTplId:req.params.tableTplId}, function(err, crs){
            if(err) return res.json({rs:0,msg:err}).end();
            res.json(crs).end();
        });
    });

    app.get('/visa/v2/table/detach/:visaCode', function (req, res, next) {
        console.log('=========detach visa table of product ', req.params);
        visaProductDatumTableService.excute('detachVisaTable',{visaCode:req.params.visaCode}, function(err, crs){
            if(err) return res.json({rs:0,msg:err}).end();
            res.json(crs).end();
        });
    });*/
};