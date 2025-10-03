import { NextResponse } from 'next/server';

const FLASK_API_URL = 'http://localhost:5000';

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { text } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.trim().length < 10) {
      return NextResponse.json(
        { error: 'Text is too short. Please enter at least 10 characters.' },
        { status: 400 }
      );
    }

    // Make requests to both Flask endpoints
    const [predictionResponse, probabilityResponse] = await Promise.all([
      // Get binary prediction (0 = Human, 1 = AI)
      fetch(`${FLASK_API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      }),
      // Get probability scores
      fetch(`${FLASK_API_URL}/predict_proba`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      }),
    ]);

    // Check if Flask API is reachable
    if (!predictionResponse.ok || !probabilityResponse.ok) {
      throw new Error(`Flask API error: ${predictionResponse.status} ${probabilityResponse.status}`);
    }

    const predictionData = await predictionResponse.json();
    const probabilityData = await probabilityResponse.json();

    // Extract results
    const prediction = predictionData.predictions[0]; // 0 or 1
    const probabilities = probabilityData.probabilities[0]; // [human_prob, ai_prob]
    
    const isAI = prediction === 1;
    const confidence = Math.round((isAI ? probabilities[1] : probabilities[0]) * 100);

    // Format response to match the original client-side format
    const result = {
      isAI,
      confidence,
      prediction,
      probabilities: {
        human: Math.round(probabilities[0] * 100),
        ai: Math.round(probabilities[1] * 100)
      },
      details: {
        textLength: text.trim().split(/\s+/).length,
        reason: isAI 
          ? `Text classified as AI-generated with ${confidence}% confidence`
          : `Text classified as human-written with ${confidence}% confidence`,
        source: 'Flask ML Model'
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error:', error);

    // Check if it's a connection error to Flask
    if (error.message.includes('fetch') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: 'AI detection service is currently unavailable. Please make sure the Flask API is running at http://127.0.0.1:5000',
          details: 'Connection failed to Flask API'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'An error occurred during text analysis. Please try again.',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Check if Flask API is running
    const response = await fetch(`${FLASK_API_URL}/`, {
      method: 'GET',
      timeout: 5000
    });

    if (response.ok) {
      return NextResponse.json({
        status: 'healthy',
        message: 'AI detection API is running',
        flaskApi: 'connected'
      });
    } else {
      return NextResponse.json({
        status: 'degraded',
        message: 'Flask API is not responding correctly',
        flaskApi: 'error'
      }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      message: 'Flask API is not accessible',
      flaskApi: 'disconnected',
      error: error.message
    }, { status: 503 });
  }
}