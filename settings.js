exports.port = process.env.PORT;
exports.host = 'localhost';
exports.slack_address = 'https://hooks.slack.com/services/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';
exports.invoice_url = "http://localhost:3000/api/v1/invoice?amount=";

//exports.mongodb_products_uri = "mongodb://" + this.host;
exports.mongodb_products_uri = process.env.MONGODB_URI;
exports.orderdb = 'orderdb';
//exports.mongodb_orders_uri = "mongodb://" + this.host;
exports.mongodb_orders_uri = process.env.MONGOLAB_GRAY_URI;
exports.productdb = "productdb";

exports.check_tx_interval = 5 * 1000;
exports.check_tx_timeout = 600 * 1000;