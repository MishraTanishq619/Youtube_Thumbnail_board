'use client'

import { useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Youtube, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/thumbnail-board')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8 animate-bounce">
          <Youtube className="h-16 w-16 text-red-600 mx-auto" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
          Welcome to YouTuber Thumbnail Board
        </h1>
        <p className="text-xl mb-8 text-center max-w-2xl mx-auto leading-relaxed">
          Elevate your YouTube game with our powerful thumbnail management tool. Organize, analyze, and optimize your video thumbnails to boost your channel&apos;s performance.
        </p>
        <div className="space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            onClick={() => signIn()} 
            size="lg" 
            className="bg-primary hover:bg-primary-foreground text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {['Organize Thumbnails', 'Analyze Performance', 'Optimize Content'].map((feature, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out">
            <h3 className="text-lg font-semibold mb-2">{feature}</h3>
            <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
        ))}
      </div>
    </div>
  )
}