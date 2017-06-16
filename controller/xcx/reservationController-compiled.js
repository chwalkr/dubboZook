'use strict';

var visaOrderDatumTableService = require('../../remote/restRemote').visaOrderDatumTableService;

module.exports = function (app) {
    /**
     * 创建订单{contact:{name,email,mobile}, guests:[{type,name}...]}
     */
    app.post('/visa/v2/reservation', function (req, res, next) {
        console.log('=========reservation : ', req.body);
        visaOrderDatumTableService.excute('queryProductByConditon', {
            pageNo: req.body.pageNo || 1,
            pageSize: req.body.pageSize || 10,
            name: req.body.name || '',
            visaCode: req.body.visaCode || '',
            country: req.body.country || null,
            state: req.body.state || null
        }, function (err, crs) {
            if (err) res.json({ rs: 0, msg: err }).end();
            res.send(crs).end() || '';
        });
    });

    app.get('/visa/v2/product/detail/:id', function (req, res, next) {
        console.log('=========product detail id : ', req.params.id);
        visaProductInfoService.excute('queryProductById', {
            id: req.params.id || 0
        }, function (err, crs) {
            if (err) res.json({ rs: 0, msg: err }).end();
            res.send(crs).end() || '';
        });
    });

    app.post('/visa/v2/product/add', function (req, res, next) {
        console.log('=========product add body : ', req.body);
        userService.queryUserInfo(req).then(function (userCrs) {
            var uname = userCrs.data.trueName || userCrs.data.loginName;
            req.body.creator = uname;
            visaProductInfoService.excute('addProduct', req.body, function (err, crs) {
                if (err) res.json({ rs: 0, msg: err }).end();
                res.send(crs).end() || '';
            });
        }).catch(function (crs) {
            res.json(crs);
        });
    });

    app.post('/visa/v2/product/update', function (req, res, next) {
        console.log('=========product update body : ', req.body);
        userService.queryUserInfo(req).then(function (userCrs) {
            var uname = userCrs.data.trueName || userCrs.data.loginName;
            req.body.modifier = uname;
            visaProductInfoService.excute('updateProductBase', req.body, function (err, crs) {
                if (err) res.json({ rs: 0, msg: err }).end();
                res.send(crs).end() || '';
            });
        }).catch(function (crs) {
            res.json(crs);
        });
    });

    app.get('/visa/v2/product/update-state/:id', function (req, res, next) {
        console.log('=========product update state body : ', req.body);
        userService.queryUserInfo(req).then(function (userCrs) {
            var uname = userCrs.data.trueName || userCrs.data.loginName;
            visaProductInfoService.excute('updateProductState', { id: req.params.id || 0, state: req.query.state, modifier: uname }, function (err, crs) {
                if (err) res.json({ rs: 0, msg: err }).end();
                res.send(crs).end() || '';
            });
        }).catch(function (crs) {
            res.json(crs);
        });
    });

    app.get('/visa/v2/product/del/:id', function (req, res, next) {
        console.log('=========product delete id : ', req.params.id);
        userService.queryUserInfo(req).then(function (userCrs) {
            var uname = userCrs.data.trueName || userCrs.data.loginName;
            visaProductInfoService.excute('delProduct', {
                id: req.params.id || 0,
                modifier: uname
            }, function (err, crs) {
                if (err) res.json({ rs: 0, msg: err }).end();
                res.send(crs).end() || '';
            });
        }).catch(function (crs) {
            res.json(crs);
        });
    });

    app.get('/visa/v2/product/update-state/:id', function (req, res, next) {
        console.log('=========product update state id : ', req.params.id);
        userService.queryUserInfo(req).then(function (userCrs) {
            var uname = userCrs.data.trueName || userCrs.data.loginName;
            visaProductInfoService.excute('updateProductState', {
                id: req.params.id || 0,
                state: req.query.state,
                modifier: uname
            }, function (err, crs) {
                if (err) res.json({ rs: 0, msg: err }).end();
                res.send(crs).end() || '';
            });
        }).catch(function (crs) {
            res.json(crs);
        });
    });

    app.get('/visa/v2/product/update-channel/:id', function (req, res, next) {
        console.log('=========product update sale channel id : ', req.params.id);
        userService.queryUserInfo(req).then(function (userCrs) {
            var uname = userCrs.data.trueName || userCrs.data.loginName;
            visaProductInfoService.excute('updateProductSaleChannel', {
                id: req.params.id || 0,
                saleChannels: req.query.saleChannels,
                modifier: uname
            }, function (err, crs) {
                if (err) res.json({ rs: 0, msg: err }).end();
                res.send(crs).end() || '';
            });
        }).catch(function (crs) {
            res.json(crs);
        });
    });

    app.get('/visa/v2/product/clone/:id', function (req, res, next) {
        console.log('=========product clone id : ', req.params.id);
        userService.queryUserInfo(req).then(function (userCrs) {
            var uname = userCrs.data.trueName || userCrs.data.loginName;
            visaProductInfoService.excute('copyProduct', { id: req.params.id, operator: uname }, function (err, crs) {
                if (err) res.json({ rs: 0, msg: err }).end();
                res.send(crs).end() || '';
            });
        }).catch(function (crs) {
            res.json(crs);
        });
    });
};

//# sourceMappingURL=reservationController-compiled.js.map