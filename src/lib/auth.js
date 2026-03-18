import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcrypt";
import prisma from "./prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });

        if (!admin) {
          throw new Error("Admin not found");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          admin.password,
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role.name,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
