
import { connectToDatabase } from "@/lib/db";
import  User  from "@/models/Users";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST() {
  await connectToDatabase();

  // Check if a user already exists
  const existingUser = await User.findOne({});
  if (existingUser) {
    return NextResponse.json(
      { error: "A user already exists in the database!" },
      { status: 403 }
    );
  }

  // Define the single user
  const newUser = new User({
    email: "admin",
    password: "password",
  });

  await newUser.save();
  return NextResponse.json({ message: "User added successfully!" });
}
