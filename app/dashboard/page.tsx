'use client';
import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Import your Zod schema
import { linkSchema } from "@/schemas/linksSchema"; // Update the path to your schema
import { z } from "zod";

// Define types from Zod schema
type LinkFormData = z.infer<typeof linkSchema>;

const Dashboard = () => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [links, setLinks] = useState<any[]>([]); // Store added links
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
  });

  // Fetch the thumbnail from the external API based on Instagram URL
  const fetchThumbnail = async (url: string) => {
    try {
      const response = await axios.get(`/api/getThumbnail?url=${encodeURIComponent(url)}`);
      return response.data.thumbnail;
    } catch (error) {
      setError("Failed to fetch Instagram thumbnail.");
      return null;
    }
  };

  const onSubmit = async (data: LinkFormData) => {
    if (loading) return;

    setLoading(true);

    const { url, thumbnail } = data;

    let fetchedThumbnail = await fetchThumbnail(url);

    if (!fetchedThumbnail) {
      setLoading(false);
      return;
    }

    try {
      // Send POST request to add the link with thumbnail
      const response = await axios.post("/api/links", {
        url,
        thumbnail: fetchedThumbnail,
      });

      setLinks((prevLinks) => [...prevLinks, response.data]); // Add new link to the list
      setThumbnailUrl(fetchedThumbnail); // Set the thumbnail URL for preview
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Failed to add link.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/links/${id}`); // Assuming DELETE route exists for links
      setLinks((prevLinks) => prevLinks.filter((link) => link._id !== id));
    } catch (error) {
      setError("Failed to delete link.");
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-6 text-black">
      <h1 className="text-3xl font-semibold text-center text-gray-800">Dashboard</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">Instagram Reel URL</label>
          <input
            type="text"
            id="url"
            {...register("url")}
            placeholder="Enter Instagram Reel URL"
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.url && <p className="text-red-500 text-sm">{errors.url.message}</p>}
        </div>

        <div>
          <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">YouTube URL</label>
          <input
            type="text"
            id="thumbnail"
            {...register("thumbnail")}
            placeholder="Enter YouTube URL"
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.thumbnail && <p className="text-red-500 text-sm">{errors.thumbnail.message}</p>}
        </div>

        {thumbnailUrl && (
          <div className="flex flex-col items-center mt-4">
            <p className="text-sm text-gray-600">Thumbnail Preview:</p>
            <img src={thumbnailUrl} alt="Thumbnail Preview" className="w-32 h-32 mt-2 object-cover rounded-md" />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 mt-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? 'Adding...' : 'Add Link'}
        </button>
      </form>

      {error && <p className="text-center text-red-500">{error}</p>}

      <h2 className="text-2xl font-medium text-gray-800">Added Links</h2>
      <div className="space-y-4">
        {links.length > 0 ? (
          links.map((link) => (
            <div key={link._id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <img src={link.thumbnail} alt="Link Thumbnail" className="w-12 h-12 object-cover rounded-md" />
                <div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{link.url}</a>
                  <p className="text-sm text-gray-600 mt-1">YouTube: <a href={link.thumbnail} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{link.youtubeUrl}</a></p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(link._id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No links added yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
