import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, '../../uploads');

function ensureDir(sub) {
  const dir = path.join(uploadsRoot, sub);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const storage = (subfolder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ensureDir(subfolder)),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${safe}`);
    },
  });

const imageFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image uploads are allowed'));
};

export const uploadRechargeScreenshot = multer({
  storage: storage('recharges'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('screenshot');

export const uploadWithdrawalProof = multer({
  storage: storage('withdrawals'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('paymentProof');

export function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err?.message === 'Only image uploads are allowed') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
}
