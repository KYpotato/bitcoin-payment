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
  return result;
}

exports.lookupinvoice = async function(rhash) {
  await LndRpc.toMain();
  
  // let result = await LndRpc.lookupInvoice({rHashStr: Buffer.from(rhash, 'base64').toString('hex')});
  let result = await LndRpc.lookupInvoice({rHashStr: rhash});
  return result;
}

exports.addinvoice = async function(value) {
  await LndRpc.toMain();

  let result = await LndRpc.addInvoice({value: value});
  return result;
}

exports.channelbalance = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.channelBalance();
  return result;
}

exports.decodepayreq = async function(payreq) {
  await LndRpc.toMain();

  let result = await LndRpc.decodePayReq({payReq: payreq});
  return result;
}

exports.getlocalservice = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.getLocalService();
  return result;
}

exports.getremoteservice = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.getRemoteService();
  return result;
}

exports.hasservicemain = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.hasServiceMain();
  return result;
}

exports.hasserviceunlocker = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.hasServiceUnlocker();
  return result;
}

exports.ismain = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.isMain();
  return result;
}

exports.isserverdown = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.isServerDown();
  return result;
}

exports.isserverdownmain = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.isServerDownMain();
  return result;
}

exports.isserverdownunlocker = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.isServerDownUnlocker();
  return result;
}

exports.isunlocker = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.isUnlocker();
  return result;
}

exports.listchannels = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.listChannels();
  return result;
}

exports.newaddress = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.newAddress();
  return result;
}

exports.request = async function(value) {
  await LndRpc.toMain();

  let result = await LndRpc.request({
      satoshis: value
  });
  return result;
}

exports.walletbalance = async function() {
  await LndRpc.toMain();

  let result = await LndRpc.walletBalance();
  return result;
}