import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

if (!clientId || !clientSecret) {
  throw new Error("Missing Spotify client ID or secret")
}

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: clientId,
      clientSecret: clientSecret,
      authorization: {
        url: 'https://accounts.spotify.com/authorize',
        params: {
          scope: 'playlist-modify-public playlist-modify-private user-follow-modify user-read-email user-read-private',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }: any) {
      // Persist the OAuth access_token and refresh_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }

      return token
    },
    async session({ session, token }: any) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken
      return session
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
