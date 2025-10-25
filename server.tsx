// FIX: Changed imports to `require` syntax to fix type resolution issues with Express middleware.
import express = require('express');
import path = require('path');
import compression = require('compression');
import helmet = require('helmet');

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