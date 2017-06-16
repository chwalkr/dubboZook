/**
 * for dubbo rest
 */
'use strict';

var net = require('net');
var debug = require('debug');
var error = debug('zoodubbo:error');
var request = require('request');
/////////////////////////////
// require core modules
var url = require('url');
var querystring = require('querystring');
var zookeeper = require('node-zookeeper-client');


/**
 * Constructor of ZD.
 * @param {Object} conf
 * {
 *  version: String // dubbo version information
 *  connection: String, // zookeeper address
 *  sessionTimeout: Number, // Session timeout in milliseconds, defaults to 30 seconds.
 *  spinDelay: Number, // The delay (in milliseconds) between each connection attempts.
 *  retries: Number // The number of retry attempts for connection loss exception.
 * }
 * @returns {ZD}
 * @constructor
 */
function ZD(conf) {
    if (!(this instanceof ZD)) return new ZD(conf);
    conf = conf || {};
    this._version = conf.version;
    this._connection = conf.connection;
    this._client = this.client = zookeeper.createClient(this._connection, {
        sessionTimeout: conf.sessionTimeout,
        spinDelay: conf.spinDelay,
        retries: conf.retries
    });
    this._cache = this.cache = {};
}

ZD.prototype.connect = function () {
    if (!this._client || !this._client.connect) {
        return;
    }
    this._client.connect();
};
ZD.prototype.close = function () {
    if (!this._client || !this._client.close) {
        return;
    }
    this._client.close();
};

/**
 * Get a invoker.
 * @param {String} path e.g. com.woqu.user.UserService
 * @param {Object} [opt] e.g. {version: String,timeout: Number}
 * @returns {Invoker}
 * @public
 */
ZD.prototype.getInvoker = function (path, opt) {
    opt = opt || {};
    return new Invoker(this, {
        path: path,
        timeout: opt.timeout,
        version: (opt.version || '0.0.0').toUpperCase()
    });
};

/**
 * Get a provider from the registry.
 *
 * @param {String} path
 * @param {String} version
 * @param {Function} cb
 * @returns {*}
 * @public
 */
ZD.prototype.getProvider = function (path, version, cb) {
    var self = this;
    var _path = '/dubbo/' + path + '/providers';
    return self._client.getChildren(_path, function (err, children) {
        /**
         *  children example:
         * [dubbo://192.168.5.126:27123/com.woqu.visa.v2.product.service.VisaProductInfoService?anyhost=true&application=visa_service
         * &default.service.filter=default&dubbo=2.8.4&generic=false&interface=com.woqu.visa.v2.product.service.VisaProductInfoService
         * &methods=queryProductByCode,addProduct,updateProductState,queryProductById,queryProductByConditon,delProduct,updateProductSaleChannel,
         * updateProductBase,copyProduct&pid=14004&side=provider&threadpool=cached&threads=20&timestamp=1496903941757,
         * rest://192.168.5.126:30003/visa/v2/com.woqu.visa.v2.product.service.VisaProductInfoService?anyhost=true&application=visa_service
         * &default.service.filter=default&dubbo=2.8.4&generic=false&interface=com.woqu.visa.v2.product.service.VisaProductInfoService
         * &methods=queryProductByCode,addProduct,updateProductState,queryProductById,queryProductByConditon,delProduct,updateProductSaleChannel,
         * updateProductBase,copyProduct&pid=14004&server=tomcat&side=provider&timestamp=1496903940799]
         */
        var query, parsed, provider, i, l;
        if (err) {
            return cb(err);
        }
        if (children && !children.length) {
            return cb('Can\'t find children from the node: ' + _path + ' ,please check the path!');
        }
        //console.log('===================get dubbo providers:', children);
        try {
            for (i = 0, l = children.length; i < l; i++) {
                parsed = url.parse(decodeURIComponent(children[i]));
                if (parsed.protocol === 'rest:') {
                    query = querystring.parse(parsed.query);
                    break;
                }
            }
            //console.log('=========parsed json:',parsed);
            provider = {
                host: parsed.host,
                methods:{} //e.g.{"methodA":"GET:/product/query/{id}","methodB":"POST:/product/edit"}
            };
            var pathname_arr = parsed.pathname.split("/");///visa/v2/com.woqu.visa.v2.product.service.VisaProductInfoService
            var pathStr = "", interfaceStr = "", len = pathname_arr.length;
            pathname_arr.forEach(function(a,idx){
                if(a && idx != len-1){
                    pathStr += '/' + a;
                }else if(a && idx == len-1){
                    interfaceStr = a;
                }
            });
            provider.host = 'http://' + provider.host + pathStr;
            var req_url = provider.host + '/path/get-path/' + interfaceStr;
            //从这个约束好的路径请求获取所有接口的path和参数信息
            console.log('=========request service path :',req_url);
            request.get({url:req_url,contentType:'application/json'}, function(err, rsp, crs){
                if(err){
                    console.log('===find path of service error',err);
                }
                console.log('===find path of service success' , crs);
                if(rsp.headers['content-type'].indexOf('application/json') > -1) crs = JSON.parse(crs);
                if(crs.rs != 1){
                    return cb("inner service exception, cannot get paths");
                }else{
                    provider.methods = crs.data;
                    self._cache[path] = provider;
                    return cb(false, provider);
                }
            })
        } catch (err) {
            return cb(err);
        }
    });
};

/**
 * Expose `Invoker`.
 *
 * @type {Invoker}
 */
/**
 * Constructor of Invoker.
 *
 * @param {ZD} zd
 * @param {Object} opt
 * {
 *  path: String // The path of service node.
 *  version: String, // The version of service.
 *  timeout: Number, // Timeout in milliseconds, defaults to 60 seconds.
 * }
 * @returns {Invoker}
 * @constructor
 */
function Invoker(zd, opt) {
    if (!(this instanceof Invoker)) return new Invoker(zd, opt);
    this._zd = zd;
    opt = opt || {};
    this._path = opt.path;
    this._version = opt.version;
    this._timeout = (opt.timeout || '60000') + '';

    this._attchments = {
        $class: 'java.util.HashMap',
        $: {
            'path': this._path,
            'interface': this._path,
            'timeout': this._timeout,
            'version': this._version
        }
    };
}
/**
 * Excute the method
 *
 * @param {String} method
 * @param {Array} args
 * @param {Function} [cb]
 * @public
 */
Invoker.prototype.excute = function (method, args, cb) {
    var self = this;
    if (typeof cb !== 'function') {
        return new Promise(function (resolve, reject) {
            try {
                self._excute(method, args, function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(data);
                });
            } catch (err) {
                return reject(err);
            }
        });
    } else {
        try {
            return self._excute(method, args, cb);
        } catch (err) {
            return cb(err);
        }
    }
};

/**
 * Excute the method.
 * @param {String} method
 * @param {Map} args {name:'tom',id:123}
 * @param {Function} cb
 * @private
 */
Invoker.prototype._excute = function (method, args, cb) {
    var self = this;
    var fromCache = true;
    var tryConnectZoo = true;
    var _provider = self._zd.cache[self._path];
    if (_provider) {
        return httpFetch(false, _provider);
    } else {
        fromCache = false;
        return self._zd.getProvider(self._path, self._version, httpFetch);
    } 
    function httpFetch(err, provider) {
        if (err) {
            return cb(err);
        }
        if (!~provider.methods[method]) {
            if(fromCache){
                return handleReconnect();
            }else{
                return cb('Can\'t find the method:' + method + ', please check it!');
            }
        }
        //http request data
        var method_url = provider.methods[method].split(':');
        if(method_url[0].toUpperCase().indexOf("POST-JSON") != -1){
            var real_url = provider.host + method_url[1] + '?a=1';
            for(var k in args){
                if(real_url.indexOf('{' + k + '}') > -1) real_url = real_url.replace('{' + k + '}',args[k]);
            }
            console.log('=============post json to dubbo rest service, url: ' + real_url + ',json:', args);
            request.post({url:real_url,json:args}, function(err, rsp, body){
                if(err){
                    console.log('=====invoke rest service post error:', err);
                    cb(err);
                }else{
                    cb(false, (typeof body)=='string'?JSON.parse(body):body);
                }
            });
        }else if(method_url[0].toUpperCase().indexOf("POST-FORM") != -1){
            var real_url = provider.host + method_url[1] + '?a=1';
            for(var k in args){
                if(real_url.indexOf('{' + k + '}') > -1) real_url = real_url.replace('{' + k + '}',args[k]);
            }
            console.log('=============post form to dubbo rest service, url: ' + real_url + ',form:', args);
            request.post({url:real_url,form:args}, function(err, rsp, body){
                if(err){
                    console.log('=====invoke rest service post error:', err);
                    cb(err);
                }else{
                    cb(false, (typeof body)=='string'?JSON.parse(body):body);
                }
            });
        }else{
            var real_url = provider.host + method_url[1] + '?a=1';
            for(var k in args){
                if(real_url.indexOf('{' + k + '}') > -1) real_url = real_url.replace('{' + k + '}',args[k]);
                else real_url += '&' + k + '=' + encodeURIComponent(args[k]);
            }
            console.log('=============get from dubbo rest service, url: ' + real_url);
            request.get(real_url, function (error, response, body) {
                if(error){
                    console.log('=====invoke rest service get error:', error);
                    cb(error);
                }else{
                    cb(false, (typeof body)=='string'?JSON.parse(body):body);
                }
            });
        }
    }
    function handleReconnect() {
        tryConnectZoo = true;
        fromCache = false;
        return self._zd.getProvider(self._path, self._version, httpFetch);
    }
};

var zd = new ZD({
    connection: 'inner.dubbo1.woqu.com:2188,inner.dubbo2.woqu.com:2188,inner.dubbo3.woqu.com:2188',
    version: '2.8.4'
});
zd.client.on('connected', function(rsp) {
    console.log('zookeeper client (for rest protocol) connected!');
});
// connect to zookeeper
zd.connect();

module.exports = zd;