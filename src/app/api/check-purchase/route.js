import { connectMongoDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const { packageId, questionBankId, email } = await req.json();
    const db = await connectMongoDB();
    const transactionsCollection = db.collection('transactions');

    if ((!packageId && !questionBankId) || !email) {
      return NextResponse.json({ message: "Missing packageId or questionBankId and email" }, { status: 400 });
    }

    const idField = packageId ? 'packageId' : 'questionBankId';
    const id = packageId || questionBankId;

    const existingPurchase = await transactionsCollection.findOne({
      [idField]: new ObjectId(id),
      email,
      status: "Success",
    });

    return NextResponse.json({
      alreadyPurchased: !!existingPurchase,
      transactionId: existingPurchase?._id || null,
    });
  } catch (error) {
    console.error('Error in POST /api/check-purchase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}