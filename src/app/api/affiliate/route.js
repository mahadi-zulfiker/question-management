import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import crypto from 'crypto';
import { getServerSession } from 'next-auth/next';

// Middleware to check user role and extract email using getServerSession
const checkRole = async (req) => {
  const url = new URL(req.url);
  const userTypeQuery = url.searchParams.get('userType'); // Check if request is from admin or teacher

  if (userTypeQuery === 'admin') {
    // Skip authentication for admin
    console.log('Admin access granted, skipping authentication');
    return { authorized: true, email: 'admin@default.com', role: 'admin' }; // Default email for admin
  }

  // For teacher, enforce authentication and verify userType from database
  const session = await getServerSession(req); // Use default configuration
  if (!session || !session.user || !session.user.email) {
    console.log('Session invalid or no user email:', session);
    return { authorized: false, email: null, role: null };
  }

  const { email } = session.user;
  const db = await connectMongoDB();
  const user = await db.collection('users').findOne({ email });

  if (!user || user.userType !== 'Teacher') {
    console.log('User not found or not a Teacher:', user);
    return { authorized: false, email: null, role: null };
  }

  console.log('Teacher authenticated:', { email, userType: user.userType });
  return { authorized: true, email: user.email, role: 'teacher' };
};

export async function POST(req) {
  try {
    const { authorized, email } = await checkRole(req);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized: Only admins and teachers can generate affiliate codes' }, { status: 403 });
    }

    const { discountPercentage, expiryDate } = await req.json();

    if (!discountPercentage || discountPercentage < 0 || discountPercentage > 100) {
      return NextResponse.json({ error: 'Valid discount percentage (0-100) is required' }, { status: 400 });
    }
    if (!expiryDate || new Date(expiryDate) <= new Date()) {
      return NextResponse.json({ error: 'Valid future expiry date is required' }, { status: 400 });
    }

    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const db = await connectMongoDB();
    const collection = db.collection('affiliateCodes');

    const exists = await collection.findOne({ code });
    if (exists) {
      return NextResponse.json({ error: 'Code generation conflict, please try again' }, { status: 500 });
    }

    await collection.insertOne({
      code,
      discountPercentage,
      expiryDate: new Date(expiryDate),
      createdAt: new Date(),
      createdBy: email, // Use email from session for teachers; default for admin
      usedBy: [],
    });

    return NextResponse.json({ message: 'Affiliate code generated successfully', code });
  } catch (error) {
    console.error('Error generating affiliate code:', error);
    return NextResponse.json({ error: 'Server error while generating code' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { authorized, email, role } = await checkRole(req);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized: Only admins and teachers can view affiliate codes' }, { status: 403 });
    }

    const db = await connectMongoDB();
    const collection = db.collection('affiliateCodes');

    let codes;
    if (role === 'teacher') {
      // Teachers can only see codes they created
      console.log(`Fetching codes for teacher with email: ${email}`);
      codes = await collection.find({ createdBy: email }).toArray();
    } else {
      // Admins can see all codes
      console.log('Fetching all codes for admin');
      codes = await collection.find({}).toArray();
    }

    return NextResponse.json(codes);
  } catch (error) {
    console.error('Error fetching affiliate codes:', error);
    return NextResponse.json({ error: 'Server error while fetching codes' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { authorized } = await checkRole(req);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized: Only admins and teachers can update affiliate codes' }, { status: 403 });
    }

    const { code, email } = await req.json();

    if (!code || !email) {
      return NextResponse.json({ error: 'Code and email are required' }, { status: 400 });
    }

    const db = await connectMongoDB();
    const collection = db.collection('affiliateCodes');
    const affiliateCode = await collection.findOne({ code });

    if (!affiliateCode) {
      return NextResponse.json({ error: 'Affiliate code not found' }, { status: 404 });
    }

    if (new Date(affiliateCode.expiryDate) < new Date()) {
      return NextResponse.json({ error: 'Affiliate code has expired' }, { status: 400 });
    }

    if (affiliateCode.usedBy.includes(email)) {
      return NextResponse.json({ error: 'Email already used this code' }, { status: 400 });
    }

    await collection.updateOne(
      { code },
      { $push: { usedBy: email } }
    );

    return NextResponse.json({ message: 'Code applied successfully', discountPercentage: affiliateCode.discountPercentage });
  } catch (error) {
    console.error('Error applying affiliate code:', error);
    return NextResponse.json({ error: 'Server error while applying code' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};