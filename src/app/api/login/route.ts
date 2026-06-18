import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/User';

const MOCK_USERS = [
  { _id: '666666666666666666666661', name: 'Alice Smith', email: 'alice@example.com' },
  { _id: '666666666666666666666662', name: 'Bob Johnson', email: 'bob@example.com' },
];

export async function POST(req: NextRequest) {
  await dbConnect();
  
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Automatically seed the mock user if they try to log in with a valid mock email
    // This prevents 403 Forbidden errors if the DB was wiped or seed route wasn't run
    const mockUser = MOCK_USERS.find(u => u.email === email);
    if (mockUser) {
      await User.findByIdAndUpdate(mockUser._id, mockUser, { upsert: true, setDefaultsOnInsert: true });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found. Ensure you have seeded the database.' }, { status: 404 });
    }

    return NextResponse.json({ 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
