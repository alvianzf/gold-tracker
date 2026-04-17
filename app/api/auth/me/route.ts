import { NextResponse } from 'next/server';
import { getSessionUser, signToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error('Error fetching current user:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    
    if (!sessionUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (typeof sessionUser.id !== 'string') {
        return NextResponse.json({ error: 'Invalid session structure' }, { status: 400 });
    }

    const { username, oldPassword, newPassword } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Check if the user really exists in DB to verify old password and update
    const dbUser = await prisma.user.findUnique({
      where: { id: sessionUser.id }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in the database.' }, { status: 404 });
    }

    // Checking if they are attempting to change password
    let updatedPassword = dbUser.password;
    if (oldPassword && newPassword) {
      const passwordMatch = await bcrypt.compare(oldPassword, dbUser.password);
      if (!passwordMatch) {
         return NextResponse.json({ error: 'Incorrect old password.' }, { status: 401 });
      }
      updatedPassword = await bcrypt.hash(newPassword, 10);
    } else if (newPassword && !oldPassword) {
      return NextResponse.json({ error: 'Old password is required to set a new password.' }, { status: 400 });
    }

    // Check if the new username is already taken by someone else
    if (username !== dbUser.username) {
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
        }
    }

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        username: username,
        password: updatedPassword
      }
    });

    // We must re-issue the token since `username` might have changed,
    // and the token payload includes `username`.
    const token = await signToken({
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
    });

    const response = NextResponse.json({ 
        success: true, 
        user: { id: updatedUser.id, username: updatedUser.username, role: updatedUser.role } 
    });

    response.cookies.set({
      name: 'session-token',
      value: token,
      httpOnly: true,
      secure: process.env.SESSION_COOKIE_SECURE === 'true' || (process.env.NODE_ENV === 'production' && process.env.SESSION_COOKIE_SECURE !== 'false'),
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;

  } catch (err) {
    console.error('Error updating current user profile:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
