const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create a release package with the built application
async function createReleasePackage() {
  const output = fs.createWriteStream('impact-app-release.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log('✅ Release package created: impact-app-release.zip');
    console.log('📦 Total size: ' + (archive.pointer() / 1024 / 1024).toFixed(2) + ' MB');
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // Add the built application
  archive.directory('dist/', 'dist/');
  
  // Add package.json for dependencies
  archive.file('package.json', { name: 'package.json' });
  
  // Add firebase.json for configuration
  if (fs.existsSync('firebase.json')) {
    archive.file('firebase.json', { name: 'firebase.json' });
  }

  // Add setup instructions
  const setupInstructions = `# IMPACT Course Admin - Quick Setup

## Installation

1. Extract this ZIP file
2. Open terminal/command prompt in the extracted folder
3. Run: npm install
4. Run: npm run preview
5. Open http://localhost:4173 in your browser

## Deployment

To deploy to Firebase:
1. Run: firebase login
2. Run: firebase init hosting
3. Run: firebase deploy

## Support

Email: setup@impact-course.com
Phone: 0151 705 7428
`;

  archive.append(setupInstructions, { name: 'README.txt' });

  await archive.finalize();
}

createReleasePackage().catch(console.error);
