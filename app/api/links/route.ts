import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Link from "@/models/Links";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { ObjectId } from "mongodb";

export async function GET() {
    try {
        await connectToDatabase();
        const links = await Link.find({}).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ links }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check user session
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { url, thumbnail } = await request.json();
        if (!url || !thumbnail) {
            return NextResponse.json({ success: false, message: "Url and thumbnail are required" }, { status: 400 });
        }

        // Download the thumbnail from Instagram CDN
        const response = await fetch(thumbnail, {
            headers: { "User-Agent": "Mozilla/5.0" }, // Mimic a browser request
        });

        if (!response.ok) {
            return NextResponse.json({ success: false, message: "Failed to download thumbnail" }, { status: 400 });
        }

        const buffer = await response.arrayBuffer();
        const imageBase64 = Buffer.from(buffer).toString("base64");

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageBase64}`, {
            folder: "thumbnails",
        });

        if (!uploadResponse.secure_url) {
            return NextResponse.json({ success: false, message: "Failed to upload to Cloudinary" }, { status: 500 });
        }

        const cloudinaryUrl = uploadResponse.secure_url;

        // Connect to the database
        await connectToDatabase();

        // Store the Cloudinary URL instead of the Instagram link
        const newLink = new Link({
            url,
            thumbnail: cloudinaryUrl,
            createdAt: new Date(),
        });

        await newLink.save();

        return NextResponse.json({ success: true, message: "Link added successfully", link: newLink }, { status: 201 });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to add link", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}



export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Link ID is required" },
                { status: 400 }
            );
        }

        let objectId;
        try {
            objectId = new ObjectId(id);
        } catch (error) {
            return NextResponse.json(
                { success: false, message: "Invalid ID format" },
                { status: 400 }
            );
        }

        // Connect to the database
        await connectToDatabase();

        // Find the link to get the Cloudinary URL
        const link = await Link.findById(objectId);

        if (!link) {
            return NextResponse.json(
                { success: false, message: "Link not found" },
                { status: 404 }
            );
        }

        // Extract Cloudinary public ID from the URL
        const cloudinaryUrl = link.thumbnail;
        const publicIdMatch = cloudinaryUrl.match(/\/thumbnails\/(.+)\.\w+$/);

        if (!publicIdMatch) {
            return NextResponse.json(
                { success: false, message: "Invalid Cloudinary URL format" },
                { status: 500 }
            );
        }

        const publicId = `thumbnails/${publicIdMatch[1]}`;

        // Delete the image from Cloudinary
        await cloudinary.uploader.destroy(publicId);

        // Delete the document from MongoDB
        await Link.deleteOne({ _id: objectId });

        return NextResponse.json(
            { success: true, message: "Link and thumbnail deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete link", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
