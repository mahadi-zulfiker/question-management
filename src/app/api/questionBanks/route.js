import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb'; // Adjust path as needed

export async function GET(request) {
  try {
    const db = await connectMongoDB();
    
    const questionBanks = await db.collection('questionBanks')
      .find({ status: 'active' })
      .toArray();

    return NextResponse.json(questionBanks);
  } catch (error) {
    console.error('Error in GET /api/questionBanks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}