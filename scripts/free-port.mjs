import { execSync } from 'node:child_process';

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 5050);

try {
  if (process.platform === 'win32') {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set(
      out
        .split('\n')
        .filter((line) => line.includes('LISTENING'))
        .map((line) => line.trim().split(/\s+/).pop())
        .filter((pid) => pid && pid !== '0')
    );
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`[predev] Processus ${pid} arrêté (port ${port}).`);
      } catch {
        /* déjà terminé */
      }
    }
  } else {
    execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore', shell: true });
  }
} catch {
  /* port déjà libre */
}
