# bitcoin-payment

## Overview
ビットコイン支払いのECサイト  

## Requirement
node.js npm MongoDB  

## Usage
  

## install
`git clone https://github.com/KYpotato/bitcoin-payment.git`  
`cd bitcoin-payment`  
`npm install`  
make settings.js  
```
exports.port = ;
exports.host = ;
exports.slack_address = ;
exports.invoice_url = ;

exports.mongodb_products_uri = ;
exports.mongodb_orders_uri = ;
exports.orderdb = ;
exports.productdb = ;

exports.check_tx_interval = ;
exports.check_tx_timeout = ;
```
`brew services start mongodb`  
make products data  
ex
```
> db.products.find()
{ "_id" : ObjectId("5d14746fcec6d95f966462ed"), "name" : "product 1", "unit_price_s" : 10000, "image" : "./img/img1.png" }
{ "_id" : ObjectId("5d14746fcec6d95f966462ee"), "name" : "product 2", "unit_price_s" : 20000, "image" : "./img/img2.png" }
```
`node server.js`  
