import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startServer() {
  try {
    const server = await createServer({
      // Specify config file
      configFile: resolve(__dirname, 'vite.config.js'),
      // Force the server to use port 3000
      server: {
        port: 3000,
        host: 'localhost',
        strictPort: true,
        hmr: {
          port: 3000,
          host: 'localhost',
          protocol: 'ws',
        }
      },
      // Log level
      logLevel: 'info',
    });
    
    await server.listen();
    
    server.printUrls();
    
    // Handle shutdown gracefully
    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, () => {
        console.log(`\nReceived ${signal}, shutting down server...`);
        server.close().then(() => {
          console.log('Server closed successfully');
          process.exit(0);
        });
      });
    });
    
  } catch (e) {
    console.error('Error starting dev server:', e);
    process.exit(1);
  }
}

startServer(); 