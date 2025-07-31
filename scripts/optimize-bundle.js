#!/usr/bin/env node

/**
 * Bundle optimization script for YC Demo
 * Analyzes and compresses the final bundle
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '../dist');

console.log('🔍 Analyzing bundle size...');

function getDirectorySize(dirPath) {
  let totalSize = 0;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += fs.statSync(filePath).size;
    }
  }
  
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeFiles(dirPath, prefix = '') {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      console.log(`📁 ${prefix}${file.name}/`);
      analyzeFiles(filePath, prefix + '  ');
    } else {
      const size = fs.statSync(filePath).size;
      const sizeStr = formatBytes(size);
      
      if (size > 100 * 1024) { // Files > 100KB
        console.log(`📄 ${prefix}${file.name} - ${sizeStr} ⚠️ LARGE`);
      } else if (size > 10 * 1024) { // Files > 10KB
        console.log(`📄 ${prefix}${file.name} - ${sizeStr}`);
      } else {
        console.log(`📄 ${prefix}${file.name} - ${sizeStr} ✅ small`);
      }
    }
  }
}

if (fs.existsSync(distDir)) {
  const totalSize = getDirectorySize(distDir);
  console.log(`📊 Total bundle size: ${formatBytes(totalSize)}`);
  console.log(`\n📋 File breakdown:`);
  analyzeFiles(distDir);
  
  // Recommendations
  console.log(`\n💡 Optimization recommendations:`);
  if (totalSize > 30 * 1024 * 1024) {
    console.log(`⚠️  Bundle is ${formatBytes(totalSize)} - consider more aggressive compression`);
  } else if (totalSize > 20 * 1024 * 1024) {
    console.log(`🟡 Bundle is ${formatBytes(totalSize)} - good but could be smaller`);
  } else {
    console.log(`✅ Bundle size ${formatBytes(totalSize)} is excellent for YC demo!`);
  }
} else {
  console.log('❌ No dist directory found. Run npm run build first.');
}