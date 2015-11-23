var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var util = require('util');
var commandLineArgs = require('command-line-args');

var device = require('iotivity-node')();

var cli = commandLineArgs([
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false },
  { name: 'verbose', alias: 'v', type: Boolean, defaultValue: false },
  { name: 'port', alias: 'p', type: Number, defaultValue: 8000 },
  { name: 'https', alias: 's', type: Boolean, defaultValue: false }
]);

var options = cli.parse();

if (options.help) {
  console.log(cli.getUsage());
  return;
}

var appfw = "";
try {
  appfw = require('./appfw/appfw');
}
catch (e) {
  if (options.verbose)
    console.log("No AppFW module: " + e.message);
}

var app = express();
app.set('view engine', 'jade');
app.set('views', './views')

// Allow cross origin requests
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

appRouter = require('./routes/appRoutes')(appfw);
app.use('/api/apps', appRouter);

installRouter = require('./routes/installRoutes')(appfw);
app.use('/api/install', installRouter);

systemRouter = require('./routes/systemRoutes')();
app.use('/api/system', systemRouter);

oicRouter = require('./routes/oicRoutes')(device);
app.use('/api/oic', oicRouter);

app.get('/', function(req, res) {
  res.render('main', {title: "IoT OS API Server", host: req.hostname, port: options.port});
});

app.listen(options.port, function() {
  console.log('Running on PORT: ' + options.port);
})
