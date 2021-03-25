REQUIRES_VERSION_INCREMENT=$(node -e '
const fs = require("fs");
const { execSync } = require("child_process");
const content = JSON.parse(fs.readFileSync("./package.json"));
const { name, version } = content;
console.log(version === execSync(`npm show ${name} version`).toString().trim());
')
echo "$NPM_AUTH_TOKEN"
if [ "$REQUIRES_VERSION_INCREMENT" == "true" ];
then
  echo "Incrementing minor version"
  yarn version --new-version patch
fi

npm publish --access public
