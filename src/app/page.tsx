"use client"

import { useState } from "react"
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
    fontWeight: 700,
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
    <div className="container mx-auto p-4 flex flex-col justify-center items-center h-screen">

      <div style={{ maxWidth: '600px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'aileron, sans-serif', fontWeight: 300, fontStyle: 'normal', fontSize: '1.5rem', textAlign: 'justify', lineHeight: '1.0', textTransform: 'uppercase' }}>
          Music is Nature’s secret language. Research shows that specific sound frequencies can actually boost plant growth, helping them thrive in ways we never imagined.
        </p>
        <h1 style={cardTitleStyle}>growbeets</h1>
      </div>
      <Card className="w-full max-w-md mx-auto mt-4" style={bodyTextStyle}>
        <CardDescription style={{ ...bodyTextStyle, textAlign: 'center' }}>Enter a plant name to generate a growth-stimulating playlist!</CardDescription>
        <CardContent style={bodyTextStyle}>
          {session ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  value={plant}
                  onChange={(e) => setPlant(e.target.value)}
                  placeholder="Enter plant name"
                  required
                />
                <Button type="submit" disabled={loading} style={bodyTextStyle}>
                  {loading ? "Generating Playlist..." : "Generate Playlist"}
                </Button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <Button onClick={() => signIn()} style={bodyTextStyle}>Sign in with Spotify</Button>
            </div>
          )}
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
              <Button onClick={() => handleAddToLibrary()} style={bodyTextStyle}>Add to Library</Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
    </div>
  )
}
