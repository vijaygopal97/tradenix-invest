import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { apiLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

function getAllowedOrigins() {
  const raw = process.env.CLIENT_URL || 'http://localhost:5173';
  const origins = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const extras = [];
  for (const origin of origins) {
    try {
      const u = new URL(origin);
      const port = u.port ? `:${u.port}` : '';
      if (u.hostname === 'localhost') {
        extras.push(`${u.protocol}//127.0.0.1${port}`);
      } else if (u.hostname === '127.0.0.1') {
        extras.push(`${u.protocol}//localhost${port}`);
      }
    } catch {
      /* ignore invalid URL in CLIENT_URL */
    }
  }
  return [...new Set([...origins, ...extras])];
}

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'Tradenix Venture API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required');
    process.exit(1);
  }
  await connectDB(uri);
  app.listen(PORT, () => {
    console.log(`Tradenix Venture API listening on port ${PORT}`);
  });
}

start();
