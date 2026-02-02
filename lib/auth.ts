import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email('E-mail invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
});

const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const validatedCredentials = credentialsSchema.safeParse(credentials);

        if (!validatedCredentials.success) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({
          email: validatedCredentials.data.email,
        }).select('+password');

        if (!user) {
          return null;
        }

        const isPasswordCorrect = await user.comparePassword(
          validatedCredentials.data.password
        );

        if (!isPasswordCorrect) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          hasCompletedAssessment: user.hasCompletedAssessment,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.hasCompletedAssessment = user.hasCompletedAssessment;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role as 'user' | 'admin';
        session.user.id = token.id as string;
        session.user.hasCompletedAssessment = token.hasCompletedAssessment as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
