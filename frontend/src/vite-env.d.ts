/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // aquí puedes agregar otras VITE_... si luego las usas
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
