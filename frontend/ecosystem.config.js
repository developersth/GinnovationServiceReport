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
      // We explicitly run 'bun' as the script itself.
      script: 'bun',
      
      // Arguments to pass to the bun script.
      // We tell Bun to run the 'next' command with the 'start' argument
      // and specify the port.
      args: ['run', 'next', 'start', '-p', '3000'],
      
      // Set the interpreter to 'none' since 'bun' is already the script.
      // This prevents PM2 from trying to use 'bun' as an interpreter
      // to run 'bun' again, which causes errors.
      interpreter: 'none',
      
      // Enable autorestart to automatically restart the app if it crashes
      autorestart: true,
      
      // For production, watch should be false to prevent unnecessary restarts
      watch: false,
      
      // Specify the number of instances to run. 'max' uses all available CPUs.
      instances: 1,
      
      // The execution mode. 'fork' is suitable for most web servers.
      exec_mode: 'fork',
      
      // Maximum memory allocation in megabytes before restarting
      max_memory_restart: '200M',
      
      // Environment variables for production
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
