'use client'

import React, { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, ThumbsUp, Plus, Sun, Moon, Search, Trash2, LogOut } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { signOut } from "next-auth/react"
import { getYoutubeVideoDetails } from "@/modules/getYoutubeVideoDetails"
import axios from "axios"

// Types
type Video = {
  id: number
  title: string
  thumbnail: string
  views: number
  likes: number
}

type Board = {
  id: number
  name: string
  videos: Video[]
}

// Default thumbnail image
const DEFAULT_THUMBNAIL = "/placeholder.svg?height=200&width=300"

// BoardsList component
const BoardsList: React.FC<{
  boards: Board[]
  activeBoard: Board | null
  onSelectBoard: (boardId: number) => void
  onCreateBoard: () => void
  onDeleteBoard: (boardId: number) => void
}> = ({ boards, activeBoard, onSelectBoard, onCreateBoard, onDeleteBoard }) => {
  return (
    <div className="w-64 bg-gray-100 p-4 h-screen dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">Your Boards</h2>
      {boards.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 mb-4">No boards yet. Create one to get started!</p>
      ) : (
        <ul>
          {boards.map((board) => (
            <li
              key={board._id}
              className={`cursor-pointer p-2 mb-2 rounded flex justify-between items-center ${
                activeBoard?._id === board._id
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            onClick={() => onSelectBoard(board._id)}
            >
              <span>{board.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBoard(board._id);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Button onClick={onCreateBoard} className="mt-4 w-full">
        <Plus className="w-4 h-4 mr-2" />
        New Board
      </Button>
    </div>
  )
}

// VideoCard component
const VideoCard: React.FC<{ video: Video; index: number }> = React.memo(
  ({ video, index }) => {
    return (
      <Draggable draggableId={video._id.toString()} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <Card className="overflow-hidden">
              <img
                src={video.thumbnail}
                alt={`Thumbnail for ${video.title}`}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <h2 className="font-semibold text-lg mb-2 line-clamp-2">
                  {video.title}
                </h2>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {video.views.toLocaleString()}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {video.likes.toLocaleString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>
    )
  }
)

VideoCard.displayName = "VideoCard"

// Main ThumbnailBoard component
export default function ThumbnailBoard() {
  const [boards, setBoards] = useState<Board[]>([])
  const [activeBoard, setActiveBoard] = useState<Board | null>(null)
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false)
  const [newBoardName, setNewBoardName] = useState("")
  const { theme, toggleTheme } = useTheme()

  // const filteredVideos = activeBoard? activeBoard.videos : []
  const filteredVideos = activeBoard
    ? activeBoard.videos.filter((video) =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []
  
  const getBoards = async () => {
    const response = await axios.get('/api/boards')
    setBoards(response.data)
  }
  useEffect(() => {
    getBoards()
  }, [])
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeBoard) return
    setIsLoading(true)
    setError("")

    const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/
    if (!youtubeUrlPattern.test(newVideoUrl)) {
      setError("Please enter a valid YouTube URL")
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.post(`/api/boards/${activeBoard._id}/videos`, {
        youtubeVideoUrl: newVideoUrl
      });
      console.log('Video added:', response.data);


      // setBoards((prevBoards) =>
      //   prevBoards.map((board) =>
      //     board._id === activeBoard._id
      //       ? { ...board, videos: [newVideo, ...board.videos] }
      //       : board
      //   )
      // )
      setActiveBoard(response.data)
      setNewVideoUrl("")
    } catch (error) {
      setError("Failed to add video. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectBoard = (boardId: number) => {
    const selected = boards.find((board) => board._id === boardId)
    if (selected) {
      setActiveBoard(selected)
    }
  }

  const handleCreateBoard = () => {
    setIsNewBoardModalOpen(true)
  }

  const handleNewBoardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newBoardName.trim() === "") return

    try {
      const response = await axios.post('/api/boards', { name: newBoardName.trim() });
      setError(""); // Clear any previous errors

      setBoards((prevBoards) => [...prevBoards, response.data])
      setActiveBoard(response.data)
      setNewBoardName("")
      setIsNewBoardModalOpen(false)
    } catch (err) {
      console.error(err);
      setError('Error creating board');
    }



  }

  const handleDeleteBoard = async (boardId: string) => {

    const response = await axios.delete("/api/boards", {
      data : { boardId }
    });

    await getBoards();

    if (activeBoard && activeBoard._id === boardId) {
      setActiveBoard(boards.length > 1 ? boards[0] : null)
    }
  }

  const onDragEnd = (result: any) => {
    if (!result.destination || !activeBoard) return

    const newVideos = Array.from(activeBoard.videos)
    const [reorderedItem] = newVideos.splice(result.source.index, 1)
    newVideos.splice(result.destination.index, 0, reorderedItem)

    setActiveBoard((prevBoard) => ({ ...prevBoard!, videos: newVideos }))
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board._id === activeBoard._id ? { ...board, videos: newVideos } : board
      )
    )
  }

  return (
    <div className={`flex ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <BoardsList
        boards={boards}
        activeBoard={activeBoard}
        onSelectBoard={handleSelectBoard}
        onCreateBoard={handleCreateBoard}
        onDeleteBoard={handleDeleteBoard}
      />
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {activeBoard ? activeBoard.name : "Welcome to Your Thumbnail Board"}
          </h1>
		  <div className="flex items-center space-x-2">
            <Button onClick={()=> signOut({ callbackUrl: '/' })} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            <Button onClick={toggleTheme} variant="outline">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
          {/* <Button onClick={toggleTheme} variant="outline">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button> */}
        </div>

        {activeBoard ? (
          <>
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter YouTube video URL"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className={`flex-grow ${theme === "dark" ? "bg-gray-800 text-white" : ""}`}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : <><Plus className="w-4 h-4 mr-2" />Add Video</>}
                </Button>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>

            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${theme === "dark" ? "bg-gray-800 text-white" : ""}`}
              />
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="videos">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {filteredVideos.map((video, index) => (
                      <VideoCard key={video._id} video={video} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </>
        ) : (
          <div className="text-center">
            <p className="text-xl mb-4">You don't have any boards yet. Create one to get started!</p>
            <Button onClick={handleCreateBoard}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Board
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isNewBoardModalOpen} onOpenChange={setIsNewBoardModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNewBoardSubmit} className="space-y-4">
            <div>
              <Label htmlFor="boardName">Board Name</Label>
              <Input
                id="boardName"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Enter board name"
              />
            </div>
            <Button type="submit">Create Board</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}