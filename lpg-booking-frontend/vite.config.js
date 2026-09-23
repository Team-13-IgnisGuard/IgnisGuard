import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // sockjs-client (used for live GPS tracking's WebSocket connection)
    // references Node.js's `global` object internally — Vite's browser
    // build doesn't polyfill this automatically, unlike older Webpack
    // setups, so it needs to be aliased to the browser's globalThis
    // explicitly or every page load throws "global is not defined".
    global: 'globalThis',
  },
})
