import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://zenquotes.io/api/random", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch quote");
    }

    const data = await response.json();
    const quote = data[0];

    return NextResponse.json({
      text: quote.q || quote.quote || "Every day is a fresh start.",
      author: quote.a || quote.author || "Unknown",
    });
  } catch (error) {
    console.error("Error fetching quote:", error);
    // Return fallback quote
    return NextResponse.json(
      {
        text: "Every day is a fresh start. What you do today matters more than what happened yesterday.",
        author: "Unknown",
      },
      { status: 200 }
    );
  }
}

