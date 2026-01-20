const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;
const HOST = '0.0.0.0';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', module: 'webwaka-suite-partner-dashboard' });
});

app.listen(PORT, HOST, () => {
  console.log(`WebWaka Partner Dashboard running at http://${HOST}:${PORT}`);
});
