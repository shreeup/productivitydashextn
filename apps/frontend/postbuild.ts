// ******************* use this  // "postbuild": "npx tsx postbuild.ts", in package.json to activate this

// import fs from 'fs';
// import * as path from 'path';

// const __dirname = path.resolve();
// //const chromeextensionsDir = path.resolve(__dirname, '../chromeextensions');
// const distDir = path.resolve(__dirname, '../chromeextensions/dist'); // Adjust path if needed
// const popupHtmlPath = path.resolve(distDir, 'popup.html');
// const manifestJsonPath = path.resolve(distDir, 'manifest.json');
// const assetsDir = path.join(distDir, 'assets');

// // Read the popup.html file
// let popupHtml = fs.readFileSync(popupHtmlPath, 'utf-8');
// let manifestJson = fs.readFileSync(manifestJsonPath, 'utf-8');
// // Read the assets directory to find the hashed JS and CSS files
// const jsFile = fs
//   .readdirSync(distDir)
//   .find(file => file.startsWith('main') && file.endsWith('.js'));
// const cssFile = fs.readdirSync(assetsDir).find(file => file.endsWith('.css'));
// const backgroundjsFile = fs
//   .readdirSync(distDir)
//   .find(file => file.startsWith('background') && file.endsWith('.js'));

// // Ensure we found the necessary files
// if (jsFile && cssFile) {
//   // Replace the JS and CSS references in popup.html with the hashed filenames
//   const scriptTagRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
//   const linkTagRegex = /<link\b[^>]*\/?>/gi;

//   popupHtml = popupHtml.replace(
//     scriptTagRegex,
//     `<script src="assets/${jsFile}" defer></script>`
//   );
//   popupHtml = popupHtml.replace(
//     linkTagRegex,
//     `<link rel="stylesheet" href="assets/${cssFile}" />`
//   );

//   //popupHtml = popupHtml.replace('assets', `assets/${jsFile}`);
//   //popupHtml = popupHtml.replace('index.css', `assets/${cssFile}`);

//   // Write the updated content back to popup.html
//   //fs.writeFileSync(popupHtmlPath, popupHtml, 'utf-8');

//   const manifestJsonObject = JSON.parse(manifestJson);
//   manifestJsonObject['background']['service_worker'] =
//     `assets/${backgroundjsFile}`;
//   manifestJson = JSON.stringify(manifestJsonObject);
//   //fs.writeFileSync(manifestJsonPath, manifestJson, 'utf-8');

//   console.log(
//     `popup.html && manifest.json has been updated with hashed filenames.`
//   );
// } else {
//   console.error(
//     'Error: Could not find the hashed JS or CSS files in the assets folder.'
//   );
// }
