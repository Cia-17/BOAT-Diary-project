export interface Quote {
  text: string;
  author: string;
}

/**
 * Fetches a random quote from our Next.js API route (which proxies ZenQuotes API)
 * @returns Promise<Quote> - A random quote with text and author
 */
export async function fetchRandomQuote(): Promise<Quote> {
  try {
    const response = await fetch("/api/quotes/random", {
      cache: "no-store", // Always fetch a fresh quote
    });

    if (!response.ok) {
      throw new Error("Failed to fetch quote");
    }

    const data = await response.json();
    return {
      text: data.text || "Every day is a fresh start.",
      author: data.author || "Unknown",
    };
  } catch (error) {
    console.error("Error fetching quote:", error);
    // Fallback quote if API fails
    return {
      text: "Every day is a fresh start. What you do today matters more than what happened yesterday.",
      author: "Unknown",
    };
  }
}

/**
 * Fetches multiple random quotes
 * @param count - Number of quotes to fetch (default: 1)
 * @returns Promise<Quote[]> - Array of random quotes
 */
export async function fetchRandomQuotes(count: number = 1): Promise<Quote[]> {
  try {
    const response = await fetch(`https://zenquotes.io/api/quotes`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch quotes");
    }

    const data = await response.json();
    const quotes: Quote[] = data
      .slice(0, count)
      .map((quote: any) => ({
        text: quote.q || quote.quote || "",
        author: quote.a || quote.author || "Unknown",
      }));

    return quotes;
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return [
      {
        text: "Every day is a fresh start. What you do today matters more than what happened yesterday.",
        author: "Unknown",
      },
    ];
  }
}

