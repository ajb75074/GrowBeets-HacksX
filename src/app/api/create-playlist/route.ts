import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
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
          content: `Analyze the plant frequency preference for ${plant} and suggest 10 songs that match that frequency. Return only the song names in a JSON array format.`,
        },
      ],
    })

    const songListString = completion.choices[0].message.content
    let songList: string[]

    try {
      songList = JSON.parse(songListString)
    } catch (error) {
      console.error("Error parsing ChatGPT response:", error)
      // If parsing fails, try to extract songs from the text response
      songList = songListString
        .split("\n")
        .filter((line) => line.trim())
        .slice(0, 10)
    }

    // 2. Create Spotify playlist
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const spotifyApiUrl = "https://api.spotify.com/v1"

    // Get access token
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: "grant_type=client_credentials",
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Search for tracks and get their URIs
    const trackUris = await Promise.all(
      songList.map(async (song) => {
        const searchResponse = await fetch(`${spotifyApiUrl}/search?q=${encodeURIComponent(song)}&type=track&limit=1`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        const searchData = await searchResponse.json()
        if (searchData.tracks?.items?.length > 0) {
          const track = searchData.tracks.items[0]
          return `${track.name} by ${track.artists[0].name}`
        }
        return null
      }),
    )

    const validTracks = trackUris.filter((track): track is string => track !== null)

    return NextResponse.json({ playlist: validTracks })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 })
  }
}

