import { db } from "@/config/db";
import { chatTable, frameTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const frameId = searchParams.get("frameId");

  if (!frameId?.trim()) {
    return NextResponse.json(
      { error: "frameId is required" },
      { status: 400 }
    );
  }

  try {
    const frameResult = await db
      .select()
      .from(frameTable)
      .where(eq(frameTable.frameId, frameId));

    const chatResult = await db
      .select()
      .from(chatTable)
      .where(eq(chatTable.frameId, frameId));

    const frame = frameResult[0];
    if (!frame) {
      return NextResponse.json(
        { error: "Frame not found" },
        { status: 404 }
      );
    }

    const finalResult = {
      ...frame,
      chatMessages: chatResult[0]?.chatMessage ?? null,
    };

    return NextResponse.json(finalResult);
  } catch (error) {
    const isConnectionError =
      error instanceof Error &&
      (error.message.includes("fetch failed") ||
        error.message.includes("Connect Timeout") ||
        error.message.includes("ETIMEDOUT") ||
        (error as { code?: string }).code === "UND_ERR_CONNECT_TIMEOUT");

    console.error("GET /api/frames error:", error);

    if (isConnectionError) {
      return NextResponse.json(
        { error: "Database temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

