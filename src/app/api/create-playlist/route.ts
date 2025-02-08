import { NextResponse } from "next/server"
import OpenAI from "openai"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { plant } = await req.json()

    // 1. Get song recommendations from ChatGPT
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that knows about plant growth and sound frequencies.",
        },
        {
          role: "user",
          content: `Analyze the plant frequency preference for ${plant} and suggest 10 songs that match that frequency. Also, determine the optimal frequency in Hz for ${plant}. Return ONLY JSON object with the following format: { "songs": ["song1", "song2", ...], "frequency": 440 }.`,
        },
      ],
    })

    const responseString = completion.choices[0].message.content
    let response: { songs: string[]; frequency: number }

    try {
      // Attempt to parse the JSON response
      console.log(responseString)
      response = JSON.parse(responseString)
    } catch (error) {
      console.error("Error parsing ChatGPT response:", error)
      return NextResponse.json({ error: "Failed to parse ChatGPT response" }, { status: 500 })
    }

    const songList = response.songs.filter((song): song is string => song !== null)
    const frequency = response.frequency

    console.log("Optimal frequency:", frequency)

    const spotifyApiUrl = "https://api.spotify.com/v1"

    if (!session.accessToken) {
      return NextResponse.json({ error: "No access token" }, { status: 401 })
    }

    // Get user ID
    const userResponse = await fetch(`${spotifyApiUrl}/me`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })

    const userData = await userResponse.json()
    const userId = userData.id

    // Create playlist
    const playlistResponse = await fetch(`${spotifyApiUrl}/users/${userId}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `${plant} Growth Playlist`,
        description: `A playlist generated for optimal ${plant} growth.`,
        public: false,
      }),
    })

    const playlistData = await playlistResponse.json()
    const playlistId = playlistData.id

    // Search for tracks and get their URIs
    const trackUris = await Promise.all(
      songList.map(async (song) => {
        const searchResponse = await fetch(`${spotifyApiUrl}/search?q=${encodeURIComponent(song)}&type=track&limit=1`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })
        const searchData = await searchResponse.json()
        if (searchData.tracks?.items?.length > 0) {
          const track = searchData.tracks.items[0]
          return `${track.name} by ${track.artists[0].name}`
        }
        return null
      })
    )

    const validTracks = trackUris.filter((track): track is string => track !== null)

    return NextResponse.json({ playlist: validTracks, playlistId: playlistId })
  } catch (error: any) {
    console.error("Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create playlist" }, { status: 500 })
  }
}
