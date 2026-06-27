// FLOXA Platform — shared runtime constants
export const PERSONALITY_CLUSTERS = [
    { name: 'Warm Human', min: -3, max: -1.8, description: 'Empathetic, approachable, people-first', toneArchetype: 'The Friend', brandArchetype: 'The Caregiver' },
    { name: 'Heritage Craft', min: -1.8, max: -0.8, description: 'Rooted in tradition, quality-driven, artisan', toneArchetype: 'The Storyteller', brandArchetype: 'The Creator' },
    { name: 'Approachable Modern', min: -0.8, max: -0.2, description: 'Friendly, fresh, accessible premium', toneArchetype: 'The Guide', brandArchetype: 'The Everyman' },
    { name: 'Bold Challenger', min: -0.2, max: 0.5, description: 'Disruptive, confident, category-defining', toneArchetype: 'The Challenger', brandArchetype: 'The Rebel' },
    { name: 'Elevated Heritage', min: 0.5, max: 1.5, description: 'Refined, authoritative, timeless luxury', toneArchetype: 'The Expert', brandArchetype: 'The Ruler' },
    { name: 'Luxury Premium', min: 1.5, max: 3.1, description: 'Exclusive, ultra-premium, aspirational', toneArchetype: 'The Curator', brandArchetype: 'The Magician' },
];
export const PROJECT_STATUS_PCT = {
    CREATED: 5,
    PROFILE_COMPLETE: 15,
    DISCOVERY_COMPLETE: 30,
    VISUAL_SELECTED: 40,
    AGREEMENT_SENT: 44,
    AGREEMENT_SIGNED: 50,
    ADVANCE_PAID: 55,
    MOODBOARD_UPLOADED: 58,
    MOODBOARD_SELECTED: 65,
    CONCEPTS_UPLOADED: 68,
    CONCEPT_APPROVED: 80,
    MID_PAID: 83,
    FINAL_UPLOADED: 90,
    FINAL_APPROVED: 95,
    FINAL_PAID: 98,
    DELIVERED: 100,
    ARCHIVED: 100,
};
