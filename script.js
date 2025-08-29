// ----------------- Helpers -----------------
const $ = (q) => document.querySelector(q);
const byId = (id) => document.getElementById(id);

const amountEl = byId('amount');
const fromEl = byId('from');
const toEl = byId('to');
const convertBtn = byId('convert');
const swapBtn = byId('swap');
const themeToggle = byId('theme-toggle');
const spinner = byId('spinner');
const noticeEl = byId('notice');

const frankVal = byId('frankfurter-value');
const frankMeta = byId('frankfurter-meta');
const exchVal  = byId('exchangerate-value');
const exchMeta = byId('exchangerate-meta');
const awesVal  = byId('awesome-value');
const awesMeta = byId('awesome-meta');

const FRK_API = 'https://api.frankfurter.dev/v1';
const XRT_API = 'https://api.exchangerate.host';
const AWS_API = 'https://economia.awesomeapi.com.br';

const DEFAULT_CODES = ['USD','EUR','BRL','GBP','JPY','AUD','CAD','CHF','CNY','ARS','MXN','CLP','COP'];

// fetch com timeout
async function fetchJSON(url, { timeout = 9000 } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

function setNotice(msg) {
  if (!msg) { noticeEl.hidden = true; noticeEl.textContent = ''; return; }
  noticeEl.hidden = false;
  noticeEl.textContent = msg;
}

function formatCurrency(v, code) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(v);
  } catch {
    return `${(Number(v) || 0).toFixed(4)} ${code}`;
  }
}

function startLoading(on) {
  convertBtn.classList.toggle('loading', on);
  convertBtn.disabled = on;
}

// ----------------- Carregar moedas (robusto) -----------------
async function loadCurrencies() {
  // 1) Tenta Frankfurter /currencies
  try {
    const data = await fetchJSON(`${FRK_API}/currencies`);
    const codes = Object.keys(data).sort();
    populateSelects(codes, data);
    return;
  } catch (e) {
    // segue adiante
  }

  // 2) Tenta Exchangerate.host (pega chaves de latest)
  try {
    const data = await fetchJSON(`${XRT_API}/latest`);
    const codes = Object.keys(data.rates || {}).concat(data.base || []).filter(Boolean);
    const uniq = Array.from(new Set(codes)).sort();
    const names = Object.fromEntries(uniq.map(c => [c, c]));
    populateSelects(uniq, names);
    return;
  } catch (e) {
    // segue adiante
  }

  // 3) Fallback mínimo
  const names = Object.fromEntries(DEFAULT_CODES.map(c => [c, c]));
  populateSelects(DEFAULT_CODES, names);
  setNotice('Não foi possível buscar a lista completa de moedas. Mostrando uma lista reduzida.');
}

function populateSelects(codes, namesMap) {
  fromEl.innerHTML = '';
  toEl.innerHTML = '';

  for (const code of codes) {
    const label = `${code} — ${namesMap[code] || code}`;
    const o1 = document.createElement('option');
    const o2 = document.createElement('option');
    o1.value = o2.value = code;
    o1.textContent = o2.textContent = label;
    fromEl.appendChild(o1);
    toEl.appendChild(o2);
  }

  // valores padrão amigáveis
  fromEl.value = 'USD';
  toEl.value = 'BRL';

  // listeners
  fromEl.addEventListener('change', handleConvert);
  toEl.addEventListener('change', handleConvert);
  amountEl.addEventListener('input', debounce(handleConvert, 300));
}

// ----------------- Três fontes em paralelo -----------------
async function getFrankfurter(from, to, amount) {
  if (from === to) {
    return { ok: true, value: amount, rate: 1, date: new Date().toISOString().slice(0,10), note: 'mesma moeda' };
  }
  const url = `${FRK_API}/latest?base=${encodeURIComponent(from)}&symbols=${encodeURIComponent(to)}`;
  const data = await fetchJSON(url);
  const rate = data.rates?.[to];
  if (typeof rate !== 'number') throw new Error('sem taxa');
  return { ok: true, value: rate * amount, rate, date: data.date };
}

async function getExchangerateHost(from, to, amount) {
  if (from === to) {
    return { ok: true, value: amount, rate: 1, date: new Date().toISOString().slice(0,10), note: 'mesma moeda' };
  }
  // convert costuma funcionar melhor do que latest para CORS/instabilidades
  const url = `${XRT_API}/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount || 1)}`;
  const data = await fetchJSON(url);
  const rate = data.info?.rate;
  const result = data.result;
  if (typeof rate !== 'number' || typeof result !== 'number') throw new Error('sem taxa');
  return { ok: true, value: result, rate, date: data.date || data.info?.timestamp };
}

async function getAwesomeAPI(from, to, amount) {
  // AwesomeAPI é fortíssima com BRL; fora de BRL pode não existir o par.
  if (from === to) {
    return { ok: true, value: amount, rate: 1, date: new Date().toISOString(), note: 'mesma moeda' };
  }

  const pair = `${from}-${to}`.toUpperCase();
  const url = `${AWS_API}/json/last/${encodeURIComponent(pair)}`;
  const data = await fetchJSON(url);
  const key = `${from}${to}`.toUpperCase();
  const quote = data[key];

  if (!quote || !quote.bid) {
    // se não suportar, informa claramente
    return { ok: false, unsupported: true, message: 'Par não suportado nesta API' };
  }
  const rate = parseFloat(quote.bid);
  if (Number.isNaN(rate)) throw new Error('taxa inválida');
  return { ok: true, value: rate * amount, rate, date: quote.create_date };
}

// ----------------- UI e interação -----------------
async function handleConvert() {
  const amount = Math.max(0, parseFloat(String(amountEl.value).replace(',', '.')) || 0);
  const from = fromEl.value;
  const to = toEl.value;

  setNotice('');
  startLoading(true);

  // limpa melhor destaque
  $('.result-card.best')?.classList.remove('best');

  try {
    // dispara em paralelo com timeouts
    const [frk, xrt, aws] = await Promise.allSettled([
      getFrankfurter(from, to, amount),
      getExchangerateHost(from, to, amount),
      getAwesomeAPI(from, to, amount)
    ]);

    renderResult('frankfurter', frk);
    renderResult('exchangerate', xrt);
    renderResult('awesome', aws);

    // destaca melhor valor (maior valor convertido para a moeda de destino)
    const values = [
      { id: 'frankfurter', v: extractVal(frk) },
      { id: 'exchangerate', v: extractVal(xrt) },
      { id: 'awesome', v: extractVal(aws) }
    ].filter(x => typeof x.v === 'number' && !Number.isNaN(x.v));

    if (values.length >= 2) {
      // você pode preferir "menor" se quiser compra/venda – aqui destaco MAIOR
      const best = values.reduce((a,b)=> b.v > a.v ? b : a);
      document.querySelector(`[id="${best.id}-value"]`)?.closest('.result-card')?.classList.add('best');
    }

  } catch (e) {
    setNotice('Erro durante a conversão. Verifique sua conexão e tente novamente.');
  } finally {
    startLoading(false);
  }
}

function extractVal(settled) {
  if (settled.status !== 'fulfilled') return NaN;
  const r = settled.value;
  return r && r.ok ? r.value : NaN;
}

function renderResult(prefix, settled) {
  const vEl = byId(`${prefix}-value`);
  const mEl = byId(`${prefix}-meta`);

  if (settled.status !== 'fulfilled') {
    vEl.textContent = 'Erro';
    mEl.textContent = 'Falha na requisição';
    return;
  }

  const r = settled.value;
  const to = toEl.value;

  if (r.unsupported) {
    vEl.textContent = '—';
    mEl.textContent = r.message || 'Par não suportado';
    return;
  }

  if (!r.ok) {
    vEl.textContent = '—';
    mEl.textContent = 'Indisponível';
    return;
  }

  vEl.textContent = formatCurrency(r.value, to);
  const rateStr = isFinite(r.rate) ? r.rate.toFixed(6) : '—';
  const dateStr = r.date ? formatDateLo(r.date) : '';
  mEl.textContent = `Taxa: ${rateStr} • ${dateStr}`;
}

function formatDateLo(dateLike) {
  // aceita 'YYYY-MM-DD' ou datetime
  const d = new Date(String(dateLike).length <= 10 ? `${dateLike}T00:00:00` : dateLike);
  if (isNaN(+d)) return '';
  return d.toLocaleString('pt-BR', { dateStyle:'short', timeStyle: 'short' });
}

// swap moedas
swapBtn.addEventListener('click', () => {
  swapBtn.classList.add('spin');
  const a = fromEl.value; fromEl.value = toEl.value; toEl.value = a;
  setTimeout(()=> swapBtn.classList.remove('spin'), 250);
  handleConvert();
});

// tema
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  themeToggle.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
});

// debounce simples
function debounce(fn, ms){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args),ms); }; }

// ----------------- init -----------------
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadCurrencies();
  } catch {
    setNotice('Falha ao carregar lista de moedas.');
  }
  await handleConvert();
});
