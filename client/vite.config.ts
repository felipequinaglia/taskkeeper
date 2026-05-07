import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from "lovable-tagger";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    // 1. Keep your React Compiler setup (Babel)
    // We do NOT use 'plugin-react-swc' because it doesn't support the React Compiler yet.
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    
    // 2. Add the Lovable Tagger (only runs in dev mode)
    mode === 'development' && componentTagger(),
  ].filter(Boolean),

  // 3. Add the Path Alias (CRITICAL for Shadcn/Lovable components)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));