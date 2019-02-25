exports.port = process.env.PORT;
exports.host = 'localhost';
exports.slack_address = 'https://hooks.slack.com/services/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';
exports.invoice_url = process.env.INVOICE_URL;

//exports.mongodb_products_uri = "mongodb://" + this.host;
exports.mongodb_products_uri = process.env.MONGODB_URI;
exports.orderdb = 'heroku_7bkqz5mr';
//exports.mongodb_orders_uri = "mongodb://" + this.host;
exports.mongodb_orders_uri = process.env.MONGOLAB_GRAY_URI;
exports.productdb = "heroku_s303mcbb";

exports.check_tx_interval = 5 * 1000;
exports.check_tx_timeout = 600 * 1000;