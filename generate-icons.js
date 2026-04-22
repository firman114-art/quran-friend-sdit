/**
 * Script untuk generate icon PNG dari SVG
 * Run: node generate-icons.js
 * 
 * Butuh: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Cek apakah sharp sudah install
try {
  const sharp = require('sharp');
  
  const svgBuffer = fs.readFileSync(path.join(__dirname, 'public', 'icon-aisha-simple.svg'));
  
  // Generate 192x192
  sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, 'public', 'icon-192x192.png'))
    .then(() => console.log('✅ Generated: icon-192x192.png'))
    .catch(err => console.error('❌ Error 192x192:', err));
  
  // Generate 512x512
  sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, 'public', 'icon-512x512.png'))
    .then(() => console.log('✅ Generated: icon-512x512.png'))
    .catch(err => console.error('❌ Error 512x512:', err));
    
} catch (e) {
  console.log('⚠️  Sharp belum terinstall');
  console.log('📦 Install dulu: npm install sharp --save-dev');
  console.log('');
  console.log('🌐 Alternatif: Gunakan online converter:');
  console.log('   https://convertio.co/svg-png/');
  console.log('   Upload: public/icon-aisha-simple.svg');
  console.log('   Download 192x192 dan 512x512');
}
