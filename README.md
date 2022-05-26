# wme-microsite-html-template

Template for a static WME microsite. Use this as a starting point or guide for a non-React microsite.

## Requirements

- NodeJS 10+

## Build Script

Feel free to use any tools or processes that you'd like, so long compiled files are stored in ./dist.  `./build/build.js` is provided as a very basic example and can be modified or replaced as needed.

## Core Scripts

- `npm run build` - Will execute the site packaging script and push the site package to the WM microsite service.
- `npm run package` - Will package the current building into a zip file
- `npm run upload` - Will build, package and upload the build artifacts to the WME Microsite service so it can be deployed by site managers

## Authorization token

To upload your site, you must have the proper auth token in place in a `.auth` file in the root of your project. You should receive this token from your brand contact.

```bash
echo "abc-token" > .auth
```

## `metadata.json` file

In the root of the repo should be a `metadata.json` file that is used by the publishing service. It must contain the following 4 properties:

- `brand` - The brand you're engaging with - hbo, hbomax, tbs, tnt, trutv, etc
- `vendor` - The name of your company/agency
- `engagement` - The name of the site/engagement you're working on - GoT Screener, AdventureTime Game, etc
- `version` - This is a semantic version number, and must be incremented each time a new version is published

**Important:** These values must match those provided by your brand contacts (except version).  If a non-existent brand/vendor/engagement or a duplicate version number is published, it will result in an error.
