import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { DocumentModel } from '@/models/Document';
import { User } from '@/models/User';
import mongoose from 'mongoose';

function getUserId(req: NextRequest) {
  return req.headers.get('x-mock-user-id');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const userId = getUserId(req);
  const { id } = await params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const doc = await DocumentModel.findById(id);
    
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Only owner can share
    if (doc.ownerId?.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find the user to share with (case-insensitive)
    const userToShareWith = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
    
    if (!userToShareWith) {
      return NextResponse.json({ error: `User with email ${email} not found. Please try 'bob@example.com' or 'alice@example.com'.` }, { status: 404 });
    }

    if (userToShareWith._id.toString() === userId) {
      return NextResponse.json({ error: 'Cannot share with yourself' }, { status: 400 });
    }

    if (doc.sharedWithIds.includes(userToShareWith._id)) {
      return NextResponse.json({ error: 'Already shared with this user' }, { status: 400 });
    }

    doc.sharedWithIds.push(userToShareWith._id);
    await doc.save();

    return NextResponse.json({ success: true, message: 'Document shared successfully' });
  } catch (error) {
    console.error('Error sharing doc:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
