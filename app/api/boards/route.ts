import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongoose";
import Board from "@/models/Boards";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/nextAuthOptions";

// GET /api/boards - Fetch all boards
export async function GET() {
	await connectMongo();

	const session = await getServerSession(authOptions); // Get the session
	if (!session) {
		return NextResponse.json(
			{ message: "Not authenticated" },
			{ status: 401 }
		);
	}

	console.log("X1 session : ", session);

	try {
		// Find boards associated with the user
		const boards = await Board.find({ user: session.user?.email });
		return NextResponse.json(boards);
	} catch (error) {
		if (error instanceof Error) {
			// Handling the error and returning a proper response
			return NextResponse.json(
				{ success: false, message: error.message },
				{ status: 500 }
			);
		} else {
			// Handling unknown error types
			return NextResponse.json(
				{ success: false, message: "An unknown error occurred" },
				{ status: 500 }
			);
		}
	}
}

// POST /api/boards - Create a new board
export async function POST(req: Request) {
	await connectMongo();

	const session = await getServerSession(authOptions); // Get the session
	if (!session) {
		return NextResponse.json(
			{ message: "Not authenticated" },
			{ status: 401 }
		);
	}

	console.log("X1 session : ", session);

	const body = await req.json(); // Parse the request body

	try {
		const board = new Board({
			user: session.user?.email, // Associate board with the user ID from the session
			name: body.name,
			videos: [], // Initially empty videos array
		});
		console.log("X1 board : ", board);
		const newBoard = await board.save();
		return NextResponse.json(newBoard, { status: 201 });
	} catch (error) {
		if (error instanceof Error) {
			// Handling the error and returning a proper response
			return NextResponse.json(
				{ success: false, message: error.message },
				{ status: 500 }
			);
		} else {
			// Handling unknown error types
			return NextResponse.json(
				{ success: false, message: "An unknown error occurred" },
				{ status: 500 }
			);
		}
	}
}

export async function DELETE(req: Request) {
	await connectMongo();

	try {
		const { boardId } = await req.json(); // Parse the request body

		if (!boardId) {
			return NextResponse.json(
				{ message: "Board ID is required" },
				{ status: 400 }
			);
		}

		// Find the board by its ID and delete it
		const deletedBoard = await Board.findByIdAndDelete(boardId);

		if (!deletedBoard) {
			return NextResponse.json(
				{ message: "Board not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ message: "Board deleted successfully", deletedBoard },
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof Error) {
			// Handling the error and returning a proper response
			return NextResponse.json(
				{ success: false, message: error.message },
				{ status: 500 }
			);
		} else {
			// Handling unknown error types
			return NextResponse.json(
				{ success: false, message: "An unknown error occurred" },
				{ status: 500 }
			);
		}
	}
}
