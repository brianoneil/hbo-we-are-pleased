const fs = require('fs-extra');
const axios = require('axios');
const FormData = require('form-data');
const archiver = require('archiver');

const uploadEndpoint = 'https://prod.api.wme-microsites.com/api/site-upload';

const tempDir = './tmp';
const distDir = './dist';
const authFile = './.auth';
const metadataFile = './metadata.json';
const siteMetadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));

function getAuthToken(file) {
  try {
    return fs.readFileSync(file, 'utf8').trim();
  } catch (e) {
    console.error('You must set an auth token in a .auth file to upload your site');
    process.exit(0);
  }
}

function validateMetadata(data) {
  let valid = true;
  Object.entries(data).forEach(([k, v]) => {
    if (k === 'version') {
      if (!/^[A-Za-z0-9.-]+$/.test(v)) {
        console.error(`metadata.json version property value must use semantic versioning (1.0.0) : ${k}: "${siteMetadata[k]}" not allowed`);
        valid = false;
      }
    } else {
      if (!/^[a-z0-9-]+$/.test(v)) {
        console.error(`metadata.json property values can only contain lowercase letters, numbers and hyphens: ${k}: "${siteMetadata[k]}" not allowed`);
        valid = false;
      }
    }
  });
  return valid;
}

function createPackageFilename(metadata) {
  const { brand, vendor, engagement, version } = metadata;
  return `./${brand}-${vendor}-${engagement}-${version}.zip`;
}

function createTempDir(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function copyBuildToTemp(src, target, metadataPath) {
  fs.copySync(metadataPath, target + '/metadata.json');
  fs.copySync(src, target);
}

function createPackage(zipPath) {
  const output = fs.createWriteStream(zipPath);
  const archive = archiver( 'zip', {
    zlib: {
      level: 5
    }
  });
  archive.on('error', (err) => {
    console.error('Error packaging ZIP: ', err);
  })
  archive.pipe(output);
  archive.directory(tempDir, false);
  return archive.finalize();
}

const handleSendResponse = (response) => {
  if (response.status === 200) {
    console.info('File was uploaded successfully!');
  }
}

const sendPackage = (file) => {
  console.info(`Posting to microsite service endpoint: ${uploadEndpoint}`);
  const form = new FormData()
  form.append('file', fs.createReadStream(file))
  axios.post(
    uploadEndpoint,
    form,
    {
      headers: Object.assign({ Authorization: `Bearer ${authToken}` }, form.getHeaders()),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    }
  )
    .then(handleSendResponse)
    .catch((err) => {
      if (err.response) {
        console.error('Upload Failed: ', `${err.response.data.error} (${err.response.status}) - ${err.response.data.message}`);
      } else if (err.request) {
        console.error('The upload server could not be reached');
        console.error(err.message)
      } else {
        console.error('Error: ', err.message);
      }
    });
  fs.unlinkSync(file)
}

function sendOnRequest(archivePath, metadata) {
  if (process.argv.indexOf('--send') > -1) {
    console.info('Publishing site files to S3');
    sendPackage(archivePath, metadata);
  } else {
    console.info(`Site package created: ${archivePath}`);
    process.exit;
  }
}

console.info('Checking for auth token');
const authToken = getAuthToken(authFile);
console.info('Validating metadata.json file');
if (!validateMetadata(siteMetadata)) {
  process.exit(0);
}
console.info('metadata.json file is valid');
const zipOutput = createPackageFilename(siteMetadata);
console.info('Create temporary directory');
createTempDir(tempDir);
console.info('Copying build files to temporary directory');
copyBuildToTemp(distDir, tempDir, metadataFile);
console.info('Packaging build files into a zip file');
const package = createPackage(zipOutput);
package.then(() => {
  sendOnRequest(zipOutput);
});





