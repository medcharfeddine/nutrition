import connectDB from '@/lib/db';
import User from '@/models/User';
import Assessment from '@/models/Assessment';

export interface SyncStats {
  totalUsers: number;
  timestamp: string;
  duration: number;
  error?: string;
}

/**
 * Sync all user data from database
 * Returns comprehensive statistics about synced users
 */
export async function syncAllUsers(): Promise<SyncStats> {
  const startTime = Date.now();
  
  try {
    await connectDB();

    // Fetch all users with all fields except password
    const users = await User.find({})
      .select('-password')
      .lean()
      .sort({ createdAt: -1 });

    const duration = Date.now() - startTime;

    return {
      totalUsers: users.length,
      timestamp: new Date().toISOString(),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      totalUsers: 0,
      timestamp: new Date().toISOString(),
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch all users with optional filtering
 */
export async function getAllUsers(filter?: {
  role?: 'user' | 'admin';
  hasCompletedAssessment?: boolean;
}) {
  try {
    await connectDB();

    let query: any = {};
    if (filter?.role) {
      query.role = filter.role;
    }
    if (filter?.hasCompletedAssessment !== undefined) {
      query.hasCompletedAssessment = filter.hasCompletedAssessment;
    }

    const users = await User.find(query)
      .select('-password')
      .lean()
      .sort({ createdAt: -1 });

    return {
      success: true,
      count: users.length,
      users,
    };
  } catch (error) {
    return {
      success: false,
      count: 0,
      users: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  try {
    await connectDB();

    const totalUsers = await User.countDocuments({});
    const adminCount = await User.countDocuments({ role: 'admin' });
    const userCount = await User.countDocuments({ role: 'user' });
    const completedAssessment = await User.countDocuments({
      hasCompletedAssessment: true,
    });

    return {
      success: true,
      totalUsers,
      admins: adminCount,
      users: userCount,
      completedAssessment,
      pendingAssessment: totalUsers - completedAssessment,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync user data and return cached version
 * Useful for client-side state management
 */
export async function syncUserCache() {
  try {
    const result = await getAllUsers();
    if (result.success) {
      // Return users with normalized data
      return {
        users: result.users.map((user: any) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          hasCompletedAssessment: user.hasCompletedAssessment || false,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        lastSync: new Date().toISOString(),
        count: result.count,
      };
    }
    throw new Error(result.error);
  } catch (error) {
    return {
      users: [],
      lastSync: new Date().toISOString(),
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch all assessments from all users
 */
export async function getAllAssessments(filter?: {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    await connectDB();

    let query: any = {};
    if (filter?.userId) {
      query.userId = filter.userId;
    }
    if (filter?.startDate || filter?.endDate) {
      query.createdAt = {};
      if (filter.startDate) {
        query.createdAt.$gte = filter.startDate;
      }
      if (filter.endDate) {
        query.createdAt.$lte = filter.endDate;
      }
    }

    const assessments = await Assessment.find(query)
      .lean()
      .sort({ createdAt: -1 });

    return {
      success: true,
      count: assessments.length,
      assessments,
    };
  } catch (error) {
    return {
      success: false,
      count: 0,
      assessments: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync all assessments with user details
 */
export async function syncAllAssessments() {
  const startTime = Date.now();

  try {
    await connectDB();

    const assessments = await Assessment.find({})
      .lean()
      .sort({ createdAt: -1 });

    const duration = Date.now() - startTime;

    // Enrich with user data if needed
    const enrichedAssessments = await Promise.all(
      assessments.map(async (assessment: any) => {
        const user = await User.findById(assessment.userId).select('-password').lean();
        return {
          ...assessment,
          userData: {
            id: user?._id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
          },
        };
      })
    );

    return {
      success: true,
      totalAssessments: assessments.length,
      assessments: enrichedAssessments,
      timestamp: new Date().toISOString(),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      totalAssessments: 0,
      assessments: [],
      timestamp: new Date().toISOString(),
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get assessment statistics
 */
export async function getAssessmentStats() {
  try {
    await connectDB();

    const totalAssessments = await Assessment.countDocuments({});
    const usersWithAssessment = await Assessment.distinct('userId');
    const recentAssessments = await Assessment.countDocuments({
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    });

    return {
      success: true,
      totalAssessments,
      usersWithAssessment: usersWithAssessment.length,
      recentAssessments,
      percentage: Math.round((usersWithAssessment.length / (await User.countDocuments({}))) * 100),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
