"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/assets/images/pitaara logo.jpg";
import PropagateLoader from "react-spinners/PropagateLoader";

export default function Home() {
  const [reels, setReels] = useState<{ id: string; thumbnail: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReels = async () => { 
      try {
        const response = await fetch("/api/links"); // Ensure this matches your API route
        if (!response.ok) throw new Error("Failed to fetch reels");
        
        const data = await response.json();
        setReels(data.links || []);
      } catch (err) {
        setError("Failed to load reels");
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-6">
      {/* Logo Section */}
      <Image src={logo} alt="Pitaara Logo" width={192} height={48} className="w-48 mb-6 rounded-full" priority />

      <h1 className="text-3xl font-bold">Latest Reels</h1>

      {/* Loading State */}
      
      {loading && <PropagateLoader className="mt-10" color="#D00A8E"/>}
      
      {/* Error State */}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {/* Reel Grid */}
      {!loading && !error && reels.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 w-full max-w-4xl">
          {reels.map((reel) => (
            <a
              key={reel.id}
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group w-full"
            >
              <div className="relative w-full aspect-[9/16] overflow-hidden rounded-lg shadow-lg">
                <img
                  src={reel.thumbnail}
                  alt="Reel Thumbnail"
                  className="absolute inset-0 w-full h-full object-cover rounded-xl"
                />
                {/* Always Visible Overlay with Text at Bottom */}
                <div className="absolute bottom-0 w-full bg-black bg-opacity-80 p-2 text-center">
                  <span className="text-yellow-300 text-lg font-bold">Click to watch full video</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        !loading && <p className="mt-4 text-gray-400">No reels available.</p>
      )}
    </div>
  );
}
