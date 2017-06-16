var Zook = require('zoodubbo');
var querystring = require('querystring');
var url = require('url');
//重写zoodubbo里面的getProvider，只采用hessian2序列化协议的provider
Zook.prototype.getProvider = function (path, version, cb) {
    var self = this;
    var _path = '/dubbo/' + path + '/providers';
    return self._client.getChildren(_path, function (err, children) {
        var child, parsed, provider, i, l;
        if (err) {
            return cb(err);
        }

        if (children && !children.length) {
            return cb('Can\'t find children from the node: ' + _path +
                ' ,please check the path!');
        }

        try {
            for (i = 0, l = children.length; i < l; i++) {
                child = querystring.parse(decodeURIComponent(children[i]));
                //console.log('A======================'+i,JSON.stringify(child));
                //console.log(child);
                if (child.version === version || child.serialization=='hessian2' ) {
                    break;
                }
            }
            //console.log('======================final：',JSON.stringify(child));
            parsed = url.parse(Object.keys(child)[0]);
            provider = {
                host: parsed.hostname,
                port: parsed.port,
                methods: child.methods.split(',')
            };
            self._cache[path] = provider;
        } catch (err) {
            return cb(err);
        }

        return cb(false, provider);
    });
};

var zd = new Zook({
    // config the addresses of zookeeper
    conn: 'inner.dubbo1.woqu.com:2188,inner.dubbo2.woqu.com:2188,inner.dubbo3.woqu.com:2188',
    dubbo: '2.5.3'
});
zd.client.on('connected', function connect(rsp) {
    console.log('zookeeper client (for dubbo protocol) connected!');
});


// connect to zookeeper
zd.connect();
module.exports.userRemote = zd.getInvoker('com.woqu.ess.service.UserService');

