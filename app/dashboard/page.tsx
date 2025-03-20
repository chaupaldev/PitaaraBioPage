"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import { PropagateLoader } from "react-spinners";
import Image from "next/image";

// Define schema
const linkSchema = z.object({
  reelUrl: z.string().url({ message: "Invalid Instagram Reel URL" }),
  youtubeUrl: z.string().url({ message: "Invalid YouTube URL" }),
});

type LinkFormData = z.infer<typeof linkSchema>;

const Dashboard = () => {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
  });

  // Fetch paginated links
  const fetchLinks = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/links?page=${page}`);
      if (!response.ok) throw new Error("Failed to fetch links");

      const data = await response.json();
      if (data.links.length === 0) setHasMore(false);

      setLinks((prev) => [...prev, ...data.links]);
      setPage((prev) => prev + 1);
    } catch (error) {
      setError("Failed to fetch links.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  // Observe the sentinel div for infinite scrolling
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchLinks();
        }
      },
      { threshold: 1.0 }
    );

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);

    return () => observerRef.current?.disconnect();
  }, [fetchLinks]);

  // Fetch the thumbnail from an external API
  const fetchThumbnail = async (reelUrl: string) => {
    try {
      const response = await axios.get(
        `/api/getThumbnail?url=${encodeURIComponent(reelUrl)}`
      );
      return response.data.thumbnail;
    } catch (error) {
      setError("Failed to fetch Instagram thumbnail.");
      return null;
    }
  };

  const onSubmit = async (data: LinkFormData) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    const { reelUrl, youtubeUrl } = data;
    let fetchedThumbnail = await fetchThumbnail(reelUrl);
    if (!fetchedThumbnail) {
      setLoading(false);
      return;
    }

    try {
      await axios.post("/api/links", {
        url: youtubeUrl,
        thumbnail: fetchedThumbnail,
      });

      reset();
      setLinks([]); // Reset links to refetch from the first page
      setPage(1);
      setHasMore(true);
      fetchLinks();
    } catch (error) {
      setError("Failed to add link.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/links?id=${id}`);
      setLinks((prevLinks) => prevLinks.filter((link) => link._id !== id));
    } catch (error) {
      setError("Failed to delete link.");
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-6 lg:px-40">
      <h1 className="text-3xl font-semibold text-center text-white">
        Dashboard
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-300 p-6 rounded-lg shadow-lg space-y-4 flex flex-col items-center"
      >
        <div className="w-full">
          <label
            htmlFor="reelUrl"
            className="block text-sm font-medium text-gray-700 sm:text-2xl"
          >
            Instagram Reel URL
          </label>
          <input
            type="text"
            id="reelUrl"
            {...register("reelUrl")}
            placeholder="Enter Instagram Reel URL"
            className="w-full p-3 mt-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.reelUrl && (
            <p className="text-red-500 text-sm">{errors.reelUrl.message}</p>
          )}
        </div>

        <div className="w-full">
          <label
            htmlFor="youtubeUrl"
            className="block text-sm font-medium text-gray-700 sm:text-2xl"
          >
            YouTube URL
          </label>
          <input
            type="text"
            id="youtubeUrl"
            {...register("youtubeUrl")}
            placeholder="Enter YouTube URL"
            className="w-full p-3 mt-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.youtubeUrl && (
            <p className="text-red-500 text-sm">{errors.youtubeUrl.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-16 py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? "Adding..." : "Add Link"}
        </button>
      </form>

      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Added Links */}
      <h2 className="text-3xl font-extrabold text-center text-white">
        Added Reels
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8 mt-6 w-full lg:px-40">
        {links.map((reel) => (
          <div key={reel._id} className="relative">
            <a
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group w-full"
            >
              <div className="relative w-full aspect-[9/16] overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={reel.thumbnail}
                  alt="Reel Thumbnail"
                  fill
                  className="rounded-xl object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </a>
            <button
              onClick={() => handleDelete(reel._id)}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-red-500 text-xl font-bold w-full py-2 rounded hover:bg-gray-900"
            >
              DELETE
            </button>
          </div>
        ))}
      </div>

      {/* Loader */}
      {loading && (
        <PropagateLoader color="#D00A8E" className="mt-6 text-center" />
      )}

      {/* Sentinel for infinite scrolling */}
      <div ref={sentinelRef} className="h-10 w-full"></div>

      {!hasMore && (
        <p className="mt-4 text-gray-400 text-center">
          No more reels available.
        </p>
      )}
    </div>
  );
};

export default Dashboard;
