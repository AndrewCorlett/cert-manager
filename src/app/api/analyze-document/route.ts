import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client server-side only
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const { extractedText } = await request.json();

    if (!extractedText) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    const prompt = `
Analyze the following certificate text and extract key information.
Return ONLY a JSON object with these exact fields:

{
  "certificateName": "extracted name or null",
  "issueDate": "YYYY-MM-DD or null",
  "expiryDate": "YYYY-MM-DD or null", 
  "issuingAuthority": "authority name or null",
  "certificateNumber": "number/serial or null",
  "category": "STCW|GWO|OPITO|Contracts|Other",
  "confidence": 0.95
}

Category Guidelines:
- STCW: Seafarer training (Basic Fire Fighting, Medical First Aid, Personnel Survival Techniques, Security)
- GWO: Global Wind Organisation training (Basic Safety Training, etc.)
- OPITO: Offshore petroleum industry training
- Contracts: Employment contracts, agreements, work authorizations
- Other: Everything else

Certificate text:
${extractedText}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional certificate analysis assistant. Extract information accurately and return only valid JSON."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI API');
    }

    // Parse JSON response
    const analysis = JSON.parse(response);
    
    // Validate response structure
    if (!analysis.category || !['STCW', 'GWO', 'OPITO', 'Contracts', 'Other'].includes(analysis.category)) {
      analysis.category = 'Other';
    }
    
    if (typeof analysis.confidence !== 'number' || analysis.confidence < 0 || analysis.confidence > 1) {
      analysis.confidence = 0.5;
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Document analysis failed:', error);
    
    // Return fallback analysis with low confidence
    return NextResponse.json({
      certificateName: null,
      issueDate: null,
      expiryDate: null,
      issuingAuthority: null,
      certificateNumber: null,
      category: 'Other',
      confidence: 0.0
    });
  }
}