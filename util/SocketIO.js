var io = require('socket.io').listen(8888);
io.sockets.on('connection',function(socket){
    socket.emit('news', {hello:'world'});
    socket.on('request',function(){


    });
});