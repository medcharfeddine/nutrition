import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  syncAllUsers, 
  getAllUsers, 
  getUserStats,
  syncAllAssessments,
  getAllAssessments,
  getAssessmentStats
} from '@/lib/sync-users';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Require admin authentication
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorise. Acces administrateur requis.' },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action') || 'sync';

    if (action === 'sync') {
      // Perform full sync
      const stats = await syncAllUsers();
      return NextResponse.json({
        success: !stats.error,
        action: 'sync',
        stats,
      });
    }

    if (action === 'fetch') {
      // Fetch users with optional filters
      const role = searchParams.get('role') as 'user' | 'admin' | null;
      const completed = searchParams.get('completed');

      const filter: any = {};
      if (role) filter.role = role;
      if (completed !== null) {
        filter.hasCompletedAssessment = completed === 'true';
      }

      const result = await getAllUsers(filter);
      return NextResponse.json({
        action: 'fetch',
        ...result,
      });
    }

    if (action === 'stats') {
      // Get user statistics
      const stats = await getUserStats();
      return NextResponse.json({
        action: 'stats',
        data: stats,
      });
    }

    if (action === 'assessments-sync') {
      // Sync all assessments
      const result = await syncAllAssessments();
      return NextResponse.json({
        action: 'assessments-sync',
        ...result,
      });
    }

    if (action === 'assessments-fetch') {
      // Fetch assessments with optional filters
      const userId = searchParams.get('userId');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      const filter: any = {};
      if (userId) filter.userId = userId;
      if (startDate) filter.startDate = new Date(startDate);
      if (endDate) filter.endDate = new Date(endDate);

      const result = await getAllAssessments(filter);
      return NextResponse.json({
        action: 'assessments-fetch',
        ...result,
      });
    }

    if (action === 'assessments-stats') {
      // Get assessment statistics
      const stats = await getAssessmentStats();
      return NextResponse.json({
        action: 'assessments-stats',
        data: stats,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur interne du serveur',
      },
      { status: 500 }
    );
  }
}
