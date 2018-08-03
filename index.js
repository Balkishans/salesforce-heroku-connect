var express = require("express"),
    app = express(),
    pg = require("pg"),
    path = require("path");
var https = require('https');
/**
 * File upload via AWS S3 / Bucketeer Addon
 * For Amazon Data Center East
 */
/*var aws = require("aws-sd");
var s3 = new aws.S3({
    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
});*/

app.set("port", (process.env.PORT || 5000));

/*
* PG Client connection
*/
pg.defaults.ssl = true;

var dbString = process.env.DATABASE_URL;

var sharedPgClient;

pg.connect(dbString, function(err,client){
    if(err){
        console.error("PG Connection Error")
    }
    console.log("Connected to Postgres");
    sharedPgClient = client;
});

/*
 * ExpressJS View Templates
 */
app.set("views", path.join(__dirname, "./app/views"));
app.set("view engine", "ejs");

/*
 * Jobs Landing Page
 */
app.get("/",function defaultRoute(req, res){
    var query = "SELECT * FROM salesforce.account";
    var result = [];
    sharedPgClient.query(query, function(err, result){
        console.log("Jobs Query Result Count: " + result.rows.length);
        res.render("index.ejs", {connectResults: result.rows});
    });
});

app.get("/fetch",function defaultRoute(req, res){
var options = {
  host: 'salesforce-appcino.herokuapp.com',
  path: '/accounts/1',
  method: 'GET'
};

https.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
}).end();
});
/*
 * Run Server
 */
var server = app.listen(app.get('port'), function(){
    console.log('Node Connect App Running at http://%s:%s', server.address().address, server.address().port);
});
