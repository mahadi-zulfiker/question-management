import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb'; // Adjust path
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid question bank ID" }, { status: 400 });
    }

    const db = await connectMongoDB();
    const questionBank = await db.collection('questionBanks').findOne({ 
      _id: new ObjectId(id), 
      status: 'active' 
    });

    if (!questionBank) {
      return NextResponse.json({ message: "Question bank not found" }, { status: 404 });
    }

    return NextResponse.json(questionBank);
  } catch (error) {
    console.error('Error in GET /api/questionBanks/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}