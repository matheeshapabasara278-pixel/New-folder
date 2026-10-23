// netlify/functions/notion.js

export async function handler(event, context) {
    const NOTION_API_KEY = process.env.NOTION_API_KEY;
    const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

    // Environment variables හරියට Set කරලා තියෙනවාදැයි පරීක්ෂා කිරීම
    if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Missing Notion API Key or Database ID in environment variables." })
        };
    }

    try {
        // Notion Database Query API එකට Request එක යැවීම
        const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sorts: [
                    {
                        property: "DATE", // Notion database එකේ Date property එක අනුව Sort කිරීම
                        direction: "ascending"
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "Failed to fetch from Notion API", details: errorData })
            };
        }

        const data = await response.json();

        // සාර්ථකව Data ලැබුණු පසු ඒවා Client වෙත යැවීම
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // CORS Policy එක සඳහා
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server error fetching Notion data", message: error.message })
        };
    }
}