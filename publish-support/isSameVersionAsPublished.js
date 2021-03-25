const fs = require('fs');
const { execSync } = require("child_process");
const content = JSON.parse(fs.readFileSync('./package.json'));
const { name, version } = content;
console.log(version);
const x = execSync(`npm show ${name} version`).toString().trim();
console.log(version, x, version.length, x.length, version === x);
console.log(version === execSync(`npm show ${name} version`).toString());
