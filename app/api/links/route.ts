import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Link from "@/models/Links";
import { getServerSession } from "next-auth";
import { getRedirectTypeFromError } from "next/dist/client/components/redirect";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";


export async function GET() {
    try {
        await connectToDatabase()
        const links = await Link.find({}).sort({ createdAt: -1 }).lean()
        if (!links || links.length === 0) {
            return NextResponse.json(
                [],
                { status: 200 }
            )
        } return NextResponse.json({
            links
        })
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch links" },
            { status: 200 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check user session if needed (for authentication)
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { url, thumbnail } = await request.json();

        if (!url || !thumbnail) {
            return NextResponse.json(
                { success: false, message: "Url and thumbnail are required" },
                { status: 400 }
            );
        }

        // Connect to the database
        await connectToDatabase();

        // Create a new link document
        const newLink = new Link({
            url,
            thumbnail,
            createdAt: new Date(),
        });

        // Save the link to the database
        await newLink.save();

        return NextResponse.json(
            { success: true, message: "Link added successfully", link: newLink },
            { status: 201 }
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { success: false, message: "Failed to add link", error: errorMessage },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Extract the 'id' from the URL search params
        const id = request.nextUrl.searchParams.get('id'); // Using .get() to extract 'id' from query parameters

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Link ID is required" },
                { status: 400 }
            );
        }

        // Convert the id to an ObjectId for MongoDB
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

        // Try to delete the link by its ObjectId
        const result = await Link.deleteOne({ _id: objectId });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { success: false, message: "Link not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Link deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Failed to delete link", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}