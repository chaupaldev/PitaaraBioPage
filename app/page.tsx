"use client";
import Image from "next/image";
import logo from "@/assets/images/pitaara logo.jpg"; // Ensure this path is correct

export default function Home() {
  const reels = [
    {
      id: 1,
      thumbnail: "https://pitaara.tv/wp-content/uploads/2025/02/Instagram-02-17-2025_10_11_AM.png",
      link: "https://www.youtube.com/watch?v=example1",
    },
    {
      id: 2,
      thumbnail: "https://pitaara.tv/wp-content/uploads/2025/02/pitaara-link.webp",
      link: "https://www.youtube.com/watch?v=example2",
    },
    {
      id: 3,
      thumbnail: "https://pitaara.tv/wp-content/uploads/2025/02/pitaara-link.webp",
      link: "https://www.youtube.com/watch?v=example3",
    },
    {
      id: 4,
      thumbnail: "https://pitaara.tv/wp-content/uploads/2025/02/Instagram-02-17-2025_10_11_AM.png",
      link: "https://www.youtube.com/watch?v=example2",
    },
    {
      id: 5,
      thumbnail: "https://pitaara.tv/wp-content/uploads/2025/02/Instagram-02-17-2025_10_11_AM.png",
      link: "https://www.youtube.com/watch?v=example1",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-6">
      {/* Logo Section */}
      <Image src={logo} alt="Pitaara Logo" width={192} height={48} className="w-48 mb-6 rounded-full" priority />

      <h1 className="text-3xl font-bold">Latest Reels</h1>

      {/* Reel Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 w-full max-w-4xl">
        {reels.map((reel) => (
          <a
            key={reel.id}
            href={reel.link}
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
              <div className="absolute bottom-0 w-full bg-black bg-opacity-70 p-2 text-center">
                <span className="text-white text-lg font-bold">Click to watch full video</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
