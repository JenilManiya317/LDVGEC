import express from 'express';
import dotenv from 'dotenv';
import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || process.env.BACKEND_PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

console.log('\x1b[36m%s\x1b[0m', '============================================================');
console.log('\x1b[32m%s\x1b[0m', '  🌾 AgriSetu / FarmWise Backend Server Initializing...');
console.log('\x1b[36m%s\x1b[0m', '============================================================');

// Determine Python executable
function getPythonCommand() {
  const commands = ['python', 'python3', 'py'];
  for (const cmd of commands) {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      return cmd;
    } catch {
      // Continue checking next command
    }
  }
  return 'python';
}

const pythonCmd = getPythonCommand();
console.log(`\x1b[34m[Server]\x1b[0m Using Python executable: \x1b[33m${pythonCmd}\x1b[0m`);
console.log(`\x1b[34m[Server]\x1b[0m Target Host & Port: \x1b[33mhttp://${HOST}:${PORT}\x1b[0m`);

// Spawn FastAPI Uvicorn process
const uvicornArgs = [
  '-m', 'uvicorn',
  'backend.main:app',
  '--host', HOST,
  '--port', String(PORT),
  '--reload'
];

console.log(`\x1b[34m[Server]\x1b[0m Executing: \x1b[90m${pythonCmd} ${uvicornArgs.join(' ')}\x1b[0m\n`);

const backendProcess = spawn(pythonCmd, uvicornArgs, {
  cwd: __dirname,
  env: { ...process.env, PYTHONUNBUFFERED: '1' },
  shell: false
});

backendProcess.stdout.on('data', (data) => {
  process.stdout.write(data.toString());
});

backendProcess.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

backendProcess.on('error', (err) => {
  console.error('\x1b[31m[Server Error]\x1b[0m Failed to start backend process:', err.message);
});

backendProcess.on('close', (code) => {
  if (code !== null && code !== 0) {
    console.log(`\x1b[33m[Server]\x1b[0m Backend process exited with code ${code}`);
  }
});

// Cleanup process on shutdown
function cleanup() {
  console.log('\n\x1b[36m%s\x1b[0m', '============================================================');
  console.log('\x1b[33m[Server]\x1b[0m Shutting down backend process...');
  if (backendProcess && !backendProcess.killed) {
    if (process.platform === 'win32' && backendProcess.pid) {
      try {
        execSync(`taskkill /F /T /PID ${backendProcess.pid}`, { stdio: 'ignore' });
      } catch {
        backendProcess.kill('SIGKILL');
      }
    } else {
      backendProcess.kill('SIGTERM');
    }
  }
  console.log('\x1b[32m[Server]\x1b[0m Backend server stopped gracefully.');
  console.log('\x1b[36m%s\x1b[0m', '============================================================');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('uncaughtException', (err) => {
  console.error('\x1b[31m[Uncaught Exception]\x1b[0m', err);
  cleanup();
});
