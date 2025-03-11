"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import logo from "@/assets/images/pitaara logo.jpg";
import PropagateLoader from "react-spinners/PropagateLoader";

export default function Home() {
  const [reels, setReels] = useState<{ _id: string; thumbnail: string; url: string }[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Fetch reels
  const fetchReels = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/links?page=${page}`);
      if (!response.ok) throw new Error("Failed to fetch reels");

      const data = await response.json();
      if (data.links.length === 0) setHasMore(false);

      setReels((prev) => [...prev, ...data.links]);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to load reels");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  // Observe the sentinel div
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchReels();
        }
      },
      { threshold: 1.0 }
    );

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);

    return () => observerRef.current?.disconnect();
  }, [fetchReels]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-6">
      {/* Logo Section */}
      <Image src={logo} alt="Pitaara Logo" width={192} height={48} className="w-48 mb-6 rounded-full" priority />

      <h1 className="text-3xl font-bold">Latest Reels</h1>

      {/* Reel Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 w-full max-w-4xl">
        {reels.map((reel) => (
          <a key={reel._id} href={reel.url} target="_blank" rel="noopener noreferrer" className="relative group w-full">
            <div className="relative w-full aspect-[9/16] overflow-hidden rounded-lg shadow-lg">
              <Image
                src={reel.thumbnail}
                alt="Reel Thumbnail"
                fill
                className="rounded-xl object-cover"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute bottom-0 w-full bg-black bg-opacity-80 p-2 text-center">
                <span className="text-yellow-300 text-lg font-bold">Click to watch full video</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Loader */}
      {loading && <PropagateLoader color="#D00A8E" className="mt-6" />}

      {/* Sentinel (Hidden div that triggers fetch on scroll) */}
      <div ref={sentinelRef} className="h-10 w-full"></div>

      {/* End Message */}
      {!hasMore && <p className="mt-4 text-gray-400 text-center">No more reels available.</p>}
    </div>
  );
}
