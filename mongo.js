const MongoClient = require('mongodb').MongoClient;

exports.get_docs = async (url, dbname, collectionname) => {
  let client;

  try {
  client = await MongoClient.connect(url, {useNewUrlParser: true});
  const db = client.db(dbname);
  return await db.collection(collectionname).find({}).toArray();
  }
  catch(error) {
    console.log(error);
  }
  finally {
    client.close();
  }
}

exports.insert = async (url, dbname, collectionname, doc) => {
  let client;

  try{
    client = await MongoClient.connect(url, {useNewUrlParser: true});
    const db = client.db(dbname);
    return await db.collection(collectionname).insert(doc);
  }
  catch(error) {
    console.log(error);
  }
  finally {
    client.close();
  }
}