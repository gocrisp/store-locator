REQUIRES_VERSION_INCREMENT=$(node -e '
const fs = require("fs");
const { execSync } = require("child_process");
const content = JSON.parse(fs.readFileSync("./package.json"));
const { name, version } = content;
console.log(version === execSync(`npm show ${name} version`).toString().trim());
')
echo $REQUIRES_VERSION_INCREMENT;
if [ "$REQUIRES_VERSION_INCREMENT" == "true" ];
then
  yarn version --new-version minor
fi

#npm publish --access public

