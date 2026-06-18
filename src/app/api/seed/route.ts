import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/User';

const MOCK_USERS = [
  { _id: '666666666666666666666661', name: 'Alice Smith', email: 'alice@example.com' },
  { _id: '666666666666666666666662', name: 'Bob Johnson', email: 'bob@example.com' },
];

export async function GET() {
  await dbConnect();

  try {
    for (const user of MOCK_USERS) {
      await User.findByIdAndUpdate(user._id, user, { upsert: true, new: true, setDefaultsOnInsert: true });
    }
    return NextResponse.json({ success: true, message: 'Seeded users' });
  } catch (error) {
    console.error('Error seeding users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
