import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, dataSource } = await req.json();
    console.log('Received query:', query, 'for data source:', dataSource);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Use Lovable AI to convert natural language to SQL and generate insights
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a SQL and data analysis expert for an EPOS (Electronic Point of Sale) MySQL database.
            
            Your task:
            1. Generate a valid MySQL SELECT query based on the user's question
            2. Return ONLY a JSON object with this exact structure:
            {
              "sql": "SELECT ... FROM ... WHERE ...",
              "chartType": "bar" | "line" | "pie" | null,
              "explanation": "Brief explanation of what the query does"
            }
            
            Database context: The 'epos' database contains sales, products, inventory, customers, and transaction data.
            - For sales trends over time, use line charts with dates
            - For category comparisons, use bar charts
            - For distribution percentages, use pie charts
            - Only suggest charts when the data is appropriate for visualization
            
            Return ONLY the JSON object, no markdown formatting or additional text.`
          },
          {
            role: "user",
            content: query
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later.", success: false }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace.", success: false }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const error = await aiResponse.text();
      console.error("AI Gateway error:", error);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let aiResponseContent = aiData.choices[0].message.content.trim();
    
    // Clean up any markdown formatting
    aiResponseContent = aiResponseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const parsedResponse = JSON.parse(aiResponseContent);
    const sqlQuery = parsedResponse.sql;
    console.log('Generated SQL:', sqlQuery);

    // Call MySQL proxy service
    const MYSQL_PROXY_URL = Deno.env.get("MYSQL_PROXY_URL");
    if (!MYSQL_PROXY_URL) {
      throw new Error("MYSQL_PROXY_URL environment variable not configured. Please deploy the mysql-proxy-service and set this variable.");
    }

    console.log('Calling MySQL proxy service...');
    const proxyResponse = await fetch(`${MYSQL_PROXY_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: sqlQuery }),
    });

    if (!proxyResponse.ok) {
      const errorData = await proxyResponse.json();
      throw new Error(errorData.error || 'MySQL proxy service error');
    }

    const proxyData = await proxyResponse.json();
    console.log('Query executed, rows returned:', proxyData.rowCount);

    return new Response(JSON.stringify({
      success: true,
      sql: sqlQuery,
      data: proxyData.data,
      chartType: parsedResponse.chartType,
      explanation: parsedResponse.explanation
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in query-mysql function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});