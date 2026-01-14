import { NextRequest, NextResponse } from 'next/server';

const DIFY_API_URL = 'https://api.dify.ai/v1/chat-messages';
const DIFY_API_KEY = process.env.DIFY_API_KEY;

export async function POST(request: NextRequest) {
    console.log('=== Chat API Request Started ===');
    console.log('DIFY_API_KEY exists:', !!DIFY_API_KEY);
    console.log('DIFY_API_KEY first 10 chars:', DIFY_API_KEY?.substring(0, 10));

    try {
        const body = await request.json();
        const { query, conversation_id, user } = body;

        console.log('Request body:', { query, conversation_id, user });

        if (!query) {
            console.log('Error: Query is missing');
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        if (!DIFY_API_KEY) {
            console.log('Error: DIFY_API_KEY is not set');
            return NextResponse.json(
                { error: 'Chatbot is not configured' },
                { status: 500 }
            );
        }

        const requestBody = {
            inputs: {},
            query: query,
            response_mode: 'blocking',
            conversation_id: conversation_id || '',
            user: user || 'anonymous-user',
        };

        console.log('Sending to Dify:', requestBody);

        const response = await fetch(DIFY_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DIFY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        console.log('Dify response status:', response.status);
        console.log('Dify response statusText:', response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Dify API error response:', errorText);
            return NextResponse.json(
                { error: `Dify API Error: ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('Dify response data:', data);

        return NextResponse.json({
            answer: data.answer,
            conversation_id: data.conversation_id,
            message_id: data.message_id,
        });
    } catch (error) {
        console.error('Chat API catch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
