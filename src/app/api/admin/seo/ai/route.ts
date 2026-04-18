import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { BUSINESS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getSettings();
    const apiKey = settings.anthropic_api_key || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Claude API key not configured. Add it in Setup.' }, { status: 400 });
    }

    const { action, pageLabel, pagePath, currentTitle, currentDescription, currentKeywords } = await request.json();

    let prompt = '';

    if (action === 'generate') {
      prompt = `You are an SEO expert for a medical spa. Generate optimized SEO metadata for a page.

Business: ${BUSINESS.legalName}
Location: ${BUSINESS.address.full}
Business Description: ${BUSINESS.description}

Page: "${pageLabel}" (URL path: ${pagePath})
${currentTitle ? `Current title: "${currentTitle}"` : ''}
${currentDescription ? `Current description: "${currentDescription}"` : ''}

Generate the following in JSON format:
{
  "title": "SEO-optimized page title (50-60 chars, include location for local SEO)",
  "description": "Meta description (150-160 chars, compelling with call-to-action, include location)",
  "keywords": ["5-8 relevant keywords for this specific page"],
  "ogTitle": "OpenGraph title (can be slightly different, more engaging)",
  "ogDescription": "OpenGraph description (slightly more casual/engaging)"
}

Important:
- Focus on local SEO for ${BUSINESS.address.city}, ${BUSINESS.address.state}
- Include relevant medical spa / aesthetic treatment terms
- Make descriptions compelling and action-oriented
- Keep titles concise but descriptive
- Return ONLY valid JSON, no other text`;
    } else if (action === 'improve') {
      prompt = `You are an SEO expert for a medical spa. Improve the existing SEO metadata.

Business: ${BUSINESS.legalName}
Location: ${BUSINESS.address.full}

Page: "${pageLabel}" (URL path: ${pagePath})
Current title: "${currentTitle || 'Not set'}"
Current description: "${currentDescription || 'Not set'}"
Current keywords: ${currentKeywords ? JSON.stringify(currentKeywords) : 'Not set'}

Analyze the current metadata and provide improved versions. Focus on:
- Better keyword targeting for local SEO in ${BUSINESS.address.city}
- More compelling descriptions with clear value propositions
- Optimal title length (50-60 chars)
- Optimal description length (150-160 chars)

Return improved metadata in JSON format:
{
  "title": "improved title",
  "description": "improved description",
  "keywords": ["improved", "keywords"],
  "ogTitle": "improved OG title",
  "ogDescription": "improved OG description",
  "reasoning": "Brief explanation of what was improved and why"
}

Return ONLY valid JSON, no other text.`;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error?.message || `Claude API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const suggestion = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('SEO AI error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI generation failed' },
      { status: 500 }
    );
  }
}
