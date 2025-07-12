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
      // Return a basic template if no API key
      const { certificates } = await request.json();
      return NextResponse.json({
        template: `Dear Recipient,

Please find my professional certificates attached.

The attached documents include:
${certificates.map((cert: { name: string }) => `• ${cert.name}`).join('\n')}

Best regards,
[Your Name]`
      });
    }

    const { certificates, context } = await request.json();

    const certificateList = certificates
      .map((cert: { name: string; category: string; expiryDate: string }) => `- ${cert.name} (${cert.category}, expires: ${cert.expiryDate})`)
      .join('\n');

    const contextPrompts = {
      job_application: "This is for a job application. Emphasize qualifications and readiness.",
      renewal_reminder: "This is a renewal reminder. Focus on upcoming expiry dates and renewal needs.",
      general: "This is a general certificate sharing email. Keep it professional but neutral."
    };

    const prompt = `
Generate a professional email template for sending these certificates:

${certificateList}

Context: ${contextPrompts[context as keyof typeof contextPrompts] || contextPrompts.general}

Requirements:
- Professional greeting
- Brief explanation of attached certificates
- Mention relevant details (expiry dates if within 6 months)
- Professional closing
- Keep it concise (under 200 words)
- Use placeholders like [Your Name] for personalization

Return only the email text, no additional formatting.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional email writing assistant. Create clear, concise, and professional emails."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 400
    });

    const template = completion.choices[0]?.message?.content || 'Failed to generate email template.';
    
    return NextResponse.json({ template });
  } catch (error) {
    console.error('Email template generation failed:', error);
    
    // Return fallback template
    const { certificates } = await request.json();
    return NextResponse.json({
      template: `Dear Recipient,

I hope this email finds you well. Please find my professional certificates attached for your review.

The attached documents include:
${certificates.map((cert: { name: string }) => `• ${cert.name}`).join('\n')}

Please let me know if you need any additional information or documentation.

Best regards,
[Your Name]`
    });
  }
}