/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CMC_API_KEY: string;
    readonly VITE_APP_MODE: 'mock' | 'api';
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }