exports.port = process.env.PORT;
exports.slack_address = process.env.SLACK_URL;
exports.invoice_url = process.env.INVOICE_URL;

exports.mongodb_products_uri = process.env.MONGODB_URI;
exports.productdb = process.env.MONGODB_DBNAME;
exports.mongodb_orders_uri = process.env.MONGOLAB_GRAY_URI;
exports.orderdb = process.env.MONGOLAB_GRAY_DBNAME;

exports.check_tx_interval = 5 * 1000;
exports.check_tx_timeout = 600 * 1000;
