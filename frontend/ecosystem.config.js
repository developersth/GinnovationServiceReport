module.exports = {
  apps: [{
    name: "my-nextjs-app",
    script: "./node_modules/next/dist/bin/next",
    args: "start -p 3000",
    cwd: "C:/Users/Administrator/Documents/GitHub/GinnovationServiceReport/frontend",
    exec_mode: "fork", // Changed from cluster - often better for Next.js
    instances: 1, // Single instance often works better with Next.js
    autorestart: true,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
    },
    error_file: "C:/Users/Administrator/Documents/GitHub/GinnovationServiceReport/frontend/logs/app-err.log",
    out_file: "C:/Users/Administrator/Documents/GitHub/GinnovationServiceReport/frontend/logs/app-out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss SSS",
    watch: false,
    wait_ready: true,
    listen_timeout: 10000
  }]
};