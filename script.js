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

// ----------------- FUNÇÃO PARA SALVAR CONVERSÃO -----------------
async function saveConversion(from, to, amount, result) {
  try {
    await fetch('http://35.175.202.150:3000/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, amount, result })
    });
    console.log('Conversão salva com sucesso!');
  } catch (err) {
    console.error('Erro ao salvar conversão:', err);
  }
}

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

// ... SEGUEM SUAS FUNÇÕES DE formatCurrency, startLoading, loadCurrencies, populateSelects, getFrankfurter, getExchangerateHost, getAwesomeAPI ...

// ----------------- UI e interação -----------------
async function handleConvert() {
  const amount = Math.max(0, parseFloat(String(amountEl.value).replace(',', '.')) || 0);
  const from = fromEl.value;
  const to = toEl.value;

  setNotice('');
  startLoading(true);

  $('.result-card.best')?.classList.remove('best');

  try {
    const [frk, xrt, aws] = await Promise.allSettled([
      getFrankfurter(from, to, amount),
      getExchangerateHost(from, to, amount),
      getAwesomeAPI(from, to, amount)
    ]);

    renderResult('frankfurter', frk);
    renderResult('exchangerate', xrt);
    renderResult('awesome', aws);

    // destaca melhor valor (maior valor convertido)
    const values = [
      { id: 'frankfurter', v: extractVal(frk) },
      { id: 'exchangerate', v: extractVal(xrt) },
      { id: 'awesome', v: extractVal(aws) }
    ].filter(x => typeof x.v === 'number' && !Number.isNaN(x.v));

    if (values.length >= 2) {
      const best = values.reduce((a,b)=> b.v > a.v ? b : a);
      document.querySelector(`[id="${best.id}-value"]`)?.closest('.result-card')?.classList.add('best');

      // SALVAR NO BANCO a melhor conversão
      saveConversion(from, to, amount, best.v);
    }

  } catch (e) {
    setNotice('Erro durante a conversão. Verifique sua conexão e tente novamente.');
  } finally {
    startLoading(false);
  }
}

// ... SEGUEM SUAS FUNÇÕES extractVal, renderResult, formatDateLo, swapBtn listener, themeToggle listener, debounce ...

// ----------------- init -----------------
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadCurrencies();
  } catch {
    setNotice('Falha ao carregar lista de moedas.');
  }
  await handleConvert();
});
