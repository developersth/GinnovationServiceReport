/**
 * ecosystem.config.js
 * PM2 configuration for a Next.js application using Bun.
 *
 * This file helps PM2 manage, monitor, and scale your Next.js application.
 * It's configured to run a production build script using Bun.
 */
module.exports = {
    apps: [
      {
        // The name of your application in PM2
        name: 'nextjs-app',
        
        // The script to be executed.
        // Bun is used as the interpreter to execute the 'start' script.
        script: 'bun',
  
        // Arguments to pass to the script.
        // This command will run the 'start' script from your package.json,
        // which is typically used for Next.js production builds.
        args: 'run start',
  
        // Specify the interpreter to use. This is crucial for Bun.
        interpreter: 'bun',
        
        // Enable autorestart to automatically restart the app if it crashes
        autorestart: true,
        
        // For production, watch should be false to prevent unnecessary restarts
        watch: false,
        
        // Maximum memory allocation in megabytes
        max_memory_restart: '1G',
        
        // Environment variables for production
        env_production: {
          NODE_ENV: 'production',
          PORT: 3000
        },
  
        // Environment variables for development
        env_development: {
          NODE_ENV: 'development',
          PORT: 3001
        }
      },
    ],
  };
  