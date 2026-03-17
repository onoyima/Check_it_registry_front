
const fs = require('fs');
const path = require('path');

const srcDir = './src';
const API_PATTERN = /http:\/\/localhost:\d+\/api/g;
const API_REPLACEMENT = "(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : (import.meta.env.VITE_API_URL || '/api'))";

// Also fix simple localhost fallback patterns in VITE_API_URL
const SIMPLE_PATTERN = /['"`]http:\/\/localhost:\d+\/api['"`]/g;
const SIMPLE_REPLACEMENT = "(import.meta.env.VITE_API_URL || '/api')";

// Files with hardcoded localhost
const targets = [
  'src/components/DeviceCheckModal.tsx',
  'src/pages/AdminAlerts.tsx',
  'src/pages/AdminDeviceManagement.tsx',
  'src/pages/AdminTransferHistory.tsx',
  'src/pages/AuditTrail.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/DeviceTransfer.tsx',
  'src/pages/LEAAlerts.tsx',
  'src/pages/LEATransferHistory.tsx',
  'src/pages/Notifications.tsx',
  'src/pages/PasswordReset.tsx',
  'src/pages/Search.tsx',
  'src/lib/supabase.ts',
];

let totalFixed = 0;

targets.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ SKIP (not found): ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;

  // Fix simple string patterns like 'http://localhost:3006/api'
  content = content.replace(SIMPLE_PATTERN, SIMPLE_REPLACEMENT);
  
  // Fix inline fetch URLs with template literals/strings (more complex patterns)
  // Pattern: fetch(`http://localhost:3006/api/some/path`
  content = content.replace(
    /fetch\(`http:\/\/localhost:\d+\/api\//g, 
    "fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/"
  );
  content = content.replace(
    /fetch\('http:\/\/localhost:\d+\/api\//g, 
    "fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/"
  );

  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    const count = (before.match(/localhost:\d+\/api/g) || []).length;
    totalFixed += count;
    console.log(`✓ Fixed ${count} hardcoded URL(s) in: ${filePath}`);
  } else {
    console.log(`- No change needed: ${filePath}`);
  }
});

console.log(`\nTotal hardcoded URLs fixed: ${totalFixed}`);

// Final check across all src files
const { execSync } = require('child_process');
try {
  const remaining = execSync('git grep -l "localhost:3006\\|localhost:3001" src/', { encoding: 'utf8' }).trim();
  if (remaining) {
    console.log('\n⚠ Files still with localhost references:');
    console.log(remaining);
  } else {
    console.log('\n✅ No more hardcoded localhost URLs found!');
  }
} catch(e) {
  console.log('\n✅ No more hardcoded localhost URLs found!');
}
