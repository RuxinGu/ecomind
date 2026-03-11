export type DimensionExplanation = {
  suggestedLabel: string;
  definition: string;
  typicalIndicators: string[];
  whyItMatters: string;
  measurementCaveat: string;
  fairnessNote: string;
};

export const dimensionExplanations: Record<string, DimensionExplanation> = {
  A: {
    suggestedLabel: 'Reflective Grounder',
    definition:
      "This dimension reflects how often you inspect and evaluate your thoughts/feelings and how clearly you understand what's happening inside you.",
    typicalIndicators: [
      "You pause to check what you're feeling or needing before you respond.",
      "You can describe patterns in your choices (what helps you thrive vs. spiral).",
      "In relationships, you're more likely to name your internal state clearly."
    ],
    whyItMatters:
      'Clearer insight supports self-regulation and goal progress by improving self-monitoring and adjustment.',
    measurementCaveat:
      "Self-report reflection can rise during stress and doesn't always mean clarity or effectiveness.",
    fairnessNote:
      'Cultures differ in norms for self-focus and self-disclosure; interpret alongside context and language comfort.'
  },
  B: {
    suggestedLabel: 'Curious Sensemaker',
    definition:
      'This dimension reflects your tendency to enjoy effortful thinking and exploring ideas, including openness to complexity and new perspectives.',
    typicalIndicators: [
      'You like "why" questions and multi-angle conversations, even without quick closure.',
      'You notice patterns, themes, or underlying meanings in events.',
      'In relationships, you process experiences through discussion and reflection, not only action.'
    ],
    whyItMatters:
      'Enjoying effortful thinking often supports deeper information processing and more deliberate decisions.',
    measurementCaveat:
      "Cognitive style is not intelligence; it's about preference and context (time, stress, education).",
    fairnessNote:
      'Educational access and language fluency can shift how abstract items feel, so avoid treating scores as fixed capacity.'
  },
  C: {
    suggestedLabel: 'Steady Regulator',
    definition:
      'This dimension reflects how you influence emotions across the emotion cycle and which regulation strategies you tend to use.',
    typicalIndicators: [
      'Under pressure, you can slow down before reacting (or you struggle to do so).',
      'You recover from emotional spikes at a steadier or more variable pace.',
      'In relationships, you can (or cannot) stay constructive during hard conversations.'
    ],
    whyItMatters: 'Habitual regulation patterns relate to affect, relationship functioning, and overall well-being.',
    measurementCaveat:
      'Current stress, sleep quality, and recent conflict can strongly affect self-ratings of emotional regulation.',
    fairnessNote:
      'Norms for emotional expression vary across cultures and genders; lower expression may reflect socialization, not lower skill.'
  },
  D: {
    suggestedLabel: 'Secure Builder',
    definition:
      'This dimension reflects how you experience closeness, including sensitivity to rejection and comfort with emotional dependence.',
    typicalIndicators: [
      'You feel calm with closeness, or you need strong safety signals to relax.',
      'You seek reassurance and/or create distance when uncertainty rises.',
      'In relationships, unpredictability in affection can activate protective patterns.'
    ],
    whyItMatters: 'Attachment insecurity patterns are often linked to lower relationship satisfaction and stability.',
    measurementCaveat:
      'Attachment patterns can shift across relationships and life periods; they are not immutable types.',
    fairnessNote:
      'Relationship history, trauma exposure, and cultural models of closeness shape responses, so interpret with context.'
  },
  E: {
    suggestedLabel: 'Intentional Energizer',
    definition:
      'This dimension reflects whether you recharge more through social stimulation or solitude, and how you manage personal boundaries.',
    typicalIndicators: [
      'You feel restored after time alone, or restored after time with people.',
      'You prefer depth (1:1) vs. breadth (groups), especially when tired.',
      'In relationships, you need predictable space or togetherness to stay regulated.'
    ],
    whyItMatters: 'Social energy style is strongly related to affect and subjective well-being patterns.',
    measurementCaveat:
      'Social energy is context-dependent and can shift with work demands, caregiving load, health, or burnout.',
    fairnessNote:
      'Cultural expectations for sociability differ; lower-social preference is not lower warmth or competence.'
  },
  F: {
    suggestedLabel: 'Reliable Architect',
    definition:
      'This dimension reflects your preference for routine, planning, organization, and dependable follow-through.',
    typicalIndicators: [
      'You track commitments and deadlines reliably (or you struggle with consistency).',
      'You feel safer with structure, or constrained and prefer flexibility.',
      'In relationships, you reduce stress through planning and predictable follow-through.'
    ],
    whyItMatters:
      'Structure and conscientious follow-through are often linked to healthier long-term outcomes and reduced friction.',
    measurementCaveat:
      'Time scarcity, ADHD traits, and unstable schedules can lower structure scores without implying low responsibility.',
    fairnessNote:
      'Norms around punctuality/order vary by culture and working conditions; avoid moralizing one style as superior.'
  },
  G: {
    suggestedLabel: 'Calm Repairer',
    definition:
      'This dimension reflects how you handle disagreement through assertiveness and cooperativeness, including your repair behaviors.',
    typicalIndicators: [
      'You can discuss conflict calmly, or escalate/shut down when stakes rise.',
      'You aim for mutual understanding, or prioritize winning/withdrawing to feel safe.',
      'After tension, you use repair behaviors such as apology, reassurance, and clarification.'
    ],
    whyItMatters:
      'Dysregulated conflict and weak repair patterns are associated with higher risk of relationship breakdown over time.',
    measurementCaveat:
      'Conflict style changes by partner and situation; a single score cannot capture every context.',
    fairnessNote:
      'Directness norms vary across cultures and gender roles; interpret assertiveness/avoidance relative to context.'
  },
  H: {
    suggestedLabel: 'Values-Led Builder',
    definition:
      'This dimension reflects orientation toward meaning, purpose, value-consistent living, and long-term consequences.',
    typicalIndicators: [
      'You make choices based on what matters, not only what feels urgent.',
      'You seek partners with aligned values/ethics and long-term compatibility.',
      'You can articulate a personal definition of success beyond social scripts.'
    ],
    whyItMatters:
      'Meaning and values alignment are core well-being variables and often support stronger long-term compatibility choices.',
    measurementCaveat:
      'Values orientation can shift by life stage and external pressure; low scores may reflect survival mode, not shallowness.',
    fairnessNote:
      'Socioeconomic constraints and culture shape future planning and success definitions; interpret with empathy and context.'
  }
};
