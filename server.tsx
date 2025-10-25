// FIX: Changed CommonJS `require` imports to ES module `import` syntax.
// FIX: Import `Request` and `Response` types from express to avoid type conflicts.
import express, { Request, Response } from 'express';
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
// FIX: Explicitly provide the path to resolve an Express type overload issue.
app.use('/', express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: false
}));

// SPA fallback
// FIX: Explicitly type `req` and `res` to ensure correct type inference.
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚗 AI Mechanic server running on port ${port}`);
});