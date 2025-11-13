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
    const { query } = await req.json();
    console.log('Received Cosmos query:', query);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const COSMOS_URI = Deno.env.get("COSMOS_URI");
    const COSMOS_KEY = Deno.env.get("COSMOS_KEY");
    const COSMOS_DATABASE = Deno.env.get("COSMOS_DATABASE");
    const COSMOS_CONTAINER = Deno.env.get("COSMOS_CONTAINER");

    if (!COSMOS_URI || !COSMOS_KEY || !COSMOS_DATABASE || !COSMOS_CONTAINER) {
      throw new Error("Cosmos DB credentials not configured");
    }

    // Use Lovable AI to convert natural language to Cosmos SQL query
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
            content: `You are a Cosmos DB SQL query expert for a finance database.
            
            Your task:
            1. Generate a valid Cosmos DB SQL query based on the user's question
            2. Return ONLY a JSON object with this exact structure:
            {
              "sql": "SELECT c.field FROM c WHERE c.field = 'value'",
              "chartType": "bar" | "line" | "pie" | null,
              "explanation": "Brief explanation of what the query does"
            }
            
            Database context: 
            - Container name: FIN_DB_CNT_01
            - Partition key: InvoiceDate (use this in WHERE clauses for efficiency)
            - Contains financial transaction and invoice data
            - For time-based queries, use line charts
            - For category comparisons, use bar charts
            - For distribution percentages, use pie charts
            - Always use 'c' as the document alias
            
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
    const cosmosQuery = parsedResponse.sql;
    console.log('Generated Cosmos SQL:', cosmosQuery);

    // Query Cosmos DB using REST API
    const endpoint = `${COSMOS_URI}/dbs/${COSMOS_DATABASE}/colls/${COSMOS_CONTAINER}/docs`;
    
    const cosmosResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': COSMOS_KEY,
        'Content-Type': 'application/query+json',
        'x-ms-documentdb-isquery': 'True',
        'x-ms-version': '2018-12-31',
        'x-ms-documentdb-query-enablecrosspartition': 'True'
      },
      body: JSON.stringify({
        query: cosmosQuery,
        parameters: []
      }),
    });

    if (!cosmosResponse.ok) {
      const errorText = await cosmosResponse.text();
      console.error('Cosmos DB error:', errorText);
      throw new Error(`Cosmos DB error: ${cosmosResponse.status} - ${errorText}`);
    }

    const cosmosData = await cosmosResponse.json();
    console.log('Query executed, documents returned:', cosmosData.Documents?.length || 0);

    return new Response(JSON.stringify({
      success: true,
      sql: cosmosQuery,
      data: cosmosData.Documents || [],
      chartType: parsedResponse.chartType,
      explanation: parsedResponse.explanation
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in query-cosmos function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
