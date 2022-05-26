/* This is an example build.
 * Use whatever build tools or methods you prefer.
 * The only requirement is that compiled site assets are output to the /public directory before invoking the sitePackage script.
 */
const fs = require('fs-extra');
const { COPYFILE_FICLONE } = fs.constants;

const srcDir = './src';
const distDir = './dist';

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir)
}

fs.copy(srcDir, distDir, (err) => {
  if (err) {
    console.error('Error copying source files: ', err);
  } else {
    console.error('Source files copy success.');
  }
});
