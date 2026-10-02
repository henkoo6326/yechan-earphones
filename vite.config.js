import {defineConfig} from 'vite';
export default defineConfig({base:process.env.GITHUB_ACTIONS?'/yechan-earphones/':'/',build:{rollupOptions:{output:{manualChunks:{three:['three']}}}}});
