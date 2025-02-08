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
          // TODO: Have it return the frequency in the JSON as well
          role: "user",
          content: `Analyze the plant frequency preference for ${plant} and suggest 10 songs that match that frequency. Also, determine the optimal frequency in Hz for ${plant}. Return ONLY JSON object with the following format: { "songs": ["song1", "song2", ...], "frequency": 440 }.`,
        },
      ],
    })

    const responseString = completion.choices[0].message.content
    let response: { songs: string[]; frequency: number }

    try {
      // Attempt to parse the JSON response
      console.log(responseString);
      response = JSON.parse(responseString);
    } catch (error) {
      console.error("Error parsing ChatGPT response:", error);
      return NextResponse.json({ error: "Failed to parse ChatGPT response" }, { status: 500 });
    }

    const songList = response.songs.filter((song): song is string => song !== null);
    const frequency = response.frequency;

    console.log("Optimal frequency:", frequency);

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
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create playlist" }, { status: 500 });
  }
}
