const fs = require('fs');
const path = require('path');

// Cache for loaded schemas and metadata
const schemaCache = new Map();
const metadataCache = new Map();

module.exports = {
  // Get specific version schema (with caching)
  getSchema: (version) => {
    if (!version) {
      version = module.exports.getLatestVersion();
    }
    
    if (!schemaCache.has(version)) {
      const schemaPath = path.join(__dirname, 'schemas', version, 'structcv.schema.json');
      try {
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        schemaCache.set(version, schema);
      } catch (error) {
        throw new Error(`Schema version ${version} not found`);
      }
    }
    
    return schemaCache.get(version);
  },
  
  // Get all available versions (dynamically)
  getVersions: () => {
    const schemasDir = path.join(__dirname, 'schemas');
    return fs.readdirSync(schemasDir)
      .filter(f => f.startsWith('v') && fs.statSync(path.join(schemasDir, f)).isDirectory())
      .sort((a, b) => {
        // Sort versions properly (v0.1 < v0.2 < v1.0 < v10.0)
        const aParts = a.substring(1).split('.').map(Number);
        const bParts = b.substring(1).split('.').map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aPart = aParts[i] || 0;
          const bPart = bParts[i] || 0;
          if (aPart !== bPart) return aPart - bPart;
        }
        return 0;
      });
  },
  
  // Get latest version (dynamically detected)
  getLatestVersion: () => {
    const versions = module.exports.getVersions();
    return versions[versions.length - 1];
  },
  
  // Get version metadata
  getVersionInfo: (version) => {
    if (!metadataCache.has(version)) {
      const metadataPath = path.join(__dirname, 'schemas', version, 'metadata.json');
      let metadata = {
        version,
        status: 'stable',
        releaseDate: null,
        deprecated: false,
        deprecationMessage: null,
        changelog: null
      };
      
      try {
        const customMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        metadata = { ...metadata, ...customMetadata };
      } catch (e) {
        // No metadata file, use defaults
      }
      
      metadataCache.set(version, metadata);
    }
    
    return metadataCache.get(version);
  },
  
  // Check if version exists
  hasVersion: (version) => {
    return module.exports.getVersions().includes(version);
  },
  
  // Get deprecation status for all versions
  getDeprecationStatus: () => {
    const versions = module.exports.getVersions();
    const status = {};
    
    versions.forEach(version => {
      const info = module.exports.getVersionInfo(version);
      status[version] = {
        deprecated: info.deprecated,
        message: info.deprecationMessage,
        status: info.status
      };
    });
    
    return status;
  },
  
  // Current package version (not schema version)
  version: require('./package.json').version,
  
  // Clear caches (useful for testing)
  clearCache: () => {
    schemaCache.clear();
    metadataCache.clear();
  }
};