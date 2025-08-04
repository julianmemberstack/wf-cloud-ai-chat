import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Add GET method for debugging
export async function GET() {
  console.log('[API/GET] Chat API GET request received');
  console.log('[API/GET] Environment:', process.env.NODE_ENV);
  console.log('[API/GET] OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
  
  return NextResponse.json(
    { 
      status: 'API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasApiKey: !!process.env.OPENAI_API_KEY,
      methods: ['GET', 'POST', 'OPTIONS']
    },
    { headers: corsHeaders }
  );
}

export async function OPTIONS() {
  console.log('[API/OPTIONS] CORS preflight request received');
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  console.log('[API/POST] Chat API POST request received');
  console.log('[API/POST] Headers:', Object.fromEntries(req.headers.entries()));
  console.log('[API/POST] Method:', req.method);
  console.log('[API/POST] URL:', req.url);
  
  try {
    const body = await req.json() as { messages: ChatCompletionMessageParam[] };
    console.log('[API/POST] Request body:', JSON.stringify(body, null, 2));
    
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      console.error('[API/POST] Invalid request: messages array is missing or not an array');
      return NextResponse.json(
        { error: 'Messages array is required' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    console.log('[API/POST] Messages count:', messages.length);

    let client: OpenAI;
    try {
      client = getOpenAIClient();
      console.log('[API/POST] OpenAI client initialized successfully');
    } catch (error) {
      console.error('[API/POST] Failed to initialize OpenAI client:', error);
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { 
          status: 500,
          headers: corsHeaders
        }
      );
    }

    const stream = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              const encoded = encoder.encode(`data: ${JSON.stringify({ content })}\n\n`);
              controller.enqueue(encoded);
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('[API/POST] Chat API error:', error);
    console.error('[API/POST] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}