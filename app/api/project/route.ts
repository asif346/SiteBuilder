import { db } from "@/config/db";
import { chatTable, frameTable, projectTable, usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  try {

    const { projectId, frameId, messages } = await req.json();
    console.log(projectId,frameId,messages);
    const user = await currentUser();

    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // 🔥 Find DB user
    const dbUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, user.primaryEmailAddress.emailAddress));

    if (!dbUser.length) {
      return NextResponse.json({ error: "DB user missing" }, { status: 400 });
    }

    const userId = dbUser[0].id;

    // ✅ Create project
    await db.insert(projectTable).values({
      projectId: String(projectId),
      createdBy: userId
    });

    // ✅ Create frame
    await db.insert(frameTable).values({
      frameId,
      projectId: String(projectId)
    });

    // ✅ Save chat
    await db.insert(chatTable).values({
      chatMessage: messages,
      createdBy: userId
    });

    return NextResponse.json({
      projectId,
      frameId
    });

  } catch (error) {

    console.log("PROJECT API ERROR:", error);
    console.error("Detailed error:", error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
