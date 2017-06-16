var env = process.env.VISA_ENV || "PROD"; //DEV | PROD
//for test :
env = "DEV";
console.log('==============current env:', env);

module.exports.env = env;
module.exports.logger = {
    "appenders": [
        {
            "type": "console"
        },
        {
            "type": "file",
            "filename": "logs/access.log",
            "pattern": "YYYY-MM-dd HH:mm:SS",
            "category": "http"
        },
        {
            "type": "file",
            "filename": "logs/app.log",
            "pattern": "YYYY-MM-dd HH:mm:SS",
            "maxLogSize": 20480,//KB
            "numBackups": 7,
            "category": "app"
        },
        {
            "type": "logLevelFilter",
            "level": "ERROR",
            "appender": {
                "type": "file",
                "filename": "logs/error.log",
                "maxLogSize": 20480,
                "numBackups": 7
            }
        }
    ]
};