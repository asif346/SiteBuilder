import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages,
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );

    const nodeStream = response.data;
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      start(controller) {

        let closed = false;
        let buffer = "";

        const closeController = () => {
          if (!closed) {
            closed = true;
            controller.close();
            nodeStream.destroy();
          }
        };

        const errorController = (err: any) => {
          if (!closed) {
            closed = true;
            controller.error(err);
            nodeStream.destroy();
          }
        };

        nodeStream.on("data", (chunk: Buffer) => {
          buffer += chunk.toString();

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {

            if (!line.startsWith("data:")) continue;

            const dataStr = line.replace("data:", "").trim();

            if (dataStr === "[DONE]") {
              closeController();
              return;
            }

            try {
              const json = JSON.parse(dataStr);
              const text = json.choices?.[0]?.delta?.content;

              if (text) {
                controller.enqueue(encoder.encode(text));
              }

            } catch (err) {
              console.error("JSON parse error:", err);
            }
          }
        });

        nodeStream.on("end", closeController);
        nodeStream.on("error", errorController);
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });

  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      { error: "Streaming failed" },
      { status: 500 }
    );
  }
}


export const runtime = 'edge';
