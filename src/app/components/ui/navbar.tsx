"use client"

import { signOut, useSession } from "next-auth/react"
import Image from 'next/image'

export default function Navbar() {
  const { data: session, status } = useSession()

  // Check if session is loading
  if (status === "loading") {
    return (
      <nav className="flex items-center justify-between p-4 bg-black text-white fixed top-0 left-0 w-full z-10">
        <div className="flex items-center">
          <Image src={"/globe.svg"} alt="Logo" width={50} height={50} />

        </div>
      </nav>
    )
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-black text-white">
      {/* Logo on the left */}
      <div className="flex items-center">
        <Image src={"/logo.png"} alt="Logo" width={50} height={50} />
      </div>

      {/* Sign out button on the right */}
      <div>
        {session ? (
<button
  className="bg-white text-black px-4 py-2 rounded-md font-aileron"
  onClick={() => signOut()}
>
  Sign Out
</button>
        ) : null}
      </div>
    </nav>
  )
}
