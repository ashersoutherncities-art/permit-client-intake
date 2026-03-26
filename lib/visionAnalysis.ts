// Claude Vision API - Property Photo Analysis
// Analyzes uploaded property photos to generate recommended scope + budget adjustments

import Anthropic from '@anthropic-ai/sdk';

export interface PhotoInput {
  base64: string;
  mimeType: string;
  category: 'existing' | 'damage' | 'reference';
  fileName: string;
}

export interface VisionAnalysis {
  overallCondition: 'good' | 'fair' | 'poor' | 'major_work_needed';
  conditionScore: number; // 1-10
  identifiedIssues: Array<{
    category: string; // structural, electrical, plumbing, roofing, etc.
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }>;
  recommendedScopeItems: Array<{
    item: string;
    priority: 'required' | 'recommended' | 'optional';
    estimatedCostRange: string;
  }>;
  safetyFlags: string[];
  riskFactors: string[];
  scopeDescription: string;
  budgetMultiplier: number; // 0.8 to 1.5
  summary: string;
}

const ANALYSIS_PROMPT = `You are a professional construction estimator and property inspector for Southern Cities Enterprises in Charlotte, NC.

Analyze the provided property photos and return a detailed assessment. The photos are categorized as:
- "existing": Current property condition photos
- "damage": Specific damage or issue photos  
- "reference": Reference/inspiration photos for desired outcome

Based on what you see, provide:

1. **Overall Condition**: Rate as good/fair/poor/major_work_needed
2. **Condition Score**: 1-10 (10 = perfect condition)
3. **Identified Issues**: List each visible issue with category (structural, electrical, plumbing, roofing, siding, foundation, interior, exterior, landscaping, other), severity (low/medium/high/critical), and description
4. **Recommended Scope Items**: What work should be done, priority (required/recommended/optional), and estimated cost range
5. **Safety Flags**: Any immediate safety concerns visible
6. **Risk Factors**: Things that could increase project complexity/cost
7. **Scope Description**: A paragraph describing the recommended scope of work
8. **Budget Multiplier**: A number between 0.8 and 1.5 to adjust the base budget:
   - 0.8-0.9: Property is in better condition than typical, less work needed
   - 1.0: Average condition, standard scope
   - 1.1-1.2: Below average, additional work needed
   - 1.3-1.5: Major issues, significant additional scope required

Return ONLY valid JSON matching this exact structure:
{
  "overallCondition": "fair",
  "conditionScore": 5,
  "identifiedIssues": [{"category": "roofing", "severity": "high", "description": "..."}],
  "recommendedScopeItems": [{"item": "...", "priority": "required", "estimatedCostRange": "$X - $Y"}],
  "safetyFlags": ["..."],
  "riskFactors": ["..."],
  "scopeDescription": "...",
  "budgetMultiplier": 1.2,
  "summary": "Brief overall assessment"
}`;

export async function analyzePhotos(photos: PhotoInput[]): Promise<VisionAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const client = new Anthropic({ apiKey });

  // Build content blocks with images
  const content: Anthropic.MessageCreateParams['messages'][0]['content'] = [];

  // Group photos by category for context
  const byCategory = { existing: [] as PhotoInput[], damage: [] as PhotoInput[], reference: [] as PhotoInput[] };
  photos.forEach((p) => {
    if (byCategory[p.category]) byCategory[p.category].push(p);
  });

  for (const [category, categoryPhotos] of Object.entries(byCategory)) {
    if (categoryPhotos.length === 0) continue;
    content.push({ type: 'text', text: `\n--- ${category.toUpperCase()} PHOTOS (${categoryPhotos.length}) ---` });

    for (const photo of categoryPhotos) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: photo.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: photo.base64,
        },
      });
      content.push({ type: 'text', text: `File: ${photo.fileName} (${category})` });
    }
  }

  content.push({ type: 'text', text: '\nPlease analyze all photos above and provide your assessment as JSON.' });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      { role: 'user', content },
    ],
    system: ANALYSIS_PROMPT,
  });

  // Extract JSON from response
  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude Vision');
  }

  // Parse JSON - handle potential markdown code blocks
  let jsonStr = textContent.text.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1].trim();

  const analysis: VisionAnalysis = JSON.parse(jsonStr);

  // Clamp budget multiplier
  analysis.budgetMultiplier = Math.max(0.8, Math.min(1.5, analysis.budgetMultiplier));

  return analysis;
}
