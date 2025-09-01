const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve arquivos estáticos da pasta "Conversor"
app.use(express.static(path.join(__dirname, 'Conversor')));

// Pool de conexões com o MariaDB
const pool = mariadb.createPool({
  host: 'localhost',       // MariaDB está no mesmo EC2
  user: 'meu_usuario',     // substitua pelo seu usuário
  password: 'minha_senha123', // substitua pela sua senha
  database: 'meu_banco',      // substitua pelo seu banco
  connectionLimit: 5
});

// Rota de teste (para verificar se o servidor está online)
app.get('/api/test', (req, res) => {
  res.json({ ok: true, message: 'Servidor Node + MariaDB funcionando 🚀' });
});

// Rota para salvar conversão
app.post('/api/save', async (req, res) => {
  const { from, to, amount, result } = req.body;
  try {
    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO conversions (from_currency, to_currency, amount, result, created_at) VALUES (?, ?, ?, ?, NOW())',
      [from, to, amount, result]
    );
    conn.release();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Rota para listar as últimas 20 conversões
app.get('/api/list', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM conversions ORDER BY created_at DESC LIMIT 20');
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inicia o servidor na porta 3000
app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));
