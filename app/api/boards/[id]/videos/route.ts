import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongoose";
import Board from "@/models/Boards";
import Thumbnail from "@/models/Thumbnail"; // Use Thumbnail model to create new document
import { extractVideoId } from "@/modules/extractVideoId";
import { getYoutubeVideoDetails } from "@/modules/getYoutubeVideoDetails";

// POST /api/boards/:id/videos - Add a video to a specific board
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    await connectMongo();

    try {
        const { youtubeVideoUrl } = await req.json(); // Parse the request body
        const { id } = params; // Get the board ID from params

        console.log("X1 id,youtubeVideoUrl : ", id, youtubeVideoUrl);

        // Find the board by ID
        const board = await Board.findById(id);
        if (!board) {
            return NextResponse.json({ message: "Board not found" }, { status: 404 });
        }

        const videoId = extractVideoId(youtubeVideoUrl);

        if (!videoId) {
            return NextResponse.json({ message: "Invalid Video URL" }, { status: 400 });
        }

        // Fetch video details using await instead of .then()
        const videoDetails = await getYoutubeVideoDetails(videoId);

        const videoData = videoDetails?.items[0];

        if (!videoData) {
            return NextResponse.json(
                { message: "Video details not found" },
                { status: 404 }
            );
        }

        // Extract the last thumbnail from the thumbnails object
        const thumbnails = videoData.snippet.thumbnails;
        const thumbnailKeys = Object.keys(thumbnails);
        const lastThumbnailKey = thumbnailKeys[thumbnailKeys.length - 1];
        // @ts-expect-error: Index signature for type 'string' not found
        const lastThumbnailUrl = thumbnails[lastThumbnailKey].url; // No index signature with a parameter of type 'string' was found

        // Create a new Thumbnail instance
        const newThumbnail = new Thumbnail({
            id: videoData.id,  // Use the YouTube video ID as the document ID
            title: videoData.snippet.title,
            thumbnail: lastThumbnailUrl, // Or you can choose medium or high resolution
            views: parseInt(videoData.statistics.viewCount, 10),
            likes: parseInt(videoData.statistics.likeCount, 10),
        });

        // Push the new thumbnail into the board's videos array
        board.videos.push(newThumbnail);

        // Save the updated board with the new video
        const updatedBoard = await board.save();

        return NextResponse.json(updatedBoard, { status: 201 });

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
