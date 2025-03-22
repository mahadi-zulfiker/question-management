import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb'; // Adjust path as needed
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const db = await connectMongoDB();
    
    const { searchParams } = new URL(request.url); // Fixed syntax here
    const classLevel = searchParams.get('class');
    const subject = searchParams.get('subject');

    const classQuery = {};
    if (classLevel) classQuery.classNumber = parseInt(classLevel);
    if (subject) classQuery.subject = subject;

    const classes = await db.collection('classes')
      .find(classQuery)
      .toArray();

    const classNumbers = [...new Set(classes.map(cls => cls.classNumber))];
    const subjects = [...new Set(classes.map(cls => cls.subject))];

    const mcqs = await db.collection('mcqs')
      .find({ 
        classNumber: { $in: classNumbers }, 
        subject: { $in: subjects }
      })
      .toArray();

    const cqs = await db.collection('cqs')
      .find({ 
        classNumber: { $in: classNumbers }, 
        subject: { $in: subjects }
      })
      .toArray();

    const sqs = await db.collection('SQ')
      .find({ 
        classLevel: { $in: classNumbers }, 
        subjectName: { $in: subjects }
      })
      .toArray();

    return NextResponse.json({
      classes,
      mcqs,
      cqs,
      sqs
    });
  } catch (error) {
    console.error('Error in GET /api/createQuestionBank:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = await connectMongoDB();
    
    const body = await request.json();
    const { name, validity, description, price, selectedQuestions, classId } = body;

    if (!name || !validity || !price || !selectedQuestions?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let classDetails = null;
    if (classId) {
      if (!ObjectId.isValid(classId)) {
        return NextResponse.json({ error: 'Invalid classId format' }, { status: 400 });
      }
      classDetails = await db.collection('classes').findOne({ _id: new ObjectId(classId) });
      if (!classDetails) {
        return NextResponse.json({ error: 'Class not found for the provided classId' }, { status: 404 });
      }
    }

    const questionBank = {
      name,
      validity: new Date(validity),
      description,
      price: parseFloat(price),
      questions: selectedQuestions,
      class: classDetails ? {
        classNumber: classDetails.classNumber,
        level: classDetails.level,
        subject: classDetails.subject,
        chapterNumber: classDetails.chapterNumber,
        chapterName: classDetails.chapterName
      } : null,
      createdAt: new Date(),
      status: 'active'
    };

    const result = await db.collection('questionBanks').insertOne(questionBank);

    console.log('Question Bank created with ID:', result.insertedId); // Debugging

    return NextResponse.json({
      success: true,
      questionBankId: result.insertedId
    });
  } catch (error) {
    console.error('Error in POST /api/createQuestionBank:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}