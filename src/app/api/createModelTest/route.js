import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb'; // Adjust path as needed
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const db = await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
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
    console.error('Error in GET /api/createModelTest:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = await connectMongoDB();
    
    const body = await request.json();
    const { name, description, duration, selectedQuestions, classId } = body;

    if (!name || !duration || !selectedQuestions?.length) {
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

    const modelTest = {
      name,
      description,
      duration: parseInt(duration), // Duration in minutes
      questions: selectedQuestions,
      class: classDetails ? {
        classNumber: classDetails.classNumber,
        level: classDetails.level,
        subject: classDetails.subject,
        chapterNumber: classDetails.chapterNumber,
        chapterName: classDetails.chapterName
      } : null,
      createdAt: new Date(),
      status: 'active',
      category: 'modelTest' // For exam-taking purposes
    };

    const result = await db.collection('modelTests').insertOne(modelTest);

    return NextResponse.json({
      success: true,
      modelTestId: result.insertedId
    });
  } catch (error) {
    console.error('Error in POST /api/createModelTest:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}