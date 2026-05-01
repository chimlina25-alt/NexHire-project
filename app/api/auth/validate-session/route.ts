import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    console.log('VALIDATE SESSION CALLED');
    console.log('HEADERS:', req.headers.get('cookie'));
    
    const user = await getCurrentUser('auth');
    console.log('USER FOUND:', user);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('VALIDATE SESSION ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}