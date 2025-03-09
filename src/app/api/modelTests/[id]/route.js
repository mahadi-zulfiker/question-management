import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb'; // Adjust path
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const db = await connectMongoDB();
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid model test ID' }, { status: 400 });
    }

    const modelTest = await db.collection('modelTests').findOne({ _id: new ObjectId(id) });
    if (!modelTest) {
      return NextResponse.json({ error: 'Model test not found' }, { status: 404 });
    }

    // Fetch full question details
    const questionIds = {
      mcq: modelTest.questions.filter(q => q.type === 'mcq').map(q => new ObjectId(q.id)),
      cq: modelTest.questions.filter(q => q.type === 'cq').map(q => new ObjectId(q.id)),
      sq: modelTest.questions.filter(q => q.type === 'sq').map(q => new ObjectId(q.id)),
    };

    const mcqs = await db.collection('mcqs').find({ _id: { $in: questionIds.mcq } }).toArray();
    const cqs = await db.collection('cqs').find({ _id: { $in: questionIds.cq } }).toArray();
    const sqs = await db.collection('SQ').find({ _id: { $in: questionIds.sq } }).toArray();

    return NextResponse.json({
      ...modelTest,
      questions: { mcqs, cqs, sqs }
    });
  } catch (error) {
    console.error('Error in GET /api/modelTests/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}