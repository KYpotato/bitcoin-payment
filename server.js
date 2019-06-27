var http = require('http');
var https = require('https');
var fs = require('fs');
var ejs = require('ejs');
var qs = require('querystring');
var settings = require('./settings');
var ObjectID = require('mongodb').ObjectID;
var request_slack = require('request');
var server = http.createServer();
var template_home = fs.readFileSync(__dirname + '/public_html/home.ejs', 'utf-8');
var template_purchase = fs.readFileSync(__dirname + '/public_html/purchase.ejs', 'utf-8');
var template_payment = fs.readFileSync(__dirname + '/public_html/payment.ejs', 'utf-8');
var products = [];
var MongoClient = require('mongodb').MongoClient;
var interval_obj = new Object();
var timeout_obj = new Object();
var id_to_btc_address = new Object();
var paid_id = new Object();
var timeout_id = new Object();

const CHECK_TX_INTERVAL = settings.check_tx_interval;
const CHECK_TX_TIMEOUT = settings.check_tx_timeout;
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
const network = NETWORK.testnet;

const check_tx = (id, purchase_amount) => {
    console.log("checking transaction:" + id_to_btc_address[id] + " amount:" + purchase_amount);
    //check payment

    //watching payment
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
            ('https://chain.so/api/v2/get_address_balance/' + target_network + '/' + id_to_btc_address[id], (ex_apires) => {
                ex_apires.on('data', (chunk) => {
                    //console.log("balance json:" + chunk);
                    try{
                        var json_blockchain = JSON.parse(Buffer.from(chunk).toString('utf-8'));
                        var confirmed_balance = Number(json_blockchain.data.confirmed_balance);
                        var unconfirmed_balance = Number(json_blockchain.data.unconfirmed_balance);
                        console.log("confirmed_balance:" + confirmed_balance);
                        console.log("unconfirmed_balance:" + unconfirmed_balance);
                        console.log("purcase_amount:" + purchase_amount);
                        console.log("address:" + json_blockchain.data.address);
                        var sum_balance = confirmed_balance + Number(unconfirmed_balance);
                        if(sum_balance >= purchase_amount){
                            console.log('call paid_process');
                            //clear check payment 
                            paid_process(id, confirmed_balance, unconfirmed_balance);
                        }
                    } 
                    catch (e){
                        console.log("except at get json(balance):" + e);
                        console.log("json:" + chunk);
                    }
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
            /*if(network == NETWORK.mainnet){
                target_network = "main";
            }
            else{
                target_network = "test3";
            }
            const ex_apireq_block_cypher = https.request
            ('https://api.blockcypher.com/v1/btc/test3/addrs/' + id_to_btc_address[id] + '/balance', (ex_apires) => {
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
            ex_apireq_block_cypher.end();*/
            break;
        default:
            break;
    }
}

function cancel_process(id){
    console.log("cancel_process:" + id);
    //clear interval and timeout
    clearInterval(interval_obj[id]);
    clearTimeout(timeout_obj[id]);
    /* update db */
    //connect to mongodb
    MongoClient.connect(settings.mongodb_orders_uri, { useNewUrlParser: true }, function(err, client){
        if(err){ return console.dir(err); }
        //use orderdb
        const db = client.db(settings.orderdb);
        db.collection("orders", function(err, collection){
            if(err){ return console.dir(err); }
            //update
            var filter = {_id: ObjectID(id.toString())};               
            var update_data = {$set:{cancel:true}};
            collection.updateOne(filter, update_data, function(err, result){
                console.log("update db:" + result);
            })
        })
    })
    //clear array
    delete id_to_btc_address[id];
    delete interval_obj[id];
    delete timeout_obj[id];
}

const timeout_process = (id) => {
    console.log("timeout_process:" + id);
    //clear interval
    clearInterval(interval_obj[id]);
    /* update db */
    //connect to mongodb
    MongoClient.connect(settings.mongodb_orders_uri, { useNewUrlParser: true }, function(err, client){
        if(err){ return console.dir(err); }
        //use orderdb
        const db = client.db(settings.orderdb);
        db.collection("orders", function(err, collection){
            if(err){ return console.dir(err); }
            //update
            var filter = {_id: ObjectID(id.toString())};               
            var update_data = {$set:{timeout:true}};
            collection.updateOne(filter, update_data, function(err, result){
                console.log("update db:" + result);
            })
        })
    })
    //clear array
    delete id_to_btc_address[id];
    delete interval_obj[id];
    delete timeout_obj[id];
    //register timeout
    timeout_id[id] = true;
}

function paid_process(id, confirmed_balance, unconfirmed_balance){
    console.log("paid_process:" + id);
    if(interval_obj[id] != null && id.length > 0){
        console.log('clear interval')
        //clear checking payment and timeout
        clearInterval(interval_obj[id]);
        clearTimeout(timeout_obj[id]);
        /* update db */
        //connect to mongodb
        MongoClient.connect(settings.mongodb_orders_uri, { useNewUrlParser: true }, function(err, client){
            if(!err){
                //use orderdb
                const db = client.db(settings.orderdb);
                db.collection("orders", function(err, collection){
                    if(!err){
                        //update
                        var filter = {_id: ObjectID(id.toString())};               
                        var update_data = {
                            $set:{
                                paid: true,
                                confirmed_balance: confirmed_balance,
                                unconfirmed_balance: unconfirmed_balance}};
                        collection.updateOne(filter, update_data, function(err, result){
                            console.log("update db:" + result);
                        })
                        //find
                        collection.find(filter).toArray((err, documents) => {
                            if(!err){
                                //inform it to owner
                                var options = {
                                    url: settings.slack_address,
                                    headers: {"Content-type": "application/json",},
                                    json: {"text": documents[0].num + " of " + del_termination_null(documents[0].product) + " is sold"}
                                };
                                request_slack.post(options, function(err, resuponse, body){
                                    if(!err && resuponse.statusCode == 200){
                                        console.log(body.name);
                                    }
                                    else{
                                        console.log('error:' + resuponse.statusCode + body);
                                    }
                                })
                            }
                            else{
                                console.dir(err);
                            }
                        })
                    }
                    else{
                        console.dir(err); 
                    }
                })
            }
            else{
                console.dir(err); 
            }
        })
        //clear array
        delete id_to_btc_address[id];
        delete interval_obj[id];
        delete timeout_obj[id];
        //register paid id
        paid_id[id] = true;
    }
}

function del_termination_null(target_srt){
    //console.log(target_srt);
    if(target_srt.length > 4){
        //console.log(target_srt.slice(-4));
        if(target_srt.slice(-4) == "null"){
            //console.log(target_srt.slice(0, -4));
            return target_srt.slice(0, -4);
        }
        else{
            return target_srt;
        }
    }
}

/* get products info from db */
MongoClient.connect(settings.mongodb_products_uri, { useNewUrlParser: true }, function(err, client){
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
    let url_array = req.url.split('.');
    let ext = url_array[url_array.length - 1];
    let path = __dirname + '/public_html/' + req.url;
    if(ext == 'png'){
        console.log('----'+ req.url + '-----');
        fs.readFile(path, function(err, data){
            res.writeHead(200, {"Content-Type": "image/png"});
            res.end(data);
        })
    }
    else{
        switch(req.url){
            case '/':
            case '/home':
                console.log('----'+ req.url + '-----');
                if(req.method === "POST"){
                    console.log('cancel');
                    req.data = "";
                    req.on("readable", function(){
                        //parse submited data
                        req.data += req.read();
                    });
                    req.on("end", function(){
                        var query = qs.parse(req.data);
                        cancel_process(del_termination_null(query.id));
                    });
                }
                var data = ejs.render(template_home, {
                    product_name_1: products[0].name,
                    product_image_1: products[0].image,
                    unit_price_1: products[0].unit_price_s / UNIT_SATOSHI,
                    product_name_2: products[1].name,
                    product_image_2: products[1].image,
                    unit_price_2: products[1].unit_price_s / UNIT_SATOSHI,
                })
                res.writeHead(200, {'Content-Type':'text/html'});
                res.write(data);
                res.end();
                break;
                
            case '/purchase1':
            case '/purchase2':
                console.log('----'+ req.url + '-----');
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
                console.log(products[product_id].image);
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
                console.log('----'+ req.url + '-----');
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
                        console.log(query.payment_method);
                        /* get invoice from web api */
                        var json_invoice;
                        const apireq = http.request(settings.invoice_url + purchase_amount, (apires => {
                            apires.on('data', (chunk) => {
                                //parse invoice
                                json_invoice = JSON.parse(Buffer.from(chunk).toString('utf-8'));
                                console.log(json_invoice.invoice);

                                /* regster order to db */
                                //connect to mongodb
                                MongoClient.connect(settings.mongodb_orders_uri, { useNewUrlParser: true }, function(err, client){
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
                                        timeout         :flag if timeout
                                        purchase_amount :purchase amount(btc)
                                        confirmed_balance   :confirmed balance(btc) when paid
                                        unconfirmed_balance :unconfirmed balance(btc) when paid
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
                                            timeout: false,
                                            purchase_amount: purchase_amount, 
                                            confirmed_balance: 0,
                                            unconfirmed_balance: 0}
                                        ];
                                        collection.insert(doc, function(err, result){
                                            console.dir(result);
                                            var new_id = del_termination_null(String(result["ops"][0]["_id"]));
                                            //start checking transaction
                                            if(id_to_btc_address[new_id]){
                                                console.log("duplication id")
                                            }
                                            id_to_btc_address[new_id] = json_invoice.btc_address;
                                            console.log("id:" + new_id);
                                            console.log("address:" + id_to_btc_address[new_id]);
                                            interval_obj[new_id] = setInterval(
                                                function(){check_tx(new_id, purchase_amount)}, 
                                                CHECK_TX_INTERVAL);
                                            timeout_obj[new_id] = setTimeout(
                                                function(){timeout_process(new_id)},
                                                CHECK_TX_TIMEOUT);
                                            console.log(id_to_btc_address[new_id]);
                                            console.log(interval_obj[new_id]);

                                            //make payment page
                                            var data = ejs.render(template_payment, {
                                                invoice: json_invoice.invoice,
                                                id:new_id,
                                                time_limit: CHECK_TX_TIMEOUT
                                            })
                                            res.writeHead(200, {'Content-Type':'text/html'});
                                            res.write(data);
                                            res.end();
                                        })

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

            case '/check_payment':
                console.log('----'+ req.url + '-----');
                if(req.method === "POST"){
                    req.data = "";
                    req.on("readable", function(){
                        req.data += req.read();
                    });
                    req.on("end", function(){
                        //parse id
                        var ret_target_id = del_termination_null(qs.parse(req.data).id);
                        console.log(paid_id[ret_target_id]);
                        console.log(timeout_id[ret_target_id]);
                        console.log(id_to_btc_address[ret_target_id]);
                        if(paid_id[ret_target_id]){
                            //paid 
                            console.log('send paid info to client');
                            res.write('paid');
                            res.end ();
                            delete paid_id[ret_target_id];
                            if(timeout_id[ret_target_id]){ delete timeout_id[ret_target_id]; }
                        }
                        else if(timeout_id[ret_target_id]){
                            //timeout
                            console.log('return timeout to client');
                            res.write('timeout');
                            res.end ();
                            delete timeout_id[ret_target_id];
                        }
                        else{
                            //not paid yet
                            console.log("return 'not yet' to client");
                            res.write('not yet');
                            res.end ();
                        }
                    });
                }
                break;

            case '/timeout':
            case '/fin_payment':
            default:
                console.log('----'+ req.url + '-----');
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
                break;
        }
    }
})
server.listen(settings.port, () => console.log('Listening on port ' + settings.port));
