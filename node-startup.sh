#!/bin/bash

app=$1
op=$2

if [ $app ];then	
case $op in 
start)
	pm2 start $app/start.js --name $app --output /data/logs/$app/info.log --error /data/logs/$app/error.log
;;
stop)
	pm2 stop $app
;;
restart)
	pm2 restart $app
;;
*)
echo "node-startup [appname] [start/stop/restart]"
esac
else
echo "node-startup [appname] [start/stop/restart]"
fi
exit 0
