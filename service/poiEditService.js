'use strict';
var Promise = require('bluebird');
var poiEditRemote = require('../dubbo/dubboRemoteService').poiEditRemote;
var TheService = function () {
};
var logger = require('../util/Log').getLogger('app');
const poiTemplateAttrs = require('../constant/poiTemplateAttrs');
var deepCopy = require('../util/DeepCopy');
//模板生成器
const TemplateHelper = {
    getTpl:function(poiType){
        if(['CONTINENT','COUNTRY','AREA','STATE'].indexOf(poiType) > -1){
            return  deepCopy(poiTemplateAttrs.CONTINENT_COUNTRY_AREA_STATE);
        }else{
            return [];
        }
    }
};
/**
 * 转换参数
 * @param params
 * @returns {*}
 */
function getDataFromParams(params) {
    try{
        var node = {};
        //列举模板的key对应的ptype, key = param.key, value = param.ptype
        let ptypeMap = {};
        let poiType = params.filter(function (a){return a.key==='dataType'})[0].val;
        let tpl = TemplateHelper.getTpl(poiType);
        tpl.forEach(function(block){
            block.params.forEach(function(p){
                ptypeMap[p.key] = p.ptype;
            });
        });
        params.forEach(function(p){//参数值的类型转换
            let key = p.key, val = p.val;
            if(val==null || val=='' || (Object.prototype.toString.call(val)==='[object Array]' && !val.length)) return;
            let ptype = ptypeMap[key];

            if(ptype==='string'){
                val = p.val||'';
            }else if(ptype==='double'||ptype==='float'||ptype==='long'){
                val = parseFloat(p.val||'0');
            }else if(ptype==='integer'){
                val = parseInt(p.val||'0');
            }else if(ptype==='boolean'){
                val = !!val;
            }else if(ptype==='array'){
                val = val || []
            }
            node[key] = val;
        });
        return node;
    }catch(e){
        logger.error('==============getDataFromParams error!', e.message);
        return null;
    }
}
/**
 * 新增poi
 * @param params
 * @return {rs:1, data:poiCode}
 */
TheService.prototype.addPoi = function (params) {
    return new Promise(function (resolve, reject) {
        let node = getDataFromParams(params);
        logger.info('=========converted node :', JSON.stringify(node));
        if(node == null)  return reject({rs:0,msg:'参数格式错误'});
        //if(!node.cnName || !node.enName) return reject({rs:0,msg:'中文名、英文名不能为空'});
        let parents = deepCopy(node.parents);
        node.parents = [];
        poiEditRemote.excute('addPoi',
            [
                {$class:'java.lang.String','$':JSON.stringify(node)},
                {$class:'java.util.Set',$:parents}
            ],function (err, poiCode) {
                if (err) {
                    logger.error('invoke addPoi error:', err);
                    return reject({rs:0,msg:'内部服务异常'});
                }
                //处理数据
                if(!poiCode){
                    return reject({rs:0,msg:'新增POI失败'});
                }
                resolve({rs:1, data:poiCode});
            });
    });
};
/**
 * 更新poi
 * @param params
 * @return {rs:0|1}
 */
TheService.prototype.updatePoi = function (params) {
    return new Promise(function (resolve, reject) {
        let node = getDataFromParams(params);
        if(node == null)  return reject({rs:0,msg:'参数格式错误'});
        //if(!node.cnName || !node.enName) return reject({rs:0,msg:'中文名、英文名不能为空'});
        logger.info('=====final update:', JSON.stringify(node));
        poiEditRemote.excute('updatePoi',
            [
                {$class:'java.lang.String','$':JSON.stringify(node)}
            ],function (err, isSuc) {
                if (err) {
                    logger.error('invoke updatePoi error:', err);
                    return reject({rs:0,msg:'内部服务异常'});
                }
                //处理数据
                if(!isSuc){
                    return reject({rs:0,msg:'更新POI失败'});
                }
                resolve({rs:1});
            });
    });
};
/**
 * 更新poi的图片
 * @param poiCode
 * @param pics
 * @return {rs:0|1}
 */
TheService.prototype.updateImages = function (poiCode, pics) {
    return new Promise(function (resolve, reject) {
        if(!poiCode)  return reject({rs:0,msg:'参数格式错误'});
        var picArr = [];
        (pics||[]).forEach(function(elem){
            picArr.push({$class:'com.woqu.poi.domain.Picture',$:elem});
        });
        poiEditRemote.excute('updatePics',
            [
                {$class:'java.lang.String','$':poiCode},
                {$class:'java.util.List','$': picArr}
            ],function (err, isSuc) {
                if (err) {
                    logger.error('invoke updatePics error:', err);
                    return reject({rs:0,msg:'内部服务异常'});
                }
                //处理数据
                if(!isSuc){
                    return reject({rs:0,msg:'更新POI图片失败'});
                }
                resolve({rs:1});
            });
    });
};


/**
 * 把一个poi挂到另一个poi下面
 * @param poiCode
 * @param pics
 * @return {rs:1,data:['path1','path2']}
 */
TheService.prototype.addParent = function (thisCode, parentCode) {
    return new Promise(function (resolve, reject) {
        if(!thisCode || !parentCode)  return reject({rs:0,msg:'参数格式错误'});
        poiEditRemote.excute('addParent',
            [
                {$class:'java.lang.String','$': thisCode},
                {$class:'java.lang.String','$': parentCode}
            ],function (err, crs) {
                if (err) {
                    logger.error('invoke addParent error:', err);
                    return reject({rs:0,msg:'内部服务异常'});
                }
                //处理数据
                if(crs.rs!=1){
                    return reject(crs);
                }
                resolve(crs);
            });
    });
};

/**
 * 删除poi的父节点
 * @param poiCode
 * @param pics
 * @return{rs:0|1}
 */
TheService.prototype.delParent = function (poiCode, path) {
    return new Promise(function (resolve, reject) {
        if(!poiCode)  return reject({rs:0,msg:'参数格式错误'});
        poiEditRemote.excute('delParent',
            [
                {$class:'java.lang.String','$': poiCode},
                {$class:'java.lang.String','$': path}
            ],function (err, isSuc) {
                if (err) {
                    logger.error('invoke delParent error:', err);
                    return reject({rs:0,msg:'内部服务异常'});
                }
                //处理数据
                if(!isSuc){
                    return reject({rs:0,msg:'内部服务异常'});
                }
                resolve({rs:1});
            });
    });
};


/**
 * 删除poi的节点
 * @param poiCode
 * @param pics
 * @return {rs:0|1}
 */
TheService.prototype.delPoi = function (poiCode, modifier) {
    return new Promise(function (resolve, reject) {
        if(!poiCode || !modifier)  return reject({rs:0,msg:'参数格式错误'});
        poiEditRemote.excute('delPoi',
            [
                {$class:'java.lang.String','$': poiCode},
                {$class:'java.lang.String','$': modifier}
            ],function (err, isSuc) {
                if (err) {
                    logger.error('invoke delPoi error:', err);
                    return reject({rs:0,msg:'内部服务异常'});
                }
                //处理数据
                if(!isSuc){
                    return reject({rs:0,msg:'删除失败'});
                }
                resolve({rs:1});
            });
    });
};

module.exports = new TheService();