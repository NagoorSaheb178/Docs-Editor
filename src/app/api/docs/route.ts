import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { DocumentModel } from '@/models/Document';
import mongoose from 'mongoose';

// Mock authentication helper
function getUserId(req: NextRequest) {
  return req.headers.get('x-mock-user-id');
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const userId = getUserId(req);

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ownedDocs = await DocumentModel.find({ ownerId: userId }).sort({ updatedAt: -1 });
    const sharedDocs = await DocumentModel.find({ sharedWithIds: new mongoose.Types.ObjectId(userId) })
      .select('title updatedAt ownerId')
      .populate('ownerId', 'name')
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      owned: ownedDocs,
      shared: sharedDocs,
    });
  } catch (error) {
    console.error('Error fetching docs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const userId = getUserId(req);

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const newDoc = await DocumentModel.create({
      title: body.title || 'Untitled Document',
      content: body.content || '<p></p>',
      ownerId: userId,
      sharedWithIds: [],
    });

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    console.error('Error creating doc:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
