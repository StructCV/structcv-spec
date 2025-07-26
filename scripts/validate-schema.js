const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const ajv = new Ajv({ 
  strict: true, 
  allErrors: true,
  verbose: true
});
addFormats(ajv);

function validateSchemaFile(schemaPath) {
  try {
    console.log(chalk.blue(`🔍 Validation du schéma: ${schemaPath}`));
    
    // 1. Vérifier que le fichier existe
    if (!fs.existsSync(schemaPath)) {
      console.error(chalk.red(`❌ Fichier non trouvé: ${schemaPath}`));
      return false;
    }
    
    // 2. Vérifier la syntaxe JSON
    let schema;
    try {
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      schema = JSON.parse(schemaContent);
      console.log(chalk.green('✅ Syntaxe JSON valide'));
    } catch (jsonError) {
      console.error(chalk.red(`❌ Erreur de syntaxe JSON: ${jsonError.message}`));
      return false;
    }
    
    // 3. Vérifier la structure du schéma JSON Schema
    if (!schema.$schema) {
      console.warn(chalk.yellow('⚠️  Aucun $schema spécifié'));
    } else {
      console.log(chalk.green(`✅ $schema: ${schema.$schema}`));
    }
    
    if (!schema.$id) {
      console.warn(chalk.yellow('⚠️  Aucun $id spécifié'));
    } else {
      console.log(chalk.green(`✅ $id: ${schema.$id}`));
    }
    
    // 4. Compiler le schéma avec AJV
    try {
      const validate = ajv.compile(schema);
      console.log(chalk.green('✅ Schéma compilé avec succès'));
      
      // 5. Vérifier les références internes
      const refs = findReferences(schema);
      if (refs.length > 0) {
        console.log(chalk.blue(`📋 Références trouvées: ${refs.length}`));
        refs.forEach(ref => {
          console.log(`   - ${ref}`);
        });
      }
      
      return true;
      
    } catch (compileError) {
      console.error(chalk.red(`❌ Erreur de compilation: ${compileError.message}`));
      return false;
    }
    
  } catch (error) {
    console.error(chalk.red(`❌ Erreur inattendue: ${error.message}`));
    return false;
  }
}

function findReferences(obj, path = '') {
  const refs = [];
  
  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (key === '$ref' && typeof value === 'string') {
        refs.push(`${currentPath}: ${value}`);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          refs.push(...findReferences(item, `${currentPath}[${index}]`));
        });
      } else if (typeof value === 'object') {
        refs.push(...findReferences(value, currentPath));
      }
    }
  }
  
  return refs;
}

function validateAllSchemas() {
  const schemasDir = path.join(__dirname, '../schemas');
  const versions = fs.readdirSync(schemasDir)
    .filter(f => f.startsWith('v') && fs.statSync(path.join(schemasDir, f)).isDirectory());
  
  let allValid = true;
  
  versions.forEach(version => {
    const schemaPath = path.join(schemasDir, version, 'structcv.schema.json');
    const isValid = validateSchemaFile(schemaPath);
    if (!isValid) {
      allValid = false;
    }
    console.log(''); // Ligne vide pour séparer
  });
  
  return allValid;
}

// Utilisation en ligne de commande
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Valider tous les schémas
    const allValid = validateAllSchemas();
    process.exit(allValid ? 0 : 1);
  } else {
    // Valider un schéma spécifique
    const schemaPath = args[0];
    const isValid = validateSchemaFile(schemaPath);
    process.exit(isValid ? 0 : 1);
  }
}

module.exports = { validateSchemaFile, validateAllSchemas }; 