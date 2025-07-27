const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

const ajv = new Ajv({ strict: true, allErrors: true });
addFormats(ajv);

// Validate all examples
const versions = fs.readdirSync(path.join(__dirname, '../schemas'))
  .filter(f => f.startsWith('v'));

// Also check draft versions
const draftVersions = [];
if (fs.existsSync(path.join(__dirname, '../draft'))) {
  fs.readdirSync(path.join(__dirname, '../draft'))
    .filter(f => f.startsWith('v'))
    .forEach(v => draftVersions.push({ version: v, isDraft: true }));
}

let hasErrors = false;

// Validate official versions
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

// Validate draft versions
draftVersions.forEach(({ version }) => {
  console.log(`\nValidating ${version} examples (DRAFT)...`);
  
  const schemaPath = path.join(__dirname, '../draft', version, 'structcv.schema.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const validate = ajv.compile(schema);
  
  const examplesDir = path.join(__dirname, '../draft', version, 'examples');
  if (fs.existsSync(examplesDir)) {
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
  } else {
    console.log(`  ⚠️ No examples directory found`);
  }
});

process.exit(hasErrors ? 1 : 0);