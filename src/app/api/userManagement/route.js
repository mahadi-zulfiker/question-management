import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';

export async function GET(request) {
  console.log('GET /api/userManagement called');
  try {
    const db = await connectMongoDB();
    const collection = db.collection('users');
    const users = await collection.find({}).toArray();
    
    const sanitizedUsers = users.map(user => ({
      _id: user._id.toString(), // Include _id for unique keys
      username: user.username,
      email: user.email,
      userType: user.userType,
      updatedAt: user.updatedAt || new Date().toISOString()
    }));

    return NextResponse.json(sanitizedUsers, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error('GET Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  console.log('DELETE /api/userManagement called');
  try {
    const { _id } = await request.json();

    if (!_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const db = await connectMongoDB();
    const collection = db.collection('users');
    const result = await collection.deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('DELETE Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  console.log('PUT /api/userManagement called');
  try {
    const { _id, username, email, userType } = await request.json();

    if (!_id || !username || !email || !userType) {
      return NextResponse.json(
        { error: 'User ID, username, email, and userType are required' },
        { status: 400 }
      );
    }

    const db = await connectMongoDB();
    const collection = db.collection('users');
    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: { username, email, userType, updatedAt: new Date().toISOString() } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'User not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('PUT Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};