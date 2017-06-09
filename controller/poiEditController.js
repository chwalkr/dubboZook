var poiEditService = require('../service/poiEditService');
var userService = require('../service/userService');

module.exports = function (app) {

    app.post('/poi/edit/add', function (req, res, next) {
        console.log('=========add : ', req.body);
        var reqJson = req.body;
        var params = reqJson.params;//e.g.[{key:'cnName',val:'aaa'}]
        var parents = reqJson.parents ? reqJson.parents.split(',') : [];
        params.push({key:"parents", val:parents});
        //获取创建者
        var creatorElem = params.filter(function(a){return a.key ==='creator'})[0];
        
        userService.queryUserInfo(req).then(function (userCrs) {
            var uname = userCrs.data.trueName||userCrs.data.loginName;
            if(creatorElem){
                creatorElem.val = uname;
            }else{
                creatorElem = {key:'creator', val:uname};
                params.push(creatorElem);
            }
            poiEditService.addPoi(params)
                .then(function(crs) {
                    res.json(crs);
                }).catch(function(e) {
                res.json(e);
            });
        }).catch(function (crs) {
            res.json(crs);
        });

    });

    app.post('/poi/edit/update', function (req, res, next) {
        console.log('=========update : ', req.body);
        var params = req.body.params;//e.g.[{key:'cnName',val:'aaa'}]

        userService.queryUserInfo(req).then(function (userCrs) {
            var uname = userCrs.data.trueName||userCrs.data.loginName;
            //获取修改者
            var updaterElem = params.filter(function(a){return a.key ==='updater'})[0];
            if(updaterElem){
                updaterElem.val = uname;
            }else{
                updaterElem = {key:'updater',val:uname};
                params.push(updaterElem);
            }
            var updateTimeEem = params.filter(function(a){return a.key ==='updateTime'})[0];
            if(updateTimeEem){
                updateTimeEem.val = 0;
            }
            var createTimeEem = params.filter(function(a){return a.key ==='createTime'})[0];
            if(createTimeEem && createTimeEem.val){
                createTimeEem.val = new Date(createTimeEem.val).getTime();
            }
            poiEditService.updatePoi(params)
                .then(function(crs) {
                    res.json(crs);
                }).catch(function(e) {
                res.json(e);
            });
        }).catch(function (crs) {
            res.json(crs);
        });
    });

    app.post('/poi/edit/update-images', function (req, res, next) {
        console.log('=========update pics : ', req.body);
        var reqJson = req.body;
        var imgs = reqJson.imgs||[];
        var pcode = reqJson.pcode;
        poiEditService.updateImages(pcode, imgs)
            .then(function(crs) {
                res.json(crs);
            }).catch(function(e) {
            res.json(e);
        });
    });

    app.get('/poi/edit/add-parent', function (req, res, next) {
        console.log('=========add poi parent : ', req.query);
        poiEditService.addParent(req.query.thisCode, req.query.parentCode)
            .then(function(crs) {
                res.json(crs);
            }).catch(function(e) {
            res.json(e);
        });
    });

    app.get('/poi/edit/del-parent', function (req, res, next) {
        console.log('=========del poi parent : ', req.query);
        poiEditService.delParent(req.query.poiCode, req.query.path)
            .then(function(crs) {
                res.json(crs);
            }).catch(function(e) {
            res.json(e);
        });
    });

    app.get('/poi/edit/del-poi', function (req, res, next) {
        console.log('=========del poi node : ', req.query);
        userService.queryUserInfo(req).then(function (userCrs) {
            var uname = userCrs.data.trueName||userCrs.data.loginName;
            poiEditService.delPoi(req.query.poiCode, uname)
                .then(function(crs) {
                    res.json(crs);
                }).catch(function(e) {
                res.json(e);
            });
        }).catch(function (crs) {
            res.json(crs);
        });

    });
};