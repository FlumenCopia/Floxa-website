// src/lib/brand-dna.ts
// FLOXA Brand DNA Generation Engine
// Runs server-side after discovery_complete
import { PERSONALITY_CLUSTERS } from '@/types';
// ── CLUSTER ALGORITHM ─────────────────────────
export function calculatePersonalityCluster(sliders) {
    const vals = Object.values(sliders).filter(v => v !== undefined);
    if (!vals.length)
        return PERSONALITY_CLUSTERS[3]; // Bold Challenger default
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    // Special rules for sub-clusters
    const expensive = sliders.economicalExpensive ?? 0;
    const classic = sliders.classicContemporary ?? 0;
    const simple = sliders.simpleComplex ?? 0;
    const contemporary = sliders.classicContemporary ?? 0;
    if (avg >= 0.5 && avg < 1.5) {
        if (expensive > 1 && classic < 0)
            return { ...PERSONALITY_CLUSTERS[4], name: 'Elevated Heritage' };
        if (simple < -1 && contemporary > 1)
            return { ...PERSONALITY_CLUSTERS[4], name: 'Minimal Tech' };
    }
    return PERSONALITY_CLUSTERS.find(c => avg >= c.min && avg < c.max) ?? PERSONALITY_CLUSTERS[3];
}
// ── TONE ARCHETYPE ────────────────────────────
const TONE_MATRIX = {
    'The Friend': { descriptors: ['Warm', 'Conversational', 'Empathetic'], dos: ['Use "we" and "you"', 'Tell stories', 'Celebrate small wins'], donts: ['Be cold or corporate', 'Use jargon', 'Lecture the reader'] },
    'The Expert': { descriptors: ['Direct', 'Authoritative', 'Precise'], dos: ['Lead with facts', 'Use specific numbers', 'Reference expertise'], donts: ['Be vague', 'Overqualify', 'Use filler words'] },
    'The Challenger': { descriptors: ['Bold', 'Provocative', 'Energetic'], dos: ['Challenge conventions', 'Use strong verbs', 'Take clear positions'], donts: ['Play it safe', 'Be apologetic', 'Hedge every statement'] },
    'The Storyteller': { descriptors: ['Evocative', 'Rich', 'Narrative-driven'], dos: ['Paint vivid pictures', 'Use sensory language', 'Build tension and release'], donts: ['List features', 'Be transactional', 'Rush to the point'] },
    'The Curator': { descriptors: ['Refined', 'Discerning', 'Intentional'], dos: ['Choose words deliberately', 'Reference cultural touchstones', 'Show, never tell'], donts: ['Use hyperbole', 'Be loud or brash', 'Over-explain'] },
    'The Guide': { descriptors: ['Helpful', 'Clear', 'Reassuring'], dos: ['Break things down simply', 'Anticipate questions', 'Validate the reader'], donts: ['Assume knowledge', 'Be condescending', 'Skip context'] },
};
// ── EMOTION SUMMARY ───────────────────────────
function buildEmotionSummary(emotions) {
    if (!emotions.length)
        return 'Confident and purposeful.';
    const top = emotions.slice(0, 3).join(', ');
    return `${top} — with a sense of ${emotions.slice(3, 5).join(' and ') || 'quiet purpose'}.`;
}
// ── AUDIENCE PROFILE ──────────────────────────
const AUDIENCE_PROFILES = {
    'Budget Conscious': 'Value-driven buyers who research extensively before committing. They respond to transparency, honesty about pricing, and proof of ROI.',
    'Quality Seeker': 'Quality-driven professionals who accept a premium price when quality is visibly justified. They respect craft, attention to detail, and longevity.',
    'Trend Follower': 'Culturally aware early adopters who want to be first. They respond to newness, social proof, and aesthetic relevance.',
    'Premium Loyalist': 'Brand-loyal high-value customers who buy identity as much as function. They expect exclusivity, impeccable service, and consistent luxury.',
};
// ── POSITIONING GAP ───────────────────────────
function buildPositioningGap(competitors) {
    const liked = competitors.filter(c => c.rating === 'like').map(c => c.name);
    const disliked = competitors.filter(c => c.rating === 'dislike').map(c => c.name);
    if (!competitors.length)
        return 'No competitor data provided — positioning gap to be determined in consultation.';
    if (disliked.length > liked.length) {
        return `Opportunity: The market is dominated by brands that feel ${disliked.length > 1 ? 'either cold or inaccessible' : 'disconnected from the customer'}. There is clear space for a brand that is premium yet approachable.`;
    }
    return `The market has strong players in ${liked.map(l => `"${l}"`).join(', ')}. Your advantage lies in deeper personalisation and a clearer brand voice.`;
}
// ── POSITIONING STATEMENT ─────────────────────
function buildPositioningStatement(company, industry, audience, cluster) {
    const audProfile = AUDIENCE_PROFILES[audience] || 'discerning professionals';
    return `For ${audProfile.split('.')[0].toLowerCase()}, ${company} is the ${industry.toLowerCase().replace('_', ' ')} brand that ${cluster.name === 'Elevated Heritage' ? 'earns its reputation through craft and consistency' : cluster.name === 'Bold Challenger' ? 'redefines what the category stands for' : 'delivers genuine value without compromise'} — because we believe clarity creates confidence.`;
}
// ── TAGLINE OPTIONS ───────────────────────────
const TAGLINE_PATTERNS = {
    'Warm Human': ['Made for the people who matter.', 'Real brands. Real people.', 'Built on connection.'],
    'Heritage Craft': ['Craft that earns its price.', 'Made once, kept forever.', 'The standard, not the trend.'],
    'Approachable Modern': ['Clarity for the modern brand.', 'Simple. Smart. Yours.', 'Designed to feel right.'],
    'Bold Challenger': ['Not for everyone. Built for you.', 'We changed the question.', 'The brand the category needed.'],
    'Elevated Heritage': ['Built to outlast.', 'Excellence, without announcement.', 'The kind that gets passed down.'],
    'Luxury Premium': ['Exclusivity, earned.', 'For those who recognise the difference.', 'Only the essential remains.'],
    'Minimal Tech': ['Precision by design.', 'Less noise. More signal.', 'Built with intention.'],
};
// ── MAIN GENERATOR ────────────────────────────
export function generateBrandDNA(data) {
    const cluster = calculatePersonalityCluster(data.clientSliders);
    const toneInfo = TONE_MATRIX[cluster.toneArchetype] ?? TONE_MATRIX['The Expert'];
    const posGap = buildPositioningGap(data.competitors);
    const posStatement = buildPositioningStatement(data.company, data.industry, data.audienceArchetype, cluster);
    const taglines = TAGLINE_PATTERNS[cluster.name] ?? TAGLINE_PATTERNS['Bold Challenger'];
    const audienceProf = AUDIENCE_PROFILES[data.audienceArchetype] ?? 'Discerning professionals who value quality.';
    const emotionSumm = buildEmotionSummary(data.emotions);
    return {
        personalityCluster: cluster.name,
        toneArchetype: cluster.toneArchetype,
        toneDescriptors: toneInfo.descriptors,
        toneDos: toneInfo.dos,
        toneDonts: toneInfo.donts,
        brandArchetype: cluster.brandArchetype,
        positioningGap: posGap,
        positioningStatement: posStatement,
        taglineOptions: taglines,
        audienceProfile: audienceProf,
        emotionSummary: emotionSumm,
        brandPromise: `We commit to ${toneInfo.descriptors[0].toLowerCase()} communication and ${cluster.name === 'Elevated Heritage' ? 'uncompromising quality' : 'consistent delivery'} in every interaction.`,
        visualBrief: `A ${cluster.name.toLowerCase()} aesthetic. ${data.emotions.slice(0, 2).join(' and ')} as the emotional foundation. Typography should feel ${data.clientSliders.classicContemporary && data.clientSliders.classicContemporary > 1 ? 'contemporary and purposeful' : 'rooted and authoritative'}. Colour palette should reinforce a sense of ${data.emotions[0]?.toLowerCase() ?? 'confidence'} — restrained but deliberate.`,
        generatedAt: new Date().toISOString(),
    };
}
