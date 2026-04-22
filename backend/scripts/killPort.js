/**
 * killPort.js — runs automatically before `npm run dev` (predev hook)
 * Finds and kills whatever process is holding port 5000 on Windows.
 * Silently exits if the port is already free.
 */
const { execSync } = require('child_process');

const PORT = process.env.PORT || 5000;

try {
  // Windows: find PID using port, then kill it
  const result = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });

  const lines = result.split('\n').filter(l => l.includes('LISTENING'));
  const pids  = [...new Set(
    lines.map(l => l.trim().split(/\s+/).pop()).filter(Boolean)
  )];

  if (pids.length === 0) {
    console.log(`✅ Port ${PORT} is free — starting server...`);
    process.exit(0);
  }

  pids.forEach(pid => {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`🔪 Freed port ${PORT} (killed PID ${pid})`);
    } catch {
      // already gone
    }
  });

  // Brief pause so the OS releases the socket
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
  console.log(`✅ Port ${PORT} cleared — starting server...`);
} catch {
  // findstr returns exit code 1 when nothing matches = port is free
  console.log(`✅ Port ${PORT} is free — starting server...`);
}
