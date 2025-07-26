const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

const ajv = new Ajv({ strict: true, allErrors: true });
addFormats(ajv);

// Validate all examples
const versions = fs.readdirSync(path.join(__dirname, '../schemas'))
  .filter(f => f.startsWith('v'));

let hasErrors = false;

versions.forEach(version => {
  console.log(`\nValidating ${version} examples...`);
  
  const schemaPath = path.join(__dirname, '../schemas', version, 'structcv.schema.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const validate = ajv.compile(schema);
  
  const examplesDir = path.join(__dirname, '../schemas', version, 'examples');
  const examples = fs.readdirSync(examplesDir).filter(f => f.endsWith('.json'));
  
  examples.forEach(example => {
    const data = JSON.parse(fs.readFileSync(path.join(examplesDir, example), 'utf8'));
    const valid = validate(data);
    
    if (valid) {
      console.log(`  ✅ ${example}`);
    } else {
      console.log(`  ❌ ${example}`);
      console.log(validate.errors);
      hasErrors = true;
    }
  });
});

process.exit(hasErrors ? 1 : 0);