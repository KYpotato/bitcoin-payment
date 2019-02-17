var http = require('http');
var fs = require('fs');
var ejs = require('ejs');
var qs = require('querystring');
var settings = require('./settings');
var server = http.createServer();
var template_home = fs.readFileSync(__dirname + '/public_html/home.ejs', 'utf-8');
var template_purchase = fs.readFileSync(__dirname + '/public_html/purchase.ejs', 'utf-8');
var template_payment = fs.readFileSync(__dirname + '/public_html/payment.ejs', 'utf-8');
var products = [];
//var orders = [];
var MongoClient = require('mongodb').MongoClient;
var check_io;

const CHECK_TX_INTERVAL = 5000;
const UNIT_SATOSHI = 100000000;

console.log(settings);

var API = {
    chain_so : 0,
    blockchain_info : 1,
    btc_com : 2,
    block_cypher : 3
};
const target_api = API.chain_so;

var NETWORK = {
    mainnet : 0,
    testnet : 1
}
const network = NETWORK.mainnet;

const check_tx = (btc_address, purchase_amount) => {
    console.log("checking transaction:" + btc_address + " amount:" + purchase_amount);
    //check payment
    //if finished payment then update db and clear interval and move page and inform it to owner
    //if timeout then update db and clear interval and move page

    //watching payment
    const https = require('https');
    switch(target_api){
        case API.chain_so:
            //chain.so
            var target_network;
            if(network == NETWORK.mainnet){
                target_network = "BTC";
            }
            else{
                target_network = "BTCTEST";
            }
            const ex_apireq_chain_so = https.request
            ('https://chain.so/api/v2/get_address_balance/' + target_network + '/' + btc_address, (ex_apires) => {
                ex_apires.on('data', (chunk) => {
                    //console.log(`BODY: ${chunk}`);
                    var json_blockchain = JSON.parse(Buffer.from(chunk).toString('utf-8'));
                    console.log(json_blockchain.data.address + ":" + json_blockchain.data.confirmed_balance + "btc");
                });
                ex_apires.on('end', () => {
                    console.log('No more data in responce.');
                });
            })
            ex_apireq_chain_so.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });
            ex_apireq_chain_so.end();
            break;
        case API.blockchain_info:
            //blockchain.info
            /*need api key*/
            break;
        case API.btc_com:
            //btc.com
            /*const ex_apireq = https.request
            ('https://chain.api.btc.com/v3/address/n14trMejKPL8HMBj2EhQkctsDfhMXHMtkJ', (ex_apires) => {
                ex_apires.on('data', (chunk) => {
                    //console.log(`BODY: ${chunk}`);
                    var json_blockchain = JSON.parse(Buffer.from(chunk).toString('utf-8'));
                    console.log(json_blockchain.data.address + ":" + json_blockchain.data.confirmed_balance);
                });
                ex_apires.on('end', () => {
                    console.log('No more data in responce.');
                });
            })*/
            break;
        case API.block_cypher:
            //blockcypher.com
            if(network == NETWORK.mainnet){
                target_network = "main";
            }
            else{
                target_network = "test3";
            }
            const ex_apireq_block_cypher = https.request
            ('https://api.blockcypher.com/v1/btc/test3/addrs/' + btc_address + '/balance', (ex_apires) => {
                ex_apires.on('data', (chunk) => {
                    //console.log(`BODY: ${chunk}`);
                    var json_blockchain = JSON.parse(Buffer.from(chunk).toString('utf-8'));
                    console.log(json_blockchain.address + ":" + json_blockchain.final_balance + "satoshi");
                });
                ex_apires.on('end', () => {
                    console.log('No more data in responce.');
                });
            })
            ex_apireq_block_cypher.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });
            ex_apireq_block_cypher.end();
            break;
        default:
            break;
    }

}

/* get products info from db */
MongoClient.connect("mongodb://" + settings.host, function(err, client){
    if(err) { return console.dir(err); }
    console.log("connected to db");
    const db = client.db(settings.productdb);
    db.collection('products', function(err, collection){
        if(err){ return console.dir(err); }
        /*
        name            :product name
        unit_price_s    :unit price(satoshi)
        image           :image path of product
         */
        collection.find().toArray(function(err, items){
            for(var i = 0; i < items.length; i++){
                products.push(items[i]);
            }
            console.log(products);
            //stop if thera are no products
            if(products.length == 0){
                console.log("there are no products info on productdb");
                return;
            }
        });
    });
});

server.on('request', function(req, res){
    switch(req.url){
        case '/home':
            var data = ejs.render(template_home, {
                product_name_1: products[0].name,
                product_image_1: products[0].image,
                unit_price_1: products[0].unit_price_s / UNIT_SATOSHI,
                product_name_2: products[1].name,
                product_image_2: products[1].image,
                unit_price_2: products[1].unit_price_s /UNIT_SATOSHI,
            })
            res.writeHead(200, {'Content-Type':'text/html'});
            res.write(data);
            res.end();
            break;
            
        case '/purchase1':
        case '/purchase2':
            var product_id;
            if(req.url == '/purchase1'){
                product_id = 0;
            }
            else if(req.url == '/purchase2'){
                product_id = 1;
            }
            else{
                res.writeHead(404, {'Content-Type':'text/plain'});
                res.write('not found');
                res.end();
                return;
            }
            var data = ejs.render(template_purchase, {
                product_name: products[product_id].name,
                unit_price: products[product_id].unit_price_s / UNIT_SATOSHI,
                img_path: products[product_id].image
            })
            res.writeHead(200, {'Content-Type':'text/html'});
            res.write(data);
            res.end();
            break;

        case '/payment':
            //receive post(buy)
            if(req.method === "POST"){
                req.data = "";
                req.on("readable", function(){
                    req.data += req.read();
                });
                req.on("end", function(){
                    //parse submited data
                    var query = qs.parse(req.data);
                    var purchase_amount = query.num * Number(query.unit_price);
                    /* get invoice from web api */
                    var json_invoice;
                    const apireq = http.request("http://localhost:3000/api/v1/invoice?amount=" + purchase_amount, (apires => {
                        apires.on('data', (chunk) => {
                            //console.log(`${chunk}`);
                            //console.log(Buffer.from(chunk).toString('utf-8'));
                            json_invoice = JSON.parse(Buffer.from(chunk).toString('utf-8'));
                            console.log(json_invoice.invoice);
                            //make payment page
                            var data = ejs.render(template_payment, {
                                invoice: json_invoice.invoice
                            })
                            res.writeHead(200, {'Content-Type':'text/html'});
                            res.write(data);
                            res.end();

                            /* regster order to db */
                            //connect to mongodb
                            MongoClient.connect("mongodb://" + settings.host, function(err, client){
                                if(err){ return console.dir(err); }
                                console.log("connected to db");
                                //use orderdb
                                const db = client.db(settings.orderdb);
                                db.collection("orders", function(err, collection){
                                    if(err){ return console.dir(err); }
                                    /* 
                                    product         :purduct name
                                    num             :purchase number
                                    email_address   :customer email address
                                    home_address    :customer home address
                                    btc_address     :bitcoin address
                                    name            :customer name
                                    cancel          :flag if canceled
                                    paid            :flag if paid
                                    purchase_amount :purchase amount(btc)
                                    payment_amount  :payment amount(btc)
                                    */
                                    var doc = [{
                                        product: query.product, 
                                        num: query.num, 
                                        email_address: query.email_address, 
                                        home_address:query.home_address, 
                                        btc_address:json_invoice.btc_address,
                                        name: query.name, 
                                        cancel: false, 
                                        paid: false, 
                                        purchase_amount: purchase_amount, 
                                        payment_amount: 0}
                                    ];
                                    collection.insert(doc, function(err, result){
                                        console.dir(result);
                                    })

                                    //start checking transaction
                                    check_io = setInterval(function(){check_tx(json_invoice.btc_address, purchase_amount)}, CHECK_TX_INTERVAL);
                                })
                            })
                        });
                        apires.on('end', () => {
                            console.log('No more data in responce');
                        });
                    }))
                    apireq.on('error', (e) => {
                        console.error(`problem with request: ${e.message}`);
                    })
                    apireq.end();
                });
            }
            break;

        case '/fin_payment':
            fs.readFile(__dirname + '/public_html' + req.url + '.html', 'utf-8', function(err, data){
                if(err){
                    res.writeHead(404, {'Content-Type':'text/plain'});
                    res.write('not found');
                    res.end();
                    return;
                }
                res.writeHead(200, {'Content-Type':'text/html'});
                res.write(data);
                res.end();
            })

            //stop checking transaction
            if(check_io != null){
                clearInterval(check_io);
            }
            break;

        default:
            //not found page
            res.writeHead(404, {'Content-Type':'text/plain'});
            res.write('not found');
            res.end();
            break;
    }
})
server.listen(settings.port, settings.host);
console.log("server listening...");