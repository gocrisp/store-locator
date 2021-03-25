REQUIRES_VERSION_INCREMENT=$(node -e '
const fs = require("fs");
const { execSync } = require("child_process");
const content = JSON.parse(fs.readFileSync("./package.json"));
const { name, version } = content;
console.log(version === execSync(`npm show ${name} version`).toString().trim());
')
if [ "$REQUIRES_VERSION_INCREMENT" == "true" ];
then
  echo "Incrementing minor version"
  yarn version --new-version patch
fi

npm config set '//registry.npmjs.org/:_authToken' "${NPM_TOKEN}"
npm publish --access public
