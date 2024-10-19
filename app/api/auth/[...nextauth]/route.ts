import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import connectMongo from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";


// NextAuth.js configuration
export const authOptions = {
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_CLIENT_ID || "",
			clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "email", type: "email", placeholder: "" },
				password: {
					label: "password",
					type: "password",
					placeholder: "",
				},
			},
			async authorize(credentials: any) {
				const user = await User.findOne({ email: credentials.email });
				if (user) {
					const isPasswordValid = await bcrypt.compare(
						credentials.password,
						user.password
					);
					console.log("X1 user,hashedPassword : ", user,isPasswordValid)
					if (isPasswordValid) {
						return user;
					} else {
						return null;
					}
				} else {
					// Hash the user's password with bcrypt
					const hashedPassword = await bcrypt.hash(
						credentials.password,
						10
					);

					// Create a new User instance with hashed password
					const newUser = new User({
						email: credentials.email,
						password: hashedPassword, // Store the hashed password
					});

					// Save the user to the database
					const savedUser = await newUser.save();

					return savedUser; // Return the saved user object
				}
			},
		}),
	],
	adapter: MongoDBAdapter(
		(async () => {
			const mongooseConnection = await connectMongo();
			return mongooseConnection.connection.getClient(); // Get MongoClient from Mongoose connection
		})()
	),
	session: {
		strategy: "jwt",
	},
	// pages: {
	// 	signIn: "/auth/signin",
	// },
	callbacks: {
		async session({ session, token }) {
			// Attach the user ID from the token to the session object
			session.user.id = token.id;
			return session;
		},
		// async jwt({ token, user }) {
		// 	// Attach the user ID to the JWT token if the user is logged in
		// 	if (user) {
		// 		token.id = user.id;
		// 	}
		// 	return token;
		// },
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
