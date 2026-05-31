const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/archmind');
  console.log('Connected to DB');
  
  const Design = mongoose.model('Design', new mongoose.Schema({}, { strict: false }));
  const design = await Design.findById('6a149b233026e6d118de13dc');
  if (!design) {
    console.log('Design not found');
    process.exit(1);
  }
  
  console.log('Design title:', design.get('title'));
  console.log('Product name:', design.get('productName'));
  console.log('UIUX screens structure:');
  console.log(JSON.stringify(design.get('uiux'), null, 2));
  
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
