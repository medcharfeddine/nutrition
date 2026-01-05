import connectDB from '../lib/db';
import User from '../models/User';
import Content from '../models/Content';

async function seedDatabase() {
  try {
    await connectDB();

    // Clear existing data (optional)
    await User.deleteMany({});
    await Content.deleteMany({});

    // Create test users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'user@example.com',
        password: 'password123',
        role: 'user',
        profile: {
          age: 30,
          gender: 'male',
          lifestyle: 'moderate',
          dietaryPreferences: ['vegetarian'],
          calorieGoal: 2000,
          proteinGoal: 100,
          carbGoal: 250,
          fatGoal: 65,
        },
      },
      {
        name: 'Admin User',
        email: 'admin@nutrition.com',
        password: 'password123',
        role: 'admin',
      },
    ]);

    console.log('✅ Created users:', users.length);

    // Create sample content
    const contents = await Content.create([
      {
        title: 'Introduction to Nutrition Basics',
        type: 'video',
        description: 'Learn the fundamentals of balanced nutrition and macronutrients.',
        mediaUrl: 'https://example.com/video1.mp4',
        category: 'nutrition-basics',
        tags: ['nutrition', 'basics', 'introduction'],
        content: 'In this video, we cover the basics of nutrition...',
      },
      {
        title: 'Weekly Meal Planning Guide',
        type: 'post',
        description: 'Step-by-step guide to planning your weekly meals for optimal nutrition.',
        mediaUrl: 'https://example.com/guide1.pdf',
        category: 'meal-planning',
        tags: ['meal-planning', 'weekly', 'guide'],
        content: 'Meal planning is essential for maintaining a healthy diet...',
      },
      {
        title: 'Macro Calculator Infographic',
        type: 'infographic',
        description: 'Visual guide to calculating your daily macronutrient requirements.',
        mediaUrl: 'https://example.com/infographic1.png',
        category: 'nutrition-basics',
        tags: ['macros', 'calculator', 'infographic'],
      },
      {
        title: 'Healthy Weight Loss Strategies',
        type: 'post',
        description: 'Proven strategies for sustainable and healthy weight loss.',
        mediaUrl: 'https://example.com/article1.html',
        category: 'weight-management',
        tags: ['weight-loss', 'health', 'tips'],
        content: 'Weight loss requires a combination of diet and exercise...',
      },
      {
        title: 'Top 10 Healthy Snacks',
        type: 'infographic',
        description: 'Discover the best nutritious snacks to keep you energized.',
        mediaUrl: 'https://example.com/snacks.png',
        category: 'healthy-eating',
        tags: ['snacks', 'healthy', 'quick-tips'],
      },
      {
        title: 'Nutrition and Fitness Integration',
        type: 'video',
        description: 'How to combine nutrition and exercise for maximum results.',
        mediaUrl: 'https://example.com/video2.mp4',
        category: 'fitness',
        tags: ['fitness', 'nutrition', 'exercise'],
        content: 'Proper nutrition is crucial for fitness success...',
      },
    ]);

    console.log('✅ Created content:', contents.length);
    console.log('✅ Database seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
