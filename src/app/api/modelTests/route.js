import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb'; // Adjust path
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const db = await connectMongoDB();
    
    const modelTests = await db.collection('modelTests')
      .find({ status: 'active' })
      .toArray();

    return NextResponse.json(modelTests);
  } catch (error) {
    console.error('Error in GET /api/modelTests:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = await connectMongoDB();
    const body = await request.json();
    const { testId, answers } = body;

    if (!testId || !answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Test ID and answers are required' }, { status: 400 });
    }

    const submissionData = {
      testId: new ObjectId(testId),
      answers,
      submittedAt: new Date(),
      // Add userId if authenticated: userId: new ObjectId(userId)
    };

    await db.collection('ModelTestSubmissions').insertOne(submissionData);
    return NextResponse.json({ message: '✅ Model Test submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/modelTests:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}