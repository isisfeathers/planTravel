module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "./frontend",
      script: "npm",
      args: "run dev",
      env: { PORT: 3000 }
    },
    {
      name: "flight-service",
      cwd: "./services/flight-service",
      script: "npm",
      args: "run dev",
      env: { PORT: 3002 }
    },
    {
      name: "line-bot",
      cwd: "./services/line-bot",
      script: "npm",
      args: "run dev",
      env: { PORT: 3003 }
    },
    {
      name: "n8n",
      script: "npx",
      args: "--yes n8n@2.35.3 start",
      env_file: "./.env.n8n",
      env: {
        N8N_PORT: 5678
      }
    }
  ]
};
