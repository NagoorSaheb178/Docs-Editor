import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { DocumentModel } from '@/models/Document';
import { User } from '@/models/User'; // Import User to register the schema for populate
import mongoose from 'mongoose';

function getUserId(req: NextRequest) {
  return req.headers.get('x-mock-user-id');
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  // Prevent Turbopack from tree-shaking the User import
  if (!User) console.log('User model loaded');

  const userId = getUserId(req);
  const { id } = await params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const doc = await DocumentModel.findById(id).populate('ownerId', 'name email').populate('sharedWithIds', 'name email');
    
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const isOwner = doc.ownerId && doc.ownerId._id.toString() === userId;
    const isShared = doc.sharedWithIds && doc.sharedWithIds.some((user: any) => user._id.toString() === userId);

    // Check access
    if (!isOwner && !isShared) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error('Error fetching doc:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const userId = getUserId(req);
  const { id } = await params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const doc = await DocumentModel.findById(id);
    
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check access
    if (doc.ownerId?.toString() !== userId && !doc.sharedWithIds.includes(new mongoose.Types.ObjectId(userId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    if (body.title !== undefined) doc.title = body.title;
    if (body.content !== undefined) doc.content = body.content;
    
    await doc.save();

    return NextResponse.json(doc);
  } catch (error) {
    console.error('Error updating doc:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const userId = getUserId(req);
  const { id } = await params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const doc = await DocumentModel.findById(id);
    
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Only owner can delete
    if (doc.ownerId?.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await doc.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting doc:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
