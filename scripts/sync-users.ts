import connectDB from '../lib/db';
import User from '../models/User';
import Assessment from '../models/Assessment';

interface SyncResult {
  success: boolean;
  totalUsers: number;
  users: any[];
  timestamp: string;
  duration: number;
  error?: string;
}

async function syncUserData(): Promise<SyncResult> {
  const startTime = Date.now();

  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');

    console.log('📥 Syncing all user data from database...');
    const users = await User.find({})
      .select('-password')
      .lean()
      .sort({ createdAt: -1 });

    const duration = Date.now() - startTime;

    console.log(`\n✅ Sync completed successfully!`);
    console.log(`📊 Total users synced: ${users.length}`);
    console.log(`⏱️ Duration: ${duration}ms`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);

    // Summary statistics
    const admins = users.filter((u: any) => u.role === 'admin').length;
    const regularUsers = users.filter((u: any) => u.role === 'user').length;
    const completed = users.filter((u: any) => u.hasCompletedAssessment).length;

    console.log(`\n📈 Statistics:`);
    console.log(`  - Admins: ${admins}`);
    console.log(`  - Regular Users: ${regularUsers}`);
    console.log(`  - Completed Assessment: ${completed}`);
    console.log(`  - Pending Assessment: ${users.length - completed}`);

    // Fetch all assessments
    console.log(`\n📥 Syncing assessment data...`);
    const assessments = await Assessment.find({})
      .lean()
      .sort({ createdAt: -1 });

    console.log(`✅ Total assessments synced: ${assessments.length}`);

    // List all users
    console.log(`\n👥 All Users with Assessments:`);
    users.forEach((user: any, index: number) => {
      const userAssessments = assessments.filter((a: any) => a.userId === user._id.toString());
      console.log(
        `${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} ${
          user.hasCompletedAssessment ? '✅ Assessment Complete' : '⏳ Pending'
        }`
      );
      if (userAssessments.length > 0) {
        userAssessments.forEach((assessment: any, aIndex: number) => {
          console.log(
            `   └─ [${aIndex + 1}] ${assessment.mainObjective} - ${new Date(assessment.createdAt).toLocaleDateString()}`
          );
        });
      }
    });

    return {
      success: true,
      totalUsers: users.length,
      users,
      timestamp: new Date().toISOString(),
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`\n❌ Sync failed: ${errorMessage}`);
    console.error(`⏱️ Duration: ${duration}ms`);

    return {
      success: false,
      totalUsers: 0,
      users: [],
      timestamp: new Date().toISOString(),
      duration,
      error: errorMessage,
    };
  }
}

// Run sync and exit
syncUserData().then(result => {
  process.exit(result.success ? 0 : 1);
});
