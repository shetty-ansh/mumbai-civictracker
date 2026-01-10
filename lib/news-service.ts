import Parser from "rss-parser";

export interface NewsItem {
    id: string;
    title: string;
    link: string;
    pubDate: string;
    contentSnippet?: string;
    source: string;
    category: string;
}

const parser = new Parser();

// RSS Feeds for Mumbai News
const RSS_FEEDS = [
    {
        url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms", // TOI Mumbai
        source: "Times of India",
    },
    {
        url: "https://www.mid-day.com/Resources/midday/rss/mumbai-news.xml", // Mid-Day Mumbai
        source: "Mid-Day"
    }
];

// Keywords to filter relevant civic news
const KEYWORDS = [
    "BMC",
    "Brihanmumbai Municipal Corporation",
    "Election",
    "Polls",
    "Ward",
    "Corporator",
    "Mayor",
    "Civic",
    "Infrastructure",
    "Roads",
    "Water",
    "Drainage",
    "Metro",
    "Gokhale Bridge",
    "Coastal Road",
    "Air Quality",
    "Pollution"
];

export async function fetchNews(): Promise<NewsItem[]> {
    const allNews: NewsItem[] = [];

    for (const feed of RSS_FEEDS) {
        try {
            // Use native fetch instead of parser.parseURL to avoid url.parse deprecation warning
            const response = await fetch(feed.url, { next: { revalidate: 3600 } }); // Fetch cache control
            if (!response.ok) throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);

            const xmlData = await response.text();
            const parsed = await parser.parseString(xmlData);

            parsed.items.forEach((item) => {
                // Basic filtering to ensure relevance using keywords
                const textToScan = `${item.title} ${item.contentSnippet || ""}`.toLowerCase();
                const isRelevant = KEYWORDS.some(keyword => textToScan.includes(keyword.toLowerCase()));

                if (isRelevant) {
                    // Determine a category based on keywords
                    let category = "Civic Updates";
                    if (textToScan.includes("election") || textToScan.includes("polls") || textToScan.includes("voter")) category = "Elections";
                    else if (textToScan.includes("metro") || textToScan.includes("bridge") || textToScan.includes("road")) category = "Infrastructure";
                    else if (textToScan.includes("ward") || textToScan.includes("corporator")) category = "Administrative";


                    allNews.push({
                        id: item.guid || item.link || Math.random().toString(),
                        title: item.title || "No Title",
                        link: item.link || "#",
                        pubDate: item.pubDate || new Date().toISOString(),
                        contentSnippet: item.contentSnippet,
                        source: feed.source,
                        category: category
                    });
                }
            });
        } catch (error) {
            console.error(`Error fetching RSS feed from ${feed.source}:`, error);
        }
    }

    // Sort by date (newest first)
    return allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}
