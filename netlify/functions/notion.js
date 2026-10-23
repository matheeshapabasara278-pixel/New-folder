exports.handler = async function (event, context) {
  const NOTION_KEY = process.env.NOTION_API_KEY || process.env.NOTION_KEY;

  // Query parameter එකෙන් type එක ගන්නවා (backtest හෝ live)
  const dataType = event.queryStringParameters?.type || 'backtest';

  // Environment variables වලින් අදාළ Database ID එක තෝරා ගැනීම
  const DATABASE_ID = dataType === 'live'
    ? process.env.NOTION_LIVE_DATABASE_ID
    : process.env.NOTION_BACKTEST_DATABASE_ID;

  if (!NOTION_KEY || !DATABASE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Missing Netlify Environment Variables for ${dataType}` }),
    };
  }

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sorts: [
            {
              property: "DATE",
              direction: "descending",
            },
          ],
        }),
      }
    );

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};