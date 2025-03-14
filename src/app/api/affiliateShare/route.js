import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import crypto from 'crypto';
import { getServerSession } from 'next-auth/next';

// Middleware to check user role
const checkRole = async (req) => {
  const session = await getServerSession(req);
  if (!session || !session.user || !session.user.email) {
    return { authorized: false, email: null, role: null };
  }

  const { email } = session.user;
  const db = await connectMongoDB();
  const user = await db.collection('users').findOne({ email });

  if (!user) {
    return { authorized: false, email: null, role: null };
  }

  if (user.userType === 'Admin') {
    return { authorized: true, email: user.email, role: 'admin' };
  }
  if (user.userType === 'Teacher') {
    return { authorized: true, email: user.email, role: 'teacher' };
  }

  return { authorized: false, email: null, role: null };
};

// Generate affiliate code (unchanged)
export async function POST(req) {
  try {
    const { authorized, email, role } = await checkRole(req);
    if (!authorized || role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized: Only teachers can generate affiliate codes' }, { status: 403 });
    }

    const db = await connectMongoDB();
    const collection = db.collection('affiliateShareCodes');

    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const exists = await collection.findOne({ code });
    if (exists) {
      return NextResponse.json({ error: 'Code generation conflict, please try again' }, { status: 500 });
    }

    const discountPercentage = 10;
    const teacherCommission = 5;

    await collection.insertOne({
      code,
      discountPercentage,
      teacherCommission,
      createdAt: new Date(),
      createdBy: email,
      uses: [],
      totalEarnings: 0,
    });

    return NextResponse.json({ 
      message: 'Affiliate share code generated successfully', 
      code,
      discountPercentage,
      teacherCommission 
    });
  } catch (error) {
    console.error('Error generating affiliate share code:', error);
    return NextResponse.json({ error: 'Server error while generating code' }, { status: 500 });
  }
}

// Get affiliate codes (modified for admin access)
export async function GET(req) {
  try {
    const { authorized, email, role } = await checkRole(req);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized: Only teachers and admins can view affiliate codes' }, { status: 403 });
    }

    const db = await connectMongoDB();
    const collection = db.collection('affiliateShareCodes');

    let codes;
    if (role === 'teacher') {
      codes = await collection.find({ createdBy: email }).toArray();
    } else if (role === 'admin') {
      codes = await collection.find({}).toArray();
    }

    return NextResponse.json(codes);
  } catch (error) {
    console.error('Error fetching affiliate share codes:', error);
    return NextResponse.json({ error: 'Server error while fetching codes' }, { status: 500 });
  }
}

// Apply affiliate code (unchanged)
export async function PUT(req) {
  try {
    const { code, userEmail, purchaseAmount } = await req.json();

    if (!code || !userEmail || !purchaseAmount) {
      return NextResponse.json({ error: 'Code, user email, and purchase amount are required' }, { status: 400 });
    }

    const db = await connectMongoDB();
    const collection = db.collection('affiliateShareCodes');
    const affiliateCode = await collection.findOne({ code });

    if (!affiliateCode) {
      return NextResponse.json({ error: 'Affiliate code not found' }, { status: 404 });
    }

    if (affiliateCode.uses.some(use => use.userEmail === userEmail)) {
      return NextResponse.json({ error: 'This user has already used this code' }, { status: 400 });
    }

    const discountAmount = purchaseAmount * (affiliateCode.discountPercentage / 100);
    const commissionAmount = purchaseAmount * (affiliateCode.teacherCommission / 100);

    await collection.updateOne(
      { code },
      { 
        $push: { 
          uses: { 
            userEmail, 
            purchaseAmount, 
            discountAmount, 
            commissionAmount, 
            date: new Date() 
          } 
        },
        $inc: { totalEarnings: commissionAmount }
      }
    );

    return NextResponse.json({ 
      message: 'Affiliate code applied successfully', 
      discountAmount,
      commissionAmount
    });
  } catch (error) {
    console.error('Error applying affiliate share code:', error);
    return NextResponse.json({ error: 'Server error while applying code' }, { status: 500 });
  }
}

// Delete affiliate code (new endpoint for admin)
export async function DELETE(req) {
  try {
    const { authorized, role } = await checkRole(req);
    if (!authorized || role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Only admins can delete affiliate codes' }, { status: 403 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const db = await connectMongoDB();
    const collection = db.collection('affiliateShareCodes');
    const result = await collection.deleteOne({ code });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Affiliate code not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Affiliate code deleted successfully' });
  } catch (error) {
    console.error('Error deleting affiliate share code:', error);
    return NextResponse.json({ error: 'Server error while deleting code' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};