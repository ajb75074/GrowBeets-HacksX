// NextAuth and the Spotify provider for authentication
import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"

// Spotify client ID and client secret from environment variables
const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

if (!clientId || !clientSecret) {
  throw new Error("Missing Spotify client ID or secret")
}

// configuring callbacks for handling token and session
export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: clientId,
      clientSecret: clientSecret,
      authorization:
        'https://accounts.spotify.com/authorize?scope=playlist-modify-public playlist-modify-private user-follow-modify',
    }),
  ],
  callbacks: {
    async jwt({ token, account }: any) {
      // persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token, user }: any) {
      // send properties to the client
      session.accessToken = token.accessToken
      return session
    }
  }
}
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
