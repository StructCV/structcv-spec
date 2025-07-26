export interface VersionInfo {
    version: string;
    status: 'stable' | 'beta' | 'deprecated' | 'experimental';
    releaseDate: string | null;
    deprecated: boolean;
    deprecationMessage: string | null;
    changelog: string | null;
  }
  
  export interface DeprecationStatus {
    deprecated: boolean;
    message: string | null;
    status: string;
  }
  
  export interface StructCVSchema {
    getSchema(version?: string): object;
    getVersions(): string[];
    getLatestVersion(): string;
    getVersionInfo(version: string): VersionInfo;
    hasVersion(version: string): boolean;
    getDeprecationStatus(): Record<string, DeprecationStatus>;
    version: string;
    clearCache(): void;
  }
  
  declare const structcv: StructCVSchema;
  export default structcv;