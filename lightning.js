const lndRpc = require('lnd-rpc');
const settings = require('./settings');

const LndRpc = lndRpc.LightningRpc.fromFilePaths(
    settings.tls,
    settings.macaroon
)


exports.getinfo = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.getInfo();
  console.log(result);
}

exports.lookupinvoice = async function(rhash) {
  await LndRpc.toMain();
  
  let result = await LndRpc.lookupInvoice({rHashStr: Buffer.from(rhash, 'base64').toString('hex')});
  console.log(result);
}

exports.addinvoice = async function(value) {
  await LndRpc.toMain();

  let result = await LndRpc.addInvoice({value: value});
  console.log(result);
}

exports.channelbalance = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.channelBalance();
  console.log(result);
}

exports.decodepayreq = async function(payreq) {
  await LndRpc.toMain();

  let result = await LndRpc.decodePayReq({payReq: payreq});
  console.log(result);
}

exports.getlocalservice = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.getLocalService();
  console.log(result);
}

exports.getremoteservice = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.getRemoteService();
  console.log(result);
}

exports.hasservicemain = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.hasServiceMain();
  console.log(result);
}

exports.hasserviceunlocker = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.hasServiceUnlocker();
  console.log(result);
}

exports.ismain = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.isMain();
  console.log(result);
}

exports.isserverdown = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.isServerDown();
  console.log(result);
}

exports.isserverdownmain = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.isServerDownMain();
  console.log(result);
}

exports.isserverdownunlocker = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.isServerDownUnlocker();
  console.log(result);
}

exports.isunlocker = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.isUnlocker();
  console.log(result);
}

exports.listchannels = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.listChannels();
  console.log(result);
}

exports.newaddress = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.newAddress();
  console.log(result);
}

exports.request = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.request({
      satoshis: 1000
  });
  console.log(result);
}

exports.walletbalance = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.walletBalance();
  console.log(result);
}