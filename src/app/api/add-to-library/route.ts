import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { playlistId } = await req.json()

    if (!playlistId) {
      return NextResponse.json({ error: "Missing playlistId" }, { status: 400 })
    }

    const spotifyApiUrl = "https://api.spotify.com/v1"

    if (!session.accessToken) {
      return NextResponse.json({ error: "No access token" }, { status: 401 })
    }

    const response = await fetch(`${spotifyApiUrl}/playlists/${playlistId}/followers`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Error adding playlist to library:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to add playlist to library" }, { status: 500 })
    }

    return NextResponse.json({ message: "Playlist added to library" })
  } catch (error: any) {
    console.error("Error:", error)
    return NextResponse.json({ error: error.message || "Failed to add playlist to library" }, { status: 500 })
  }
}
