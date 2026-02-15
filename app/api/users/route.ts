import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {

  try {

    const user = await currentUser();

    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json(
        { error: "User email missing" },
        { status: 400 }
      );
    }

    // Check existing user
    const userResult = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, user.primaryEmailAddress.emailAddress));

    // If new user → insert
    if (userResult.length === 0) {

      const data = {
        name: user.fullName ?? "NA",
        email: user.primaryEmailAddress.emailAddress,
        credits: 3
      };

      const result = await db
        .insert(usersTable)
        .values(data)
        .returning();

      return NextResponse.json({ user: result[0] });
    }

    return NextResponse.json({ user: userResult[0] });

  } catch (error) {
    console.log("USER API ERROR:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
