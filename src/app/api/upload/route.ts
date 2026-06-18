import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { DocumentModel } from '@/models/Document';
import mongoose from 'mongoose';
import mammoth from 'mammoth';

import { parseTextToHTML } from '@/utils/parser';

function getUserId(req: NextRequest) {
  return req.headers.get('x-mock-user-id');
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const userId = getUserId(req);

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Allow txt, md, and docx
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md') && !file.name.endsWith('.docx')) {
       return NextResponse.json({ error: 'Only .txt, .md, and .docx files are supported for import.' }, { status: 400 });
    }

    let paragraphs = '';

    if (file.name.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.convertToHtml({ buffer });
      paragraphs = result.value;
    } else {
      const textContent = await file.text();
      paragraphs = parseTextToHTML(textContent);
    }

    const title = file.name.replace(/\.[^/.]+$/, ""); // remove extension

    const newDoc = await DocumentModel.create({
      title: title || 'Imported Document',
      content: paragraphs,
      ownerId: userId,
      sharedWithIds: [],
    });

    return NextResponse.json({ success: true, docId: newDoc._id });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
