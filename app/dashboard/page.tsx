"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2 } from "lucide-react";

// Define schema
const linkSchema = z.object({
  reelUrl: z.string().url({ message: "Invalid Instagram Reel URL" }),
  youtubeUrl: z.string().url({ message: "Invalid YouTube URL" }),
});

type LinkFormData = z.infer<typeof linkSchema>;

const Dashboard = () => {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
  });

  // Fetch all links when the dashboard loads
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/links"); // Ensure this matches your API route
      if (!response.ok) throw new Error("Failed to fetch Links");

      const data = await response.json();
      setLinks(data.links || []);
    } catch (error) {
      setError("Failed to fetch links.");
    }
  };

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

      reset(); // Clear the form after submission
      fetchLinks(); // Refresh links after adding a new one
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
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-semibold text-center  text-white">
        Dashboard
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-300 p-6 rounded-lg shadow-lg space-y-4"
      >
        <div>
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
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.reelUrl && (
            <p className="text-red-500 text-sm">{errors.reelUrl.message}</p>
          )}
        </div>

        <div>
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
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.youtubeUrl && (
            <p className="text-red-500 text-sm">{errors.youtubeUrl.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className=" px-8 py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? "Adding..." : "Add Link"}
        </button>
      </form>

      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Added Links */}
      <h2 className="text-3xl font-extrabold text-center text-white-800">Added Reels</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 w-full max-w-4xl">
        {links.map((reel) => (
       
            <div className="relative w-full aspect-[9/16] overflow-hidden rounded-lg shadow-lg">
              <img
                src={reel.thumbnail}
                alt="Reel Thumbnail"
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
              />
              {/* Always Visible Overlay with Text at Bottom */}
              <div className="absolute bottom-0 w-full bg-black bg-opacity-70 p-2 text-center">
                <button
                  onClick={() => handleDelete(reel._id)}
                  className="text-red-500 text-2xl font-extrabold hover:text-red-700"
                >
                  DELETE
                </button>{" "}
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
