const { spawn } = require('child_process');
const path = require('path');

// Uruchom backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'apps/web'),
  stdio: 'inherit',
  shell: true
});

// Uruchom aplikację Expo
const mobile = spawn('npx', ['expo', 'start'], {
  cwd: path.join(__dirname, 'apps/mobile'),
  stdio: 'inherit',
  shell: true
});

backend.on('close', (code) => {
  console.log(`Backend zakończył działanie z kodem ${code}`);
  mobile.kill();
});

mobile.on('close', (code) => {
  console.log(`Aplikacja Expo zakończyła działanie z kodem ${code}`);
  backend.kill();
});

process.on('SIGINT', () => {
  console.log('Zamykanie procesów...');
  backend.kill();
  mobile.kill();
  process.exit();
});