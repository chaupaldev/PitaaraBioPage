import axios from "axios";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Extract the query parameters from the URL
    const url = req.nextUrl.searchParams.get("url");

    // Check if the 'url' parameter is provided
    if (!url || typeof url !== "string") {
        return NextResponse.json({ error: "Invalid or missing URL" }, { status: 400 });
    }

    try {
        // Fetch the Instagram page with the specified URL and user-agent header
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });

        // Load the HTML response into Cheerio
        const $ = cheerio.load(data);

        // Extract the thumbnail URL from the meta tag
        const thumbnailUrl = $('meta[property="og:image"]').attr("content");

        // If no thumbnail URL is found, return an error
        if (!thumbnailUrl) {
            return NextResponse.json({ error: "Thumbnail not found" }, { status: 404 });
        }

        // Return the thumbnail URL as JSON response
        return NextResponse.json({ thumbnail: thumbnailUrl });
    } catch (error) {
        // Log the error for debugging
        console.error("Error fetching Instagram page:", error);

        // Return a 500 status with the error message
        const errorMessage = (error as any).message;
        return NextResponse.json({ error: "Failed to fetch thumbnail", details: errorMessage }, { status: 500 });
    }
}
