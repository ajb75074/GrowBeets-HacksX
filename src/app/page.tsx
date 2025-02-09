"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./components/ui/card"
import { useSession, signIn, signOut } from "next-auth/react"
import Navbar from "./components/ui/navbar"

export default function PlantGrowthPlaylist() {
  const { data: session } = useSession()
  const [plant, setPlant] = useState("")
  const [playlist, setPlaylist] = useState<{ uri: string; name: string; artist: string }[]>([])
  const [playlistId, setPlaylistId] = useState<string | null>(null)
  const [playlistLink, setPlaylistLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cardTitleStyle = {
    fontFamily: 'aileron, sans-serif',
    fontWeight: 600,
    fontStyle: 'normal',
    fontSize: '9rem',
    letterSpacing: '-10px',
  };

  const bodyTextStyle = {
    fontFamily: 'aileron, sans-serif',
    fontWeight: 100,
    fontStyle: 'normal',
    letterSpacing: '1px',
  };

  const signInButtonStyle = {
    display: 'flex',
    justifyContent: 'center',
    padding: '0.75rem 1.5rem',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/create-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plant }),
      })

      if (!response.ok) {
        throw new Error("Failed to create playlist")
      }

      const data = await response.json()
      setPlaylist(data.playlist)
      setPlaylistId(data.playlistId)
      setPlaylistLink(`https://open.spotify.com/embed/playlist/${data.playlistId}?utm_source=generator`)
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to create playlist. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToLibrary = async () => {
    if (!playlistId) {
      setError("No playlist ID available.")
      return
    }

    try {
      const response = await fetch("/api/add-to-library", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistId }),
      })

      if (!response.ok) {
        throw new Error("Failed to add playlist to library")
      }

      // Optionally, provide user feedback that the playlist was added successfully
      alert("Playlist added to your library!")
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to add playlist to library. Please try again.")
    }
  }

  return (
    <div className="w-full">
      <Navbar/>
    <div className="container mx-auto p-4 flex flex-col justify-center items-center h-screen parallax">

      <div style={{ maxWidth: '600px', textAlign: 'center' }}>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ fontFamily: 'aileron, sans-serif', fontWeight: 300, fontStyle: 'normal', fontSize: '1.5rem', textAlign: 'justify', lineHeight: '1.0', textTransform: 'uppercase' }}
        >
          Music is Nature’s secret language. Research shows that specific sound frequencies can actually boost plant growth, helping them thrive in ways we never imagined.
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={cardTitleStyle}
        >
          growbeets
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ fontFamily: 'aileron, sans-serif', fontWeight: 300, fontStyle: 'normal', fontSize: '1rem', textAlign: 'center', lineHeight: '1.0', textTransform: 'uppercase', whiteSpace: 'nowrap', marginTop: '1rem' }}
        >
          Enter a plant name to generate a growth-stimulating playlist
        </motion.p>
      </div>
      
      {session ? (
        <Card className="w-full max-w-md mx-auto mt-4" style={bodyTextStyle}>
          <CardContent style={bodyTextStyle}>
            <>
              <form onSubmit={handleSubmit} className="space-y-4 flex justify-center flex-col items-center">
                <Input
                  type="text"
                  value={plant}
                  onChange={(e) => setPlant(e.target.value)}
                  placeholder="Enter plant name"
                  required
                  style={{marginTop: '0.625rem'}}
                />
                <Button type="submit" disabled={loading} style={{ borderRadius: '30px', marginTop: '1rem' }}>
                  {loading ? "Generating Playlist..." : "Generate Playlist"}
                </Button>
              </form>
            </>
          </CardContent>
          {error && (
            <CardContent style={bodyTextStyle}>
              <p className="text-red-500" style={bodyTextStyle}>{error}</p>
            </CardContent>
          )}
          {playlist.length > 0 && (
            <CardFooter style={bodyTextStyle}>
              <div className="w-full">
                {playlistLink && (
                  <iframe style={{ borderRadius: '12px' }} src={playlistLink} width="100%" height="352" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                )}
                <Button onClick={() => handleAddToLibrary()} style={{ borderRadius: '30px', marginTop: '1rem' }}>Add to Library</Button>
              </div>
            </CardFooter>
          )}
        </Card>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <Button onClick={() => signIn()} style={{ ...bodyTextStyle, borderRadius: '30px', backgroundColor: 'rgb(221, 161, 94)', color: 'rgb(40, 54, 24)', fontWeight: 'bold' }}>Sign in with Spotify</Button>
        </div>
      )}
    </div>
    </div>
  )
}
