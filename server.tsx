// FIX: Changed CommonJS `require` imports to ES module `import` syntax.
import express from 'express';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import { fileURLToPath } from 'url';

// FIX: Define __dirname in ES module scope, as it's not available by default.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Security and performance
app.use(helmet());
app.use(compression());

// Serve static files
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: false
}));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚗 AI Mechanic server running on port ${port}`);
});
