"use client"

import HomeContent from "@/components/HomeContent";
import { useConnection } from "wagmi"

export default function Home() {

  const { isConnected } = useConnection()

  return (
    <div>
      {
        isConnected ? (
          <div>
            <HomeContent />
          </div>
        ) : (
          <div>
            Please connect wallet...
          </div>
        )
      }
    </div>
  );
}
