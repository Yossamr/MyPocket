import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import obfuscator from 'vite-plugin-javascript-obfuscator';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'" error
  // The third argument '' means load ALL env vars, not just VITE_ prefixed ones
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    base: '/MyPocket/', // GitHub Pages subdirectory
    plugins: [
      react(),
      obfuscator({
        include: [/\.jsx?$/, /\.tsx?$/, /\.js?$/, /\.ts?$/],
        exclude: [/node_modules/],
        apply: 'build',
        debugger: true,
        options: {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.4,
          debugProtection: true,
          debugProtectionInterval: 2000,
          disableConsoleOutput: true,
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          renameGlobals: false,
          rotateStringArray: true,
          selfDefending: true,
          stringArray: true,
          stringArrayEncoding: ['rc4'],
          stringArrayThreshold: 0.75,
          transformObjectKeys: true,
          unicodeEscapeSequence: false
        },
      }),
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    define: {
      // Check for VITE_GEMINI_API_KEY, GEMINI_API_KEY, or use the provided key as fallback
      'process.env.API_KEY': JSON.stringify(
        env.VITE_GEMINI_API_KEY || 
        env.GEMINI_API_KEY || 
        'AIzaSyBaAbnoGy1bLstboY8fIMcU8stWgEa1AIA'
      ),
    }
  };
});