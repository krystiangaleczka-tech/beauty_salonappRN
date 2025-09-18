const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

function getCurrentIP() {
  try {
    const output = execSync('ifconfig | grep "inet " | grep -v 127.0.0.1', { encoding: 'utf8' });
    const match = output.match(/inet (\d+\.\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Błąd podczas pobierania IP:', error.message);
    return null;
  }
}

function updateIPInFile(filePath, oldIP, newIP) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(new RegExp(oldIP, 'g'), newIP);
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Zaktualizowano IP w pliku: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Błąd podczas aktualizacji pliku ${filePath}:`, error.message);
    return false;
  }
}

function updateAllIPs(newIP) {
  const filesToUpdate = [
    'apps/mobile/src/config.ts',
    'apps/web/playwright.config.ts',
    'apps/web/test-server.js',
    'README.md',
    'apps/web/.env'
  ];

  const oldIPs = ['172.20.10.2', '192.168.100.55', '84.40.158.244'];
  let updated = false;

  filesToUpdate.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      oldIPs.forEach(oldIP => {
        if (updateIPInFile(fullPath, oldIP, newIP)) {
          updated = true;
        }
      });
    }
  });

  return updated;
}

// Sprawdź i zaktualizuj IP przed startem
console.log('Sprawdzanie aktualnego adresu IP...');
const currentIP = getCurrentIP();

if (currentIP) {
  console.log(`Aktualne IP: ${currentIP}`);
  
  // Sprawdź czy IP w config.ts jest aktualne
  const configPath = path.join(__dirname, 'apps/mobile/src/config.ts');
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const configIPMatch = configContent.match(/http:\/\/(\d+\.\d+\.\d+\.\d+):3000/);
    const configIP = configIPMatch ? configIPMatch[1] : null;
    
    if (configIP && configIP !== currentIP) {
      console.log(`IP w konfiguracji (${configIP}) różni się od aktualnego (${currentIP}). Aktualizuję...`);
      updateAllIPs(currentIP);
    } else {
      console.log('IP w konfiguracji jest aktualne.');
    }
  } catch (error) {
    console.error('Błąd podczas sprawdzania konfiguracji:', error.message);
  }
} else {
  console.error('Nie udało się pobrać aktualnego IP. Kontynuuję z istniejącą konfiguracją.');
}

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