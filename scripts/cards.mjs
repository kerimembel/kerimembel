import {readFile, writeFile, mkdir} from 'node:fs/promises';

export const SHIPS = [
  {id: 'cutiecure', name: 'CutieCure', kind: 'AI nail art studio', tagline: 'Try your next nail look.', url: 'https://www.cutiecure.app', colors: {bg: '#14040D', accent: '#D96A9B', glow: '#F9C2D8', ink: '#FBF1EE'}},
  {id: 'cheffeye', name: 'CheffEye', kind: 'AI recipe assistant', tagline: 'Snap a dish. Get the recipe.', url: 'https://cheffeye.com/en/', colors: {bg: '#15060A', accent: '#E63A50', glow: '#FF7A8C', ink: '#F5EFE8'}},
  {id: 'pawnce', name: 'Pawnce', kind: 'Real-world pet collecting', tagline: 'Every cat and dog has a story.', url: 'https://pawnce.app/', colors: {bg: '#160A05', accent: '#FF7A45', glow: '#FFB98A', ink: '#F7F4F2'}},
  {id: 'pocketframe', name: 'Pocketframe', kind: 'Mac app for the DJI Osmo Pocket', tagline: 'The best camera on your desk is in your pocket.', url: '', colors: {bg: '#120707', accent: '#f2462f', glow: '#ff8f74', ink: '#f4f2ee'}},
  {id: 'salon', name: 'CutieCure Salon', kind: 'Booking and salon SaaS', tagline: 'Run the salon. Let clients try the look first.', url: 'https://salon.cutiecure.app', colors: {bg: '#14040C', accent: '#E8BE63', glow: '#F8DE9C', ink: '#F6EEF1'}},
  {id: 'viralslides', name: 'ViralSlides', kind: 'AI marketing engine', tagline: 'Paste your app link. Wake up to slideshows.', url: 'https://www.viralslides.app', colors: {bg: '#07140f', accent: '#2fae7a', glow: '#c6f36a', ink: '#f2f0e8'}},
];

export const REACH = [
  {id: 'mail', mark: '✉', label: 'kerim@rimabel.com', url: 'mailto:kerim@rimabel.com'},
  {id: 'linkedin', mark: 'in', label: 'linkedin', url: 'https://www.linkedin.com/in/kerim-embel/'},
  {id: 'x', mark: '@', label: 'kerimmembel', url: 'https://x.com/kerimmembel'},
];

const MONO = "'JetBrains Mono','SF Mono',ui-monospace,Menlo,Consolas,monospace";
const SERIF = "'Instrument Serif','Iowan Old Style',Georgia,serif";
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);

export function wrap(text, max) {
  const lines = [''];
  for (const word of text.split(' ')) {
    const line = lines.at(-1);
    if (line && (line + ' ' + word).length > max) lines.push(word);
    else lines[lines.length - 1] = line ? `${line} ${word}` : word;
  }
  return lines;
}

export function card(ship, icon) {
  const W = 280;
  const H = 172;
  const {bg, accent, glow, ink} = ship.colors;
  const tagline = wrap(ship.tagline, 27)
    .map((line, i) => `<text x="20" y="${102 + i * 21}" class="tag">${esc(line)}</text>`)
    .join('');
  const arrow = ship.url ? `<text x="${W - 20}" y="${H - 18}" text-anchor="end" class="go">↗</text>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`${ship.name}: ${ship.kind}. ${ship.tagline}`)}">
  <style>
    .name{font-family:${SERIF};font-weight:400;fill:${ink}}
    .tag{font:italic 17px ${SERIF};fill:${glow}}
    .kind{font:11px ${MONO};fill:${ink};fill-opacity:.62;letter-spacing:.4px}
    .go{font:15px ${MONO};fill:${glow}}
  </style>
  <defs>
    <radialGradient id="g" cx="100%" cy="0%" r="120%">
      <stop offset="0" stop-color="${accent}" stop-opacity=".34"/>
      <stop offset=".62" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="i"><rect x="20" y="20" width="48" height="48" rx="11"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" rx="12" fill="${bg}"/>
  <rect width="${W}" height="${H}" rx="12" fill="url(#g)"/>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="11.5" fill="none" stroke="${accent}" stroke-opacity=".38"/>
  <image x="20" y="20" width="48" height="48" clip-path="url(#i)" xlink:href="data:image/png;base64,${icon}"/>
  <text x="82" y="53" class="name" font-size="${Math.min(27, Math.floor(178 / (ship.name.length * 0.5)))}">${esc(ship.name)}</text>
  ${tagline}
  <text x="20" y="${H - 18}" class="kind">${esc(ship.kind.toUpperCase())}</text>
  ${arrow}
</svg>
`;
}

export function chip({mark, label}) {
  const CW = 7.8;
  const W = Math.round((mark.length + 1 + label.length) * CW + 34);
  const H = 34;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
  <style>text{font:13px ${MONO};white-space:pre}</style>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="8" fill="#0a0a0a" stroke="#302c25"/>
  <text x="17" y="22" textLength="${((mark.length + 1 + label.length) * CW).toFixed(1)}" lengthAdjust="spacing"><tspan fill="#eaa06b">${esc(mark)}</tspan> <tspan fill="#e7e3da">${esc(label)}</tspan></text>
</svg>
`;
}

export function markdown() {
  const cards = SHIPS.map((s) => {
    const img = `<img src="assets/ships/${s.id}.svg" width="32%" alt="${esc(`${s.name}: ${s.kind}`)}">`;
    return s.url ? `<a href="${s.url}">${img}</a>` : img;
  });
  const chips = REACH.map((r) => `<a href="${r.url}"><img src="assets/reach/${r.id}.svg" height="34" alt="${esc(r.label)}"></a>`);
  return `<p>\n${cards.slice(0, 3).join('\n')}\n</p>\n<p>\n${cards.slice(3).join('\n')}\n</p>\n\n### reach\n\n<p>\n${chips.join('\n')}\n</p>\n`;
}

async function main() {
  const root = new URL('../', import.meta.url);
  await mkdir(new URL('assets/ships/', root), {recursive: true});
  await mkdir(new URL('assets/reach/', root), {recursive: true});
  for (const ship of SHIPS) {
    const icon = (await readFile(new URL(`assets/icons/${ship.id}.png`, root))).toString('base64');
    await writeFile(new URL(`assets/ships/${ship.id}.svg`, root), card(ship, icon));
  }
  for (const r of REACH) await writeFile(new URL(`assets/reach/${r.id}.svg`, root), chip(r));
  console.log(markdown());
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
