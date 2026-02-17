const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'defects.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const validStatus = ['Open', 'In Progress', 'Resolved', 'Closed'];
const validSeverity = ['Low', 'Medium', 'High', 'Critical'];

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const now = new Date().toISOString();
    const seedData = [
      {
        id: 'DEF-1001',
        title: 'Login form error on empty password',
        description: 'Application returns 500 instead of validation message.',
        status: 'Open',
        severity: 'High',
        assignee: 'QA Team',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'DEF-1002',
        title: 'Dashboard widget alignment issue',
        description: 'Cards overlap on tablet viewport.',
        status: 'In Progress',
        severity: 'Medium',
        assignee: 'Frontend Team',
        createdAt: now,
        updatedAt: now
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedData, null, 2));
  }
}

function loadDefects() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveDefects(defects) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(defects, null, 2));
}

function generateDefectId(defects) {
  const maxId = defects.reduce((max, d) => {
    const n = Number((d.id || '').split('-')[1]);
    return Number.isFinite(n) && n > max ? n : max;
  }, 1000);
  return `DEF-${maxId + 1}`;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json'
  }[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.socket.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
  });
}

function computeDashboard(defects) {
  const summary = {
    total: defects.length,
    open: defects.filter((d) => d.status === 'Open').length,
    inProgress: defects.filter((d) => d.status === 'In Progress').length,
    resolved: defects.filter((d) => d.status === 'Resolved').length,
    closed: defects.filter((d) => d.status === 'Closed').length
  };
  const bySeverity = validSeverity.reduce((acc, severity) => {
    acc[severity] = defects.filter((d) => d.severity === severity).length;
    return acc;
  }, {});
  return { summary, bySeverity };
}

function handleApi(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname;

  if (req.method === 'GET' && pathname === '/api/meta') {
    return sendJson(res, 200, { validStatus, validSeverity });
  }

  if (req.method === 'GET' && pathname === '/api/dashboard') {
    return sendJson(res, 200, computeDashboard(loadDefects()));
  }

  if (req.method === 'GET' && pathname === '/api/defects') {
    let defects = loadDefects();
    const status = parsedUrl.searchParams.get('status');
    const severity = parsedUrl.searchParams.get('severity');
    const q = parsedUrl.searchParams.get('q');

    if (status) defects = defects.filter((d) => d.status === status);
    if (severity) defects = defects.filter((d) => d.severity === severity);
    if (q) {
      const query = q.toLowerCase();
      defects = defects.filter((d) =>
        d.id.toLowerCase().includes(query) ||
        d.title.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query)
      );
    }
    return sendJson(res, 200, defects);
  }

  if (req.method === 'POST' && pathname === '/api/defects') {
    return parseBody(req)
      .then((body) => {
        const defects = loadDefects();
        const { title, description, status = 'Open', severity = 'Medium', assignee = 'Unassigned' } = body;

        if (!title || !description) return sendJson(res, 400, { message: 'title and description are required' });
        if (!validStatus.includes(status)) return sendJson(res, 400, { message: 'invalid status value' });
        if (!validSeverity.includes(severity)) return sendJson(res, 400, { message: 'invalid severity value' });

        const now = new Date().toISOString();
        const newDefect = {
          id: generateDefectId(defects),
          title,
          description,
          status,
          severity,
          assignee,
          createdAt: now,
          updatedAt: now
        };

        defects.push(newDefect);
        saveDefects(defects);
        sendJson(res, 201, newDefect);
      })
      .catch((error) => sendJson(res, 400, { message: error.message }));
  }

  if (req.method === 'PATCH' && pathname.startsWith('/api/defects/')) {
    const id = pathname.split('/').pop();
    return parseBody(req)
      .then((body) => {
        const defects = loadDefects();
        const defect = defects.find((d) => d.id === id);
        if (!defect) return sendJson(res, 404, { message: 'Defect not found' });

        const allowed = ['title', 'description', 'status', 'severity', 'assignee'];
        for (const [k, v] of Object.entries(body)) {
          if (!allowed.includes(k)) return sendJson(res, 400, { message: `Field ${k} cannot be updated` });
          if (k === 'status' && !validStatus.includes(v)) return sendJson(res, 400, { message: 'invalid status value' });
          if (k === 'severity' && !validSeverity.includes(v)) return sendJson(res, 400, { message: 'invalid severity value' });
          defect[k] = v;
        }

        defect.updatedAt = new Date().toISOString();
        saveDefects(defects);
        sendJson(res, 200, defect);
      })
      .catch((error) => sendJson(res, 400, { message: error.message }));
  }

  if (req.method === 'DELETE' && pathname.startsWith('/api/defects/')) {
    const id = pathname.split('/').pop();
    const defects = loadDefects();
    const idx = defects.findIndex((d) => d.id === id);
    if (idx === -1) return sendJson(res, 404, { message: 'Defect not found' });

    const [deleted] = defects.splice(idx, 1);
    saveDefects(defects);
    return sendJson(res, 200, deleted);
  }

  sendJson(res, 404, { message: 'Endpoint not found' });
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);

  if (parsedUrl.pathname.startsWith('/api/')) {
    return handleApi(req, res, parsedUrl);
  }

  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
    return sendFile(res, path.join(PUBLIC_DIR, 'index.html'));
  }

  const safePath = path.normalize(parsedUrl.pathname).replace(/^\/+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  sendFile(res, filePath);
});

server.listen(PORT, () => {
  ensureDataFile();
  console.log(`Test Management Tool running on http://localhost:${PORT}`);
});
