const mongoose = require('mongoose');

async function debug() {
  await mongoose.connect('mongodb://127.0.0.1:27017/archmind');
  const db = mongoose.connection;
  
  const Design = mongoose.model('Design', new mongoose.Schema({}, { strict: false }));
  const design = await Design.findById('6a149b233026e6d118de13dc');
  
  if (!design) {
    console.log('Design not found in DB!');
  } else {
    console.log('--- DESIGN TITLE ---');
    console.log(design.get('title'));
    console.log('--- HLD NODES ---');
    console.log(JSON.stringify(design.get('hld.nodes'), null, 2));
    console.log('--- HLD EDGES ---');
    console.log(JSON.stringify(design.get('hld.edges'), null, 2));
  }
  
  await mongoose.disconnect();
}

debug().catch(console.error);
