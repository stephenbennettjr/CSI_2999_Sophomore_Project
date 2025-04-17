
  
import { defineConfig } from 'vite';

export default defineConfig({
  root: './src', // Points to the "src" folder
  build: {
	  rollupOptions: {
      input: {
        main: './src/index.html',
        casual: './src/casual.html',
        normal: './src/normal.html',
        game: './src/game.html',
      },
    },
    outDir: '../dist', 
  },
  server: {
  host: "0.0.0.0",
  port: 3000,
},
  preview: {
	host: "0.0.0.0",
    port: 3000, 
	allowedHosts: ['music.phasmite.com']
  },
});