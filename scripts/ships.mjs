import {readFile, writeFile, mkdir} from 'node:fs/promises';

const USER = process.env.SHIPS_USER || 'kerimembel';
const OWNERS = (process.env.SHIPS_OWNERS || USER).split(',').map((s) => s.trim().toLowerCase());
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
const ZONE = 'Europe/Istanbul';
const SHIPS = 6;
const DATA = new URL('../data/ships.json', import.meta.url);
const SVG = new URL('../assets/kerim.svg', import.meta.url);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const monthIn = new Intl.DateTimeFormat('en-CA', {timeZone: ZONE, year: 'numeric', month: '2-digit'});
const monthKey = (date) => monthIn.format(date).slice(0, 7);

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {Accept: 'application/vnd.github+json', Authorization: `Bearer ${TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28'},
  });
  if (res.status === 409) return {items: [], next: null};
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  const next = res.headers.get('link')?.match(/<https:\/\/api\.github\.com([^>]+)>; rel="next"/)?.[1] ?? null;
  return {items: await res.json(), next};
}

async function all(path) {
  const out = [];
  for (let next = path; next; ) {
    const page = await api(next);
    out.push(...page.items);
    next = page.next;
  }
  return out;
}

async function pool(items, size, fn) {
  let i = 0;
  await Promise.all(Array.from({length: size}, async () => {
    while (i < items.length) await fn(items[i++]);
  }));
}

export function lastMonths(now = new Date(), count = 12) {
  const [year, month] = monthKey(now).split('-').map(Number);
  return Array.from({length: count}, (_, i) => {
    const d = new Date(Date.UTC(year, month - 1 - (count - 1 - i), 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  });
}

export async function collect(now = new Date()) {
  const keys = lastMonths(now);
  const since = new Date(`${keys[0]}-01T00:00:00+03:00`);
  const repos = (await all('/user/repos?per_page=100&affiliation=owner,collaborator,organization_member'))
    .filter((r) => !r.fork && OWNERS.includes(r.owner.login.toLowerCase()) && new Date(r.pushed_at) >= since);
  const seen = new Set();
  const counts = new Map(keys.map((k) => [k, 0]));
  await pool(repos, 6, async (repo) => {
    const commits = await all(`/repos/${repo.full_name}/commits?author=${USER}&since=${since.toISOString()}&per_page=100`);
    for (const c of commits) {
      if (seen.has(c.sha)) continue;
      seen.add(c.sha);
      const key = monthKey(new Date(c.commit.author.date));
      if (counts.has(key)) counts.set(key, counts.get(key) + 1);
    }
  });
  return {repos: repos.length, months: keys.map((key) => ({key, n: counts.get(key)}))};
}

export function summarize(months) {
  const total = months.reduce((a, m) => a + m.n, 0);
  const top = months.reduce((a, m) => (m.n > a.n ? m : a), months[0]);
  return {total, busiest: monthName(top.key)};
}

export function monthName(key, short = false) {
  const [y, m] = key.split('-').map(Number);
  return short ? MONTHS[m - 1] : `${MONTHS[m - 1]} ${y}`;
}

const esc = (s) => s.replace(/[&<>]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'})[c]);

const TOKENS = /('[^']*')|(\/\/.*$)|\b(import|from|export|const|while)\b|([{}()[\],;:=.])/g;

export function paint(line) {
  let out = '';
  let last = 0;
  for (const m of line.matchAll(TOKENS)) {
    out += esc(line.slice(last, m.index));
    const cls = m[1] ? 's' : m[2] ? 'c' : m[3] ? 'k' : 'p';
    out += `<tspan class="${cls}">${esc(m[0])}</tspan>`;
    last = m.index + m[0].length;
  }
  return out + esc(line.slice(last));
}

export function fileLines({total, busiest}) {
  return [
    '// ~/kerim/kerim.ts',
    "import { curiosity, ship } from './life';",
    '',
    'export const kerim = {',
    "  name: 'Kerim Embel',",
    "  based: 'Antalya, TR',",
    "  day: 'tech lead',",
    "  night: 'indie hustler',",
    "  email: 'kerim@rimabel.com',",
    '  ships: [',
    "    'CutieCure', 'CheffEye', 'Pawnce',",
    "    'Pocketframe', 'Salon', 'ViralSlides',",
    '  ],',
    '  rules: [',
    "    'Ship it, then make it pretty.',",
    "    'Small tools, real users.',",
    "    'Curiosity is the roadmap.',",
    '  ],',
    `  // ${total.toLocaleString('en-US')} commits in the last 12 months`,
    '};',
    `// busiest month: ${busiest.toLowerCase()}`,
    'while (curiosity) ship(kerim.next());',
  ];
}

export function render({repos, months}) {
  const {total, busiest} = summarize(months);
  const W = 880;
  const FS = 13;
  const CW = FS * 0.6;
  const LH = 18.5;
  const TOP = 64;
  const lines = fileLines({total, busiest});
  const H = TOP + lines.length * LH + 52;
  const codeX = 58;
  const loop = lines.length - 1;

  const code = lines.map((line, i) => {
    const y = TOP + i * LH + 13;
    const num = `<text class="n" x="${codeX - 14}" y="${y}" text-anchor="end">${i + 1}</text>`;
    if (!line) return `<g class="ln" style="--i:${i}">${num}</g>`;
    const text = `<text x="${codeX}" y="${y}" textLength="${(line.length * CW).toFixed(1)}" lengthAdjust="spacing">${paint(line)}</text>`;
    if (i !== loop) return `<g class="ln" style="--i:${i}">${num}${text}</g>`;
    const width = line.length * CW;
    return `<g class="ln" style="--i:${i}">${num}${text}<rect class="cover" x="${codeX}" y="${y - 13}" width="${(width + CW).toFixed(1)}" height="${LH}" style="--n:${line.length};--w:${width.toFixed(1)}px"/><rect class="caret" x="${(codeX + width).toFixed(1)}" y="${y - 12}" width="${CW.toFixed(1)}" height="16"/></g>`;
  }).join('\n    ');

  const sideX = 560;
  const sideW = W - 24 - sideX;
  const step = sideW / months.length;
  const barW = Math.round(step * 0.62);
  const chartTop = TOP + 34;
  const chartH = 168;
  const peak = Math.max(...months.map((m) => m.n), 1);
  const bars = months.map((m, i) => {
    const height = Math.max(2, Math.round((m.n / peak) * chartH));
    const x = (sideX + i * step).toFixed(1);
    const cls = m.n === peak ? 'bar top' : i === months.length - 1 ? 'bar now' : 'bar';
    return `<rect class="${cls}" style="--i:${i}" x="${x}" y="${chartTop + chartH - height}" width="${barW}" height="${height}"/>` +
      `<text class="n" x="${(sideX + i * step + barW / 2).toFixed(1)}" y="${chartTop + chartH + 18}" text-anchor="middle">${monthName(m.key, true)[0]}</text>`;
  }).join('\n  ');
  const statY = chartTop + chartH + 112;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t d">
  <title id="t">kerim.ts, open in a terminal editor</title>
  <desc id="d">Kerim Embel, tech lead by day and indie hustler by night, based in Antalya. ${total} commits in the last 12 months across ${repos} repositories, busiest in ${busiest}.</desc>
  <style>
    text{font:${FS}px 'JetBrains Mono','SF Mono',ui-monospace,Menlo,Consolas,monospace;fill:#cfc9bd;white-space:pre}
    .n{fill:#6f6a60}.k{fill:#e7e3da}.s{fill:#d6ad7a}.c{fill:#a09a8d}.p{fill:#8f897d}.u{fill:#e7e3da}.a{fill:#eaa06b}.m{fill:#a09a8d}
    .ln{opacity:0;animation:show 0s calc(.9s + var(--i) * 35ms) forwards}
    .shell{animation:type .7s steps(13) .25s both}
    .cover{fill:#0a0a0a;animation:type 1.6s steps(var(--n)) 2.1s both}
    .caret{fill:#eaa06b;animation:blink 1.1s steps(1) 3.7s infinite;opacity:0}
    .bar{fill:#c98d60;transform-box:fill-box;transform-origin:bottom;animation:grow .9s cubic-bezier(.2,.8,.2,1) calc(1.3s + var(--i) * 45ms) both}
    .bar.top{fill:#f3b884}.bar.now{fill:#a37a5a}
    .big{font:400 76px 'Instrument Serif','Iowan Old Style',Georgia,serif;fill:#eaa06b}
    .fade{animation:fade .8s 2s both}
    @keyframes show{to{opacity:1}}
    @keyframes type{from{transform:translateX(0)}to{transform:translateX(var(--w))}}
    @keyframes grow{from{transform:scaleY(0)}}
    @keyframes fade{from{opacity:0}}
    @keyframes blink{0%{opacity:1}50%{opacity:0}}
    @media (prefers-reduced-motion:reduce){*{animation:none!important}.ln{opacity:1}.cover,.shell{display:none}.caret{opacity:1}}
  </style>
  <rect width="${W}" height="${H}" rx="10" fill="#0a0a0a"/>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="#302c25"/>
  <text x="24" y="30" textLength="${(31 * CW).toFixed(1)}" lengthAdjust="spacing"><tspan class="u">kerim@antalya</tspan> <tspan class="m">~</tspan> <tspan class="a">❯</tspan> <tspan class="u">nvim kerim.ts</tspan></text>
  <rect class="shell" x="${24 + 18 * CW}" y="16" width="${14 * CW}" height="20" fill="#0a0a0a" style="--w:${(13 * CW).toFixed(1)}px"/>
  <path d="M24 44.5H${W - 24}" stroke="#302c25"/>
  <g>
    ${code}
  </g>
  <path d="M${sideX - 24}.5 ${TOP - 6}V${H - 46}" stroke="#302c25"/>
  <text class="fade" style="animation-delay:1.1s" x="${sideX}" y="${TOP + 8}"><tspan class="u">ships.log</tspan> <tspan class="m">commits per month</tspan></text>
  ${bars}
  <g class="fade">
    <text class="big" x="${sideX - 3}" y="${statY}">${total.toLocaleString('en-US')}</text>
    <text class="m" x="${sideX}" y="${statY + 28}">commits in the last 12 months</text>
    <text class="m" x="${sideX}" y="${statY + 50}"><tspan class="u">${SHIPS}</tspan> ships · <tspan class="u">${repos}</tspan> repos · busiest <tspan class="u">${busiest.toLowerCase()}</tspan></text>
  </g>
  <rect y="${H - 34}" width="${W}" height="24" fill="#1c1b18"/>
  <text x="24" y="${H - 17}"><tspan class="a">k/ kerim</tspan>  <tspan class="u">0:kerim.ts*</tspan>  <tspan class="a">1:ships ▶</tspan></text>
  <text class="m" x="${W - 24}" y="${H - 17}" text-anchor="end">ships.log ${monthName(months[0].key).toLowerCase()} → ${monthName(months.at(-1).key).toLowerCase()} · antalya</text>
</svg>
`;
}

async function main() {
  let data;
  if (process.argv.includes('--render')) {
    data = JSON.parse(await readFile(DATA, 'utf8'));
  } else {
    if (!TOKEN) return console.log('No GH_TOKEN, keeping the current ships.log.');
    const me = await api('/user').catch(() => null);
    if (me?.items?.login?.toLowerCase() !== USER.toLowerCase()) return console.log(`Token is not ${USER}'s personal token, keeping the current ships.log.`);
    data = await collect();
    await mkdir(new URL('../data/', import.meta.url), {recursive: true});
    await writeFile(DATA, JSON.stringify(data, null, 2) + '\n');
  }
  await mkdir(new URL('../assets/', import.meta.url), {recursive: true});
  await writeFile(SVG, render(data));
  const {total, busiest} = summarize(data.months);
  console.log(`${data.repos} repos · ${total} commits · busiest ${busiest}`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
