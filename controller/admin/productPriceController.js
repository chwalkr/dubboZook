var visaProductPriceService = require('../../remote/restRemote').visaProductPriceService;

module.exports = function (app) {
    app.get('/visa/v2/product/price/area/:visaCode', function (req, res, next) {
        console.log('=========product price of area : ', req.params);
        visaProductPriceService.excute('queryAreaPrices',{visaCode:req.params.visaCode}, function(err, crs){
            if(err) return res.json({rs:0,msg:err}).end();
            res.json(crs).end()||'';
        });
    });

    app.get('/visa/v2/product/price/pkg/:visaCode', function (req, res, next) {
        console.log('=========product price of pkg : ', req.params);
        visaProductPriceService.excute('queryPkgPrices',{visaCode:req.params.visaCode}, function(err, crs){
            if(err) return res.json({rs:0,msg:err}).end();
            res.json(crs).end()||'';
        });
    });

    app.post('/visa/v2/product/price/area/save', function (req, res, next) {
        console.log('=========product area price save : ', req.body);
        visaProductPriceService.excute('saveAreaPrices',req.body, function(err, crs){
            if(err) return res.json({rs:0,msg:err}).end();
            res.json(crs).end()||'';
        });
    });

    app.post('/visa/v2/product/price/pkg/save', function (req, res, next) {
        console.log('=========product pkg price save : ', req.body);
        visaProductPriceService.excute('savePkgPrices',req.body, function(err, crs){
            if(err) return res.json({rs:0,msg:err}).end();
            res.json(crs).end()||'';
        });
    });


    app.get('/visa/v2/product/price/consulate/batch-save/:country', function (req, res, next) {
        console.log('=========batch save consulate price of country : ', req.params, req.query);
        visaProductPriceService.excute('batchUpdateConsulatePrice',{country:req.params.country, consulatePrice:req.query.consulatePrice}, function(err, crs){
            if(err) res.json({rs:0,msg:err}).end();
            res.json(crs).end()||'';
        });
    });

    app.get('/visa/v2/product/price/service/batch-save/:country', function (req, res, next) {
        console.log('=========batch save service price of country : ', req.params, req.query);
        visaProductPriceService.excute('batchUpdateServicePrice',{country:req.params.country, servicePrice:req.query.servicePrice}, function(err, crs){
            if(err) res.json({rs:0,msg:err}).end();
            res.json(crs).end()||'';
        });
    });
};