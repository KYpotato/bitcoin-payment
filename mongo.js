const MongoClient = require('mongodb').MongoClient;

exports.get_docs = async (url, db_name, collection_name, filter) => {
  let client;

  try {
  client = await MongoClient.connect(url, {useNewUrlParser: true});
  const db = client.db(db_name);
  return await db.collection(collection_name).find(filter).toArray();
  }
  catch(error) {
    console.log(error);
  }
  finally {
    client.close();
  }
}

exports.insert = async (url, db_name, collection_name, doc) => {
  let client;

  try{
    client = await MongoClient.connect(url, {useNewUrlParser: true});
    const db = client.db(db_name);
    return await db.collection(collection_name).insert(doc);
  }
  catch(error) {
    console.log(error);
  }
  finally {
    client.close();
  }
}

exports.updateone = async (url, db_name, collection_name, filter, update_data) => {
  let client;

  try{
    client = await MongoClient.connect(url, {useNewUrlParser: true});
    const db = client.db(db_name);
    return await db.collection(collection_name).updateOne(filter, update_data);
  }
  catch(error) {
    console.log(error);
  }
  finally {
    client.close();
  }
}