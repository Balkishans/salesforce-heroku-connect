var express = require("express"),
    app = express(),
    pg = require("pg"),
    path = require("path");
var request = require('request');
var dateTime = require('node-datetime');
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

app.get('/accounts/:id', function(req, res) { 
       if (!req.params.id) { 
           res.status(500); 
           res.send({"Error": "Looks like you are not senging the product id to get the product details."}); 
           console.log("Looks like you are not senging the product id to get the product detsails."); 
       } 
      request.get({ url: "https://appcino-crud-app.herokuapp.com/accounts/" + req.params.id },      function(error, response, body) { 
              if (!error && response.statusCode === 200) { 
                  console.log(body); 
                  var obj = JSON.parse(body);
                  
                  var dt = dateTime.create();
                  var formatted = dt.format('Y-m-d H:M:S');
                  console.log(formatted); 
                  var externalid="A00-"+formatted;
                  var query = "Insert into salesforce.account(name,accountnumber,billingcity,externalid__c)values('"+obj.name+"','"+obj.accountnumber+"','"+obj.billingcity+"','"+externalid+"')";//,'"+obj.billingcity+"'
                  sharedPgClient.query(query);
                  var querycontact="Insert into salesforce.contact(firstname,lastname,account__externalid__c)values('"+obj.name+"','"+obj.accountnumber+"','"+externalid+"')";
                  sharedPgClient.query(querycontact);
                  res.redirect('/'); 
                 } 
             }); 
     }); 
/*
 * Run Server
 */
var server = app.listen(app.get('port'), function(){
    console.log('Node Connect App Running at http://%s:%s', server.address().address, server.address().port);
});
