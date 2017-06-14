var visaProductDatumTableService = require('../dubbo/dubboRemote').visaProductDatumTableService;
var userService = require('../service/userService');

module.exports = function (app) {
    app.get('/visa/v2/product/datum/tpl/search', function (req, res, next) {
        console.log('=========product datum tpl search : ', req.query);
        var name = req.query.name||'';
        visaProductDatumTableService.excute('searchVisaDatumTplByName',{name:name}, function(err, crs){
            if(err) res.json({rs:0,msg:err}).end();
            console.log('========================product datum tpl result:', crs);
            res.send(crs).end();
        });
    });
};