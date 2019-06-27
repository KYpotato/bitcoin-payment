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
`node server.js`  
