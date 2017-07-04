'use strict';
//var domain = require('domain');
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config/config'); //配置

var cookieParser = require('cookie-parser');
var IDGenerator = require('./util/IDGenerator');

var logger = require('./util/Log').getLogger('app');

var app = express();


/*app.use(function (req,res, next) {
    var d = domain.create();
    //监听domain的错误事件
    d.on('error', function (err) {
        logger.error(err);
        res.statusCode = 500;
        res.json({sucess:false, messag: '服务器异常'});
        d.dispose();
    });
    d.add(req);
    d.add(res);
    d.run(next);
});*/

//var log4js = require('log4js');
//app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
/*app.use(function (req, res, next) {
    if(!req.cookies || !req.cookies.SESSIONID){
        let sid = IDGenerator.sessionID();
        console.log('========gen SESSIONID:' + sid);
        res.cookie('SESSIONID', sid, { domain: '.hot.com', path: '/', secure: false,expires:0,signed:false });
    }else{
        console.log('========current SESSIONID:' + req.cookies.SESSIONID);
    }
    next();
});*/
app.use(express.static('public'));//这个static中间件放到session处理前
//跨域
app.all('*', function (req, res, next) {
    //res.header('Access-Control-Allow-Origin', '*');
    var url = req.headers.origin;
    //console.log('=====================origin:', url);
    if(url){
        res.header('Access-Control-Allow-Origin', url);
        res.header('Access-Control-Allow-Credentials', true);
        //res.header('Content-Type', 'application/json');
        res.header("Access-Control-Allow-Headers","Content-Type, Access-Control-Allow-Credentials,Access-Control-Allow-Origin, Authorization, X-Requested-With");
    }
    //res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    next();
});
app.use(function(err, req, res, next) {
    console.error('======inner service exception',err.stack);
    res.status(200).json({rs:0, msg:'内部服务发生异常'});
});
app.get('/visa/ver', function (req, res) {
    logger.info('query version:', req.query, req.body);
    res.status(200).send('ver:20170606');
});




var port = process.env.PORT || 2101;
var httpServer = require('http').createServer(app);

httpServer.listen(port, function () {
    console.log('server running on port ' + port + '.');
});

/*************************************** controller for admin start **************************************/
var productDatumTableController = require('./controller/admin/productDatumTableController');
productDatumTableController(app);
var productInfoController = require('./controller/admin/productInfoController');
productInfoController(app);
var productPriceController = require('./controller/admin/productPriceController');
productPriceController(app);

var orderController = require('./controller/admin/orderController');
orderController(app);
/*************************************** controller for admin end **************************************/

