import NextAuth from "next-auth";
import { authOptions } from "@/modules/nextAuthOptions";


// NextAuth.js configuration

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
