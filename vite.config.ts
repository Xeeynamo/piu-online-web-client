import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import preact from '@preact/preset-vite'

// GitHub Pages has no SPA rewrite: a hard load of a client-side route (e.g.
// /player/abc/songs) hits Pages' 404 unless a matching file exists. Copying the
// built index.html to 404.html makes Pages serve the app for any unknown path,
// which then routes client-side. Runs after the bundle is written.
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      const index = resolve(dist, 'index.html')
      if (existsSync(index)) copyFileSync(index, resolve(dist, '404.html'))
    },
  }
}

// PIU_WEB_SERVER is a build-time (GitHub Actions) variable naming the origin the
// client should fetch the API from, e.g. "https://api.example.com". It is
// inlined into the bundle at build time via `define` below, so it is minified
// together with the rest of the code and needs no runtime lookup. When unset
// (local dev) it stays empty and requests go to the relative "/api", which the
// dev server proxies to the local backend.
const piuWebServer = (process.env.PIU_WEB_SERVER ?? '').replace(/\/+$/, '')

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact(), spaFallback()],
  define: {
    // Compile-time constant; JSON.stringify keeps it a valid string literal
    // (or the empty string) after inlining.
    __PIU_WEB_SERVER__: JSON.stringify(piuWebServer),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
