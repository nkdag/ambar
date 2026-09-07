import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const root = path.resolve(process.argv[2] ?? "out");
const failures = [];
const files = [];

async function walk(directory) {
  for (const name of await readdir(directory)) {
    const file = path.join(directory, name);
    const info = await stat(file);
    if (info.isDirectory()) await walk(file);
    else files.push(file);
  }
}

await walk(root);
const relative = (file) => path.relative(root, file).replaceAll(path.sep, "/");
const names = new Set(files.map(relative));
const hasRoute = (name) => names.has(`${name}.html`) || names.has(`${name}/index.html`);

for (const required of ["index.html", "404.html", "robots.txt", "sitemap.xml", "manifest.webmanifest", "og-image.png", "icon.svg", "icon-192.png", "icon-512.png", "apple-touch-icon.png"]) {
  if (!names.has(required)) failures.push(`missing ${required}`);
}
for (const route of ["privacy", "terms"]) {
  if (!hasRoute(route)) failures.push(`missing route /${route}`);
}

const indexHtml = await readFile(path.join(root, "index.html"), "utf8");
for (const marker of [
  'name="description"',
  'property="og:image"',
  'name="twitter:card"',
  'rel="canonical"',
  'rel="manifest"',
]) {
  if (!indexHtml.includes(marker)) failures.push(`index metadata missing ${marker}`);
}
for (const expected of [
  'https://nkdag.github.io/ambar/',
  'https://nkdag.github.io/ambar/og-image.png',
]) {
  if (!indexHtml.includes(expected)) failures.push(`index metadata missing canonical value ${expected}`);
}
const outputBasePath = indexHtml.includes('"/ambar/_next/') ? "/ambar" : "";
if (!indexHtml.includes(`rel="manifest" href="${outputBasePath}/manifest.webmanifest"`)) {
  failures.push(`manifest href does not match output base path ${outputBasePath || "/"}`);
}
for (const route of ["privacy", "terms"]) {
  const routeFile = names.has(`${route}/index.html`) ? `${route}/index.html` : `${route}.html`;
  if (!names.has(routeFile)) continue;
  const routeHtml = await readFile(path.join(root, routeFile), "utf8");
  const canonical = `https://nkdag.github.io/ambar/${route}/`;
  if (!routeHtml.includes(`rel="canonical" href="${canonical}"`)) {
    failures.push(`${routeFile} canonical is not ${canonical}`);
  }
}

for (const [name, width, height, maxBytes] of [
  ["og-image.png", 1200, 630, 200_000],
  ["icon-192.png", 192, 192, 50_000],
  ["icon-512.png", 512, 512, 100_000],
  ["apple-touch-icon.png", 180, 180, 50_000],
]) {
  if (!names.has(name)) continue;
  const image = await readFile(path.join(root, name));
  const dimensions = image.subarray(1, 4).toString() === "PNG" ? [image.readUInt32BE(16), image.readUInt32BE(20)] : [];
  if (dimensions[0] !== width || dimensions[1] !== height) failures.push(`${name} is ${dimensions.join("x") || "not PNG"}; expected ${width}x${height}`);
  if (image.byteLength > maxBytes) failures.push(`${name} is ${image.byteLength} bytes; expected <= ${maxBytes}`);
}

if (names.has("sitemap.xml")) {
  const sitemapXml = await readFile(path.join(root, "sitemap.xml"), "utf8");
  for (const url of [
    "https://nkdag.github.io/ambar/",
    "https://nkdag.github.io/ambar/privacy/",
    "https://nkdag.github.io/ambar/terms/",
  ]) {
    if (!sitemapXml.includes(`<loc>${url}</loc>`)) failures.push(`sitemap.xml missing canonical URL ${url}`);
  }
}

const basePath = "/ambar";
for (const htmlFile of files.filter((file) => file.endsWith(".html"))) {
  const html = await readFile(htmlFile, "utf8");
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const ref of refs) {
    if (/^(?:https?:|mailto:|#|data:|blob:)/.test(ref)) continue;
    const clean = ref.split(/[?#]/)[0];
    const withoutBase = (clean.startsWith(`${basePath}/`) ? clean.slice(basePath.length + 1) : clean.replace(/^\//, "")).replace(/\/$/, "");
    if (!withoutBase) continue;
    const candidates = [withoutBase, `${withoutBase}.html`, `${withoutBase}/index.html`];
    if (!candidates.some((candidate) => names.has(candidate))) {
      failures.push(`${relative(htmlFile)} has broken internal reference ${ref}`);
    }
  }
}

const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk-[A-Za-z0-9_-]{20,}/,
  /\bghp_[A-Za-z0-9]{20,}/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}/,
];
for (const file of files.filter((name) => /\.(?:html|js|json|txt|xml|css)$/.test(name))) {
  const body = await readFile(file, "utf8");
  if (secretPatterns.some((pattern) => pattern.test(body))) failures.push(`${relative(file)} contains a secret-like value`);
}

const indexRefs = [...indexHtml.matchAll(/(?:href|src)="([^"]+)"/g)]
  .map((match) => match[1].split(/[?#]/)[0])
  .filter((ref) => ref.startsWith("/"))
  .map((ref) => ref.startsWith(`${basePath}/`) ? ref.slice(basePath.length + 1) : ref.replace(/^\//, ""));
const firstLoadAssets = new Set(indexRefs.filter((ref) => names.has(ref)));
for (const cssFile of [...firstLoadAssets].filter((file) => file.endsWith(".css"))) {
  const css = await readFile(path.join(root, cssFile), "utf8");
  for (const match of css.matchAll(/url\((?:"|')?([^"')]+)(?:"|')?\)/g)) {
    const ref = match[1].split(/[?#]/)[0];
    if (outputBasePath && ref.startsWith("/") && !ref.startsWith(`${outputBasePath}/`)) {
      failures.push(`CSS asset escapes ${outputBasePath}: ${ref} in ${cssFile}`);
    }
    const withoutBase = ref.startsWith(`${basePath}/`) ? ref.slice(basePath.length + 1) : ref.replace(/^\//, "");
    if (names.has(withoutBase)) firstLoadAssets.add(withoutBase);
  }
}
const firstLoadBytes = (await Promise.all([...firstLoadAssets].map(async (file) => (await stat(path.join(root, file))).size))).reduce((sum, size) => sum + size, 0);
const firstLoadGzipBytes = (await Promise.all([...firstLoadAssets].map(async (file) => gzipSync(await readFile(path.join(root, file))).byteLength))).reduce((sum, size) => sum + size, 0);
if (firstLoadGzipBytes > 500_000) failures.push(`gzip first-load asset payload is ${firstLoadGzipBytes} bytes (> 500 KB)`);

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, files: files.length, checkedHtml: files.filter((file) => file.endsWith(".html")).length, firstLoadAssets: firstLoadAssets.size, firstLoadBytes, firstLoadGzipBytes }, null, 2));
