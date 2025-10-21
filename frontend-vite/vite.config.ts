import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@routes': path.resolve(__dirname, 'src/routes')
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true, // Para acceso desde la red local
    proxy: {
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar React y React DOM
          'react-vendor': ['react', 'react-dom'],
          // Separar React Router
          'router': ['react-router-dom'],
          // Separar Bootstrap y UI
          'ui-vendor': ['bootstrap', 'react-bootstrap', '@fortawesome/fontawesome-free'],
          // Separar Axios
          'http-vendor': ['axios']
        },
        // Nombres de archivos más descriptivos
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          let extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? '')) {
            extType = 'images';
          } else if (/woff2?|eot|ttf|otf/i.test(extType ?? '')) {
            extType = 'fonts';
          }
          return `assets/${extType}/[name]-[hash].[ext]`;
        }
      }
    },
    // Configuración para chunks más pequeños
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'bootstrap',
      'react-bootstrap'
    ]
  },
  define: {
    // Para compatibilidad con algunas librerías
    global: 'globalThis'
  }
})
