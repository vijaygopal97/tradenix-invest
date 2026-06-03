import 'dotenv/config';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { InterestLog } from './models/InterestLog.js';
import { PlatformBank } from './models/PlatformBank.js';

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tradenix.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'Tradenix Admin';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.log('Admin user created:', adminEmail);
  } else {
    console.log('Admin already exists:', adminEmail);
  }

  const interestCount = await InterestLog.countDocuments();
  if (interestCount === 0) {
    const rate = Number(process.env.DEFAULT_DAILY_INTEREST) || 0.5;
    await InterestLog.create({
      dailyPercent: rate,
      effectiveFrom: new Date(),
      changedBy: admin._id,
      note: 'Initial daily interest rate',
    });
    console.log('Default interest rate set:', rate, '%');
  }

  const bank = await PlatformBank.findOne();
  if (!bank) {
    await PlatformBank.create({
      accountHolderName: 'Tradenix Venture Ltd',
      bankName: 'Example National Bank',
      accountNumber: '0000000000',
      ifscOrSwift: 'EXAMP0001',
      branch: 'Main Branch',
      instructions: 'Use your registered email as payment reference.',
      updatedBy: admin._id,
    });
    console.log('Sample platform bank details created — update in admin panel');
  }

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
