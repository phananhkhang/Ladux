const fs = require('fs');
const scan = JSON.parse(fs.readFileSync('.ua/intermediate/scan-result.json', 'utf8').replace(/^\uFEFF/, ''));
const sourceFilePaths = scan.files.filter(f => f.fileCategory === 'code').map(f => f.path);
const input = {
  projectRoot: 'C:\\Users\\ADMIN\\OneDrive\\Desktop\\Ladux\\backend',
  sourceFilePaths,
  gitCommitHash: 'f67a53e86f6dfc92fc1537f30627b0ab450132fa'
};
fs.writeFileSync('.ua/intermediate/fingerprint-input.json', JSON.stringify(input, null, 2));
console.log(sourceFilePaths.length);