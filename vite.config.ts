import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 优先从 process.env 读取（Docker 构建环境），然后从 .env 文件读取（本地开发）
    const env = loadEnv(mode, '.', '');
    const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';

    console.log('🔧 Vite 构建配置:');
    console.log('   Mode:', mode);
    console.log('   API Key 来源:', process.env.GEMINI_API_KEY ? 'process.env' : env.GEMINI_API_KEY ? '.env 文件' : '未配置');
    console.log('   API Key 长度:', apiKey.length);

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        'process.env.MYSHELL_API_KEY': JSON.stringify(apiKey) // 使用同一个 API Key
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
