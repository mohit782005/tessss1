#!/usr/bin/env node
/**
 * Nexus-X Telemetry Wrapper (Portable)
 * Drop this in any repo. No global CLI install needed.
 * Usage: node nexus-telemetry.js <command> [args...]
 */

import { spawn } from 'child_process';
import WebSocket from 'ws';

const BACKEND_URL = process.env.NEXUS_BACKEND_URL || 'http://localhost:8000';
const PROJECT = process.env.NEXUS_PROJECT || 'mohit/test2-b9a9ee58';

const [workspace, project] = PROJECT.split('/');
const wsUrl = BACKEND_URL.replace(/^http/, 'ws') + `/ws/runner/${workspace}/${project}`;
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node nexus-telemetry.js <command> [args...]');
  process.exit(1);
}

console.log(`\n📡 Nexus-X Telemetry Agent`);
console.log(`  Backend: ${BACKEND_URL}`);
console.log(`  Project: ${PROJECT}`);
console.log(`  Command: ${args.join(' ')}\n`);

// Connect WebSocket
let ws = null;
let connected = false;

try {
  ws = new WebSocket(wsUrl);
  ws.on('open', () => {
    connected = true;
    console.log('✓ Connected to Nexus-X. Streaming logs...\n');
  });
  ws.on('error', () => {
    console.log('⚠ WebSocket unavailable. Running without telemetry.\n');
  });
} catch {
  console.log('⚠ ws module not found. Running without telemetry.\n');
}

// Wait briefly for connection, then spawn
setTimeout(() => {
  const child = spawn(args[0], args.slice(1), {
    shell: true,
    cwd: process.cwd(),
    env: { ...process.env, NEXUS_TELEMETRY: 'active' }
  });

  function send(type, data) {
    if (ws && connected && ws.readyState === 1) {
      ws.send(JSON.stringify({ type, ...data }));
    }
  }

  child.stdout.on('data', (d) => {
    const text = d.toString();
    process.stdout.write(text);
    text.split('\n').filter(Boolean).forEach(line => send('log', { line, stream: 'stdout' }));
  });

  child.stderr.on('data', (d) => {
    const text = d.toString();
    process.stderr.write(text);
    text.split('\n').filter(Boolean).forEach(line => send('log', { line, stream: 'stderr' }));
  });

  child.on('close', (code) => {
    send('exit', { code });
    if (ws) setTimeout(() => ws.close(), 500);
    process.exit(code);
  });

  process.on('SIGINT', () => child.kill('SIGINT'));
  process.on('SIGTERM', () => child.kill('SIGTERM'));
}, 2000);
