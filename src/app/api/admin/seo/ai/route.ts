import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { BUSINESS } from '@/lib/constants';
import { getSeoConfig, SEO_PAGES, saveSeoConfig } from '@/lib/seo-settings';

async function callClaude(apiKey: string, prompt: string, maxTokens = 1024) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

function parseJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Failed to parse AI response');
  return JSON.parse(match[0]);
}

const BUSINESS_CONTEXT = `Business: ${BUSINESS.legalName}
Location: ${BUSINESS.address.full}
Business Description: ${BUSINESS.description}
City: ${BUSINESS.address.city}, State: ${BUSINESS.address.state}`;

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

    const body = await request.json();
    const { action } = body;

    // ── Generate SEO for a single page ──
    if (action === 'generate') {
      const { pageLabel, pagePath, currentTitle, currentDescription } = body;
      const prompt = `You are an SEO expert for a medical spa. Generate optimized SEO metadata for a page.

${BUSINESS_CONTEXT}

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

      const text = await callClaude(apiKey, prompt);
      return NextResponse.json({ suggestion: parseJson(text) });
    }

    // ── Improve existing SEO ──
    if (action === 'improve') {
      const { pageLabel, pagePath, currentTitle, currentDescription, currentKeywords } = body;
      const prompt = `You are an SEO expert for a medical spa. Improve the existing SEO metadata.

${BUSINESS_CONTEXT}

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

      const text = await callClaude(apiKey, prompt);
      return NextResponse.json({ suggestion: parseJson(text) });
    }

    // ── Score existing SEO metadata ──
    if (action === 'score') {
      const { pageLabel, pagePath, currentTitle, currentDescription, currentKeywords } = body;

      if (!currentTitle && !currentDescription) {
        return NextResponse.json({ error: 'No metadata to score. Generate or enter metadata first.' }, { status: 400 });
      }

      const prompt = `You are an SEO expert for a medical spa. Score the SEO metadata for this page.

${BUSINESS_CONTEXT}

Page: "${pageLabel}" (URL path: ${pagePath})
Title: "${currentTitle || 'Not set'}"
Description: "${currentDescription || 'Not set'}"
Keywords: ${currentKeywords ? JSON.stringify(currentKeywords) : 'Not set'}

Score each dimension from 1-10 and provide brief feedback for each. Return JSON:
{
  "overall": 7,
  "dimensions": {
    "titleQuality": { "score": 8, "feedback": "Good length, includes location" },
    "descriptionQuality": { "score": 6, "feedback": "Missing call-to-action" },
    "keywordRelevance": { "score": 7, "feedback": "Good keywords but missing long-tail terms" },
    "localSeo": { "score": 5, "feedback": "Should include neighborhood or nearby landmarks" },
    "ctaEffectiveness": { "score": 4, "feedback": "No clear call-to-action in description" }
  },
  "topSuggestion": "Add a clear CTA like 'Book your free consultation' to the meta description"
}

Be constructive and specific. The overall score should be a weighted average.
Return ONLY valid JSON, no other text.`;

      const text = await callClaude(apiKey, prompt);
      return NextResponse.json({ score: parseJson(text) });
    }

    // ── Competitor analysis ──
    if (action === 'competitor') {
      const { competitorName, competitorUrl, currentKeywords } = body;

      if (!competitorName && !competitorUrl) {
        return NextResponse.json({ error: 'Provide a competitor name or URL.' }, { status: 400 });
      }

      const prompt = `You are an SEO strategist for a medical spa. Analyze competitive positioning.

Our Business:
${BUSINESS_CONTEXT}
Our current keywords: ${currentKeywords ? JSON.stringify(currentKeywords) : 'Not yet defined'}

Competitor: ${competitorName || 'Unknown'}${competitorUrl ? ` (${competitorUrl})` : ''}

Based on your knowledge of med spa SEO competition in the ${BUSINESS.address.city}, ${BUSINESS.address.state} area, provide:

1. Keyword gaps — terms we should target that a competitor in this space likely covers
2. Positioning angles — how we can differentiate in search results
3. Content opportunities — page topics or sections we should add
4. Local SEO recommendations — specific to ${BUSINESS.address.city}

Return JSON:
{
  "keywordGaps": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"],
  "positioningAngles": [
    { "angle": "angle name", "description": "how to implement this" }
  ],
  "contentOpportunities": [
    { "topic": "topic name", "rationale": "why this matters for SEO" }
  ],
  "localTips": ["tip1", "tip2", "tip3"],
  "summary": "2-3 sentence executive summary of the competitive landscape and top priorities"
}

Return ONLY valid JSON, no other text.`;

      const text = await callClaude(apiKey, prompt, 2048);
      return NextResponse.json({ analysis: parseJson(text) });
    }

    // ── Bulk generate for all unconfigured pages ──
    if (action === 'bulk-generate') {
      const config = await getSeoConfig();
      const unconfigured = SEO_PAGES.filter(p => {
        const s = config.pages[p.slug];
        return !s || (!s.title && !s.description);
      });

      if (unconfigured.length === 0) {
        return NextResponse.json({ results: [], message: 'All pages already have SEO configured.' });
      }

      const pageList = unconfigured.map(p => `- "${p.label}" (${p.path})`).join('\n');

      const prompt = `You are an SEO expert for a medical spa. Generate optimized SEO metadata for multiple pages at once.

${BUSINESS_CONTEXT}

Generate SEO metadata for each of these pages:
${pageList}

Return a JSON object where each key is the page path, containing:
{
  "${unconfigured[0].path}": {
    "title": "SEO title (50-60 chars, include location)",
    "description": "Meta description (150-160 chars, compelling with CTA)",
    "keywords": ["5-8 relevant keywords"],
    "ogTitle": "Social sharing title",
    "ogDescription": "Social sharing description"
  }${unconfigured.length > 1 ? `,\n  "${unconfigured[1].path}": { ... }` : ''}
}

Important:
- Each page should have unique, specific metadata — not generic
- Focus on local SEO for ${BUSINESS.address.city}, ${BUSINESS.address.state}
- Include relevant medical spa / aesthetic treatment terms per page
- Keep titles 50-60 chars, descriptions 150-160 chars
- Return ONLY valid JSON, no other text`;

      const text = await callClaude(apiKey, prompt, 4096);
      const generated = parseJson(text);

      // Map back to slugs and save
      const results: { slug: string; label: string; settings: Record<string, unknown> }[] = [];
      for (const page of unconfigured) {
        const data = generated[page.path];
        if (data) {
          config.pages[page.slug] = {
            title: data.title,
            description: data.description,
            keywords: data.keywords,
            ogTitle: data.ogTitle,
            ogDescription: data.ogDescription,
          };
          results.push({ slug: page.slug, label: page.label, settings: data });
        }
      }

      await saveSeoConfig(config);

      return NextResponse.json({
        results,
        message: `Generated SEO for ${results.length} page${results.length === 1 ? '' : 's'}.`,
      });
    }

    // ── Bulk improve all configured pages ──
    if (action === 'bulk-improve') {
      const config = await getSeoConfig();
      const configured = SEO_PAGES.filter(p => {
        const s = config.pages[p.slug];
        return s && (s.title || s.description);
      });

      if (configured.length === 0) {
        return NextResponse.json({ results: [], message: 'No pages have SEO configured yet. Generate first.' });
      }

      const pageList = configured.map(p => {
        const s = config.pages[p.slug];
        return `- "${p.label}" (${p.path}): title="${s.title || 'Not set'}", description="${s.description || 'Not set'}", keywords=${s.keywords ? JSON.stringify(s.keywords) : 'Not set'}`;
      }).join('\n');

      const prompt = `You are an SEO expert for a medical spa. Review and improve the SEO metadata for all pages.

${BUSINESS_CONTEXT}

Current metadata:
${pageList}

For each page, provide improved metadata. Focus on:
- Better keyword targeting for local SEO
- More compelling descriptions with clear CTAs
- Optimal lengths (title: 50-60, description: 150-160 chars)
- Consistency across pages while keeping each unique

Return a JSON object where each key is the page path:
{
  "${configured[0].path}": {
    "title": "improved title",
    "description": "improved description",
    "keywords": ["improved", "keywords"],
    "ogTitle": "improved OG title",
    "ogDescription": "improved OG description"
  }
}

Return ONLY valid JSON, no other text.`;

      const text = await callClaude(apiKey, prompt, 4096);
      const improved = parseJson(text);

      const results: { slug: string; label: string; settings: Record<string, unknown> }[] = [];
      for (const page of configured) {
        const data = improved[page.path];
        if (data) {
          config.pages[page.slug] = {
            ...config.pages[page.slug],
            title: data.title || config.pages[page.slug].title,
            description: data.description || config.pages[page.slug].description,
            keywords: data.keywords || config.pages[page.slug].keywords,
            ogTitle: data.ogTitle || config.pages[page.slug].ogTitle,
            ogDescription: data.ogDescription || config.pages[page.slug].ogDescription,
          };
          results.push({ slug: page.slug, label: page.label, settings: data });
        }
      }

      await saveSeoConfig(config);

      return NextResponse.json({
        results,
        message: `Improved SEO for ${results.length} page${results.length === 1 ? '' : 's'}.`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('SEO AI error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI generation failed' },
      { status: 500 }
    );
  }
}
