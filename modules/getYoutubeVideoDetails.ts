import axios from 'axios';

interface VideoDetailsResponse {
  // Define the structure of the API response as per the actual API return format
  kind: string;
  etag: string;
  items: Array<{
    kind: string;
    etag: string;
    id: string;
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: {
          url: string;
          width: number;
          height: number;
        },
        high: {
          url: string;
          width: number;
          height: number;
        },
        maxres: {
          url: string;
          width: number;
          height: number;
        }
      },
      channelTitle: string;
      tags: string[];
    };
    contentDetails: {
      duration: string;
      dimension: string;
      definition: string;
      caption: string;
    };
    statistics: {
      viewCount: string;
      likeCount: string;
      commentCount: string;
    };
  }>;
}



export async function getYoutubeVideoDetails(videoId: string): Promise<VideoDetailsResponse | null> {
  const options = {
    method: 'GET',
    url: 'https://youtube-v311.p.rapidapi.com/videos/',
    params: {
      part: 'snippet,contentDetails,statistics',
      id: videoId,
      maxResults: '5'
    },
    headers: {
      'x-rapidapi-host': 'youtube-v311.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPID_API_KEY
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
}
