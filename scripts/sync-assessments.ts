import connectDB from '../lib/db';
import Assessment from '../models/Assessment';
import User from '../models/User';

interface AssessmentSyncResult {
  success: boolean;
  totalAssessments: number;
  assessments: any[];
  timestamp: string;
  duration: number;
  error?: string;
}

async function syncAssessmentData(): Promise<AssessmentSyncResult> {
  const startTime = Date.now();

  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');

    console.log('📥 Syncing all assessment data from database...');
    const assessments = await Assessment.find({})
      .lean()
      .sort({ createdAt: -1 });

    const duration = Date.now() - startTime;

    console.log(`\n✅ Sync completed successfully!`);
    console.log(`📊 Total assessments synced: ${assessments.length}`);
    console.log(`⏱️ Duration: ${duration}ms`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);

    // Summary statistics
    const uniqueUsers = new Set(assessments.map((a: any) => a.userId)).size;
    const recentAssessments = assessments.filter(
      (a: any) => new Date(a.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length;

    console.log(`\n📈 Statistics:`);
    console.log(`  - Total Assessments: ${assessments.length}`);
    console.log(`  - Unique Users: ${uniqueUsers}`);
    console.log(`  - Recent (Last 7 days): ${recentAssessments}`);

    // List all assessments
    console.log(`\n📋 All Assessments:`);
    for (let i = 0; i < assessments.length; i++) {
      const assessment: any = assessments[i];
      const user = await User.findById(assessment.userId).select('name email').lean();
      console.log(
        `${i + 1}. ${assessment.fullName} (${assessment.userEmail}) - Created: ${new Date(assessment.createdAt).toLocaleDateString()}`
      );
      console.log(`   └─ Objective: ${assessment.mainObjective}`);
      console.log(
        `   └─ Health: ${assessment.weight}kg, ${assessment.height}cm, Activity: ${assessment.physicalActivityLevel}`
      );
      if (assessment.chronicDiseases && assessment.chronicDiseases.length > 0) {
        console.log(`   └─ Conditions: ${assessment.chronicDiseases.join(', ')}`);
      }
    }

    return {
      success: true,
      totalAssessments: assessments.length,
      assessments,
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
      totalAssessments: 0,
      assessments: [],
      timestamp: new Date().toISOString(),
      duration,
      error: errorMessage,
    };
  }
}

// Run sync and exit
syncAssessmentData().then(result => {
  process.exit(result.success ? 0 : 1);
});
