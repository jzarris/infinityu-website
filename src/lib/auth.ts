import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: string;
      totpEnabled: boolean;
    };
  }
  interface User {
    role?: string;
    totpEnabled?: boolean;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    totpEnabled?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'admin-login',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totpCode: { label: '2FA Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || user.role !== 'admin' || !user.isActive || !user.password) return null;

        const isValidPassword = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValidPassword) return null;

        if (user.totpEnabled && user.totpSecret) {
          if (!credentials.totpCode) return null;
          const { verifyTOTP } = await import('@/lib/totp');
          const isValidTOTP = verifyTOTP(user.totpSecret, credentials.totpCode as string);
          if (!isValidTOTP) return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          totpEnabled: user.totpEnabled,
        };
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        token.totpEnabled = user.totpEnabled || false;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'user';
        session.user.totpEnabled = (token.totpEnabled as boolean) || false;
      }
      return session;
    },
  },
  trustHost: true,
});

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Not authorized');
  }
  return session;
}
