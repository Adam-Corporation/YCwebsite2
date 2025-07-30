#!/usr/bin/env node

/**
 * This script converts video files to base64 strings embedded in JavaScript modules
 * Creating truly embedded videos that are part of the build bundle
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videosDir = path.join(__dirname, '../client/public/Videos');
const outputDir = path.join(__dirname, '../client/src/embedded-videos');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all video files
const videoFiles = fs.readdirSync(videosDir).filter(file => 
  file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.mov')
);

console.log(`🎬 Embedding ${videoFiles.length} videos as base64 in JavaScript...`);

videoFiles.forEach((filename, index) => {
  const videoPath = path.join(videosDir, filename);
  const outputPath = path.join(outputDir, `${filename.replace(/\.[^.]+$/, '')}.ts`);
  
  console.log(`📹 Processing: ${filename}`);
  
  // Read video file as base64
  const videoBuffer = fs.readFileSync(videoPath);
  const base64Video = videoBuffer.toString('base64');
  const mimeType = filename.endsWith('.mp4') ? 'video/mp4' : 
                   filename.endsWith('.webm') ? 'video/webm' : 'video/quicktime';
  
  // Create data URL
  const dataUrl = `data:${mimeType};base64,${base64Video}`;
  
  // Create TypeScript module
  const moduleContent = `// Auto-generated embedded video: ${filename}
// File size: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB
export const videoData = "${dataUrl}";
export const originalPath = "/Videos/${filename}";
export const filename = "${filename}";
`;

  fs.writeFileSync(outputPath, moduleContent);
  console.log(`✅ Embedded: ${filename} (${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
});

// Create index file that exports all videos
const indexContent = `// Auto-generated index of all embedded videos
${videoFiles.map((filename, index) => {
  const moduleName = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
  return `import * as video${index + 1} from './${filename.replace(/\.[^.]+$/, '')}';`;
}).join('\n')}

export const EMBEDDED_VIDEOS = [
${videoFiles.map((filename, index) => {
  return `  {
    path: "/Videos/${filename}",
    src: video${index + 1}.videoData,
    filename: video${index + 1}.filename
  }`;
}).join(',\n')}
];

export default EMBEDDED_VIDEOS;
`;

fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent);

console.log(`🎉 All videos embedded! Generated ${videoFiles.length} modules + index`);
console.log(`📁 Output directory: ${outputDir}`);
console.log(`💾 Total embedded size: ${videoFiles.reduce((total, filename) => {
  const videoPath = path.join(videosDir, filename);
  return total + fs.statSync(videoPath).size;
}, 0) / 1024 / 1024} MB`);