export const DIMENSIONS = {
  A: 'Self-Reflection & Insight',
  B: 'Cognitive Exploration',
  C: 'Emotional Self-Regulation',
  D: 'Secure Connection',
  E: 'Social Energy & Boundaries',
  F: 'Structure & Follow-Through',
  G: 'Conflict & Communication',
  H: 'Growth & Values Alignment'
};

export const shortForm = [
  { id: 'A1', dimension: 'A', text: 'I regularly reflect on my choices and what led to them.' },
  { id: 'A2', dimension: 'A', text: 'I care more about understanding myself than making a strong impression.' },
  { id: 'A3', dimension: 'A', text: 'I often pause to think before I take action on something important.' },
  { id: 'A4', dimension: 'A', text: 'I can usually put words to what I\'m feeling or needing.' },

  { id: 'B1', dimension: 'B', text: 'I enjoy exploring abstract ideas and possibilities.' },
  { id: 'B2', dimension: 'B', text: 'I like conversations that explore multiple angles, even without a clear conclusion.' },
  { id: 'B3', dimension: 'B', text: 'I often look for patterns or meaning behind events.' },
  { id: 'B4', dimension: 'B', text: 'I\'m comfortable revising my opinions when I learn something new.' },
  { id: 'B5', dimension: 'B', text: 'I\'m more drawn to new ideas than to new thrills.' },

  { id: 'C1', dimension: 'C', text: 'Under pressure, I can usually stay steady enough to think clearly.' },
  { id: 'C2', dimension: 'C', text: 'I prefer to process strong emotions before making big decisions.' },
  { id: 'C3', dimension: 'C', text: 'Taking time alone helps me sort through my emotions.' },
  { id: 'C4', dimension: 'C', text: 'I\'m aware of specific situations or behaviors that trigger me.' },

  { id: 'D1', dimension: 'D', text: 'Emotional safety is essential for me to feel close to someone.' },
  { id: 'D2', dimension: 'D', text: 'I can be close to someone without losing my sense of independence.' },
  { id: 'D3', dimension: 'D', text: 'I feel best in relationships that build steadily over time.' },
  { id: 'D4', dimension: 'D', text: 'Consistency matters more to me than intensity.' },
  { id: 'D5', dimension: 'D', text: 'When affection feels unpredictable, it\'s hard for me to relax.' },

  { id: 'E1', dimension: 'E', text: 'Too much social interaction leaves me needing time to recharge.' },
  { id: 'E2', dimension: 'E', text: 'I prefer meaningful one-on-one time over large-group socializing.' },
  { id: 'E3', dimension: 'E', text: 'I feel comfortable being alone.' },
  { id: 'E4', dimension: 'E', text: 'Even in close relationships, I need personal space.' },
  { id: 'E5', dimension: 'E', text: 'Quiet time is an important part of my balance.' },

  { id: 'F1', dimension: 'F', text: 'I feel more grounded when I have a general routine.' },
  { id: 'F2', dimension: 'F', text: 'I prefer planning ahead over improvising most things.' },
  { id: 'F3', dimension: 'F', text: 'Disorganization tends to stress me out.' },
  { id: 'F4', dimension: 'F', text: 'I\'m most productive when I have a clear structure.' },

  { id: 'G1', dimension: 'G', text: 'I prefer resolving conflict through calm, direct conversation.' },
  { id: 'G2', dimension: 'G', text: 'I try to avoid unnecessary confrontation.' },
  { id: 'G3', dimension: 'G', text: 'After a conflict, I reflect on my role in what happened.' },
  { id: 'G4', dimension: 'G', text: 'In disagreements, I value clarity and understanding over winning.' },

  { id: 'H1', dimension: 'H', text: 'I value personal growth more than social status.' },
  { id: 'H2', dimension: 'H', text: 'I question traditional definitions of success.' },
  { id: 'H3', dimension: 'H', text: 'I care about shared values more than surface-level compatibility.' },
  { id: 'H4', dimension: 'H', text: 'I want a partner who grows with me over time.' },
  { id: 'H5', dimension: 'H', text: 'I\'m intentional about what and who I commit to long-term.' }
];

const longFormDimensionText = {
  A: [
    'I reflect deeply on my experiences.',
    'I am naturally introspective.',
    'I notice recurring patterns in my choices and relationships.',
    'I value internal clarity over external validation.',
    'I am comfortable spending time with my own thoughts.',
    'I pause before making major life decisions.',
    'I often ask myself what I am really feeling or needing right now.',
    'I learn about myself by reviewing past decisions with honesty.'
  ],
  B: [
    'I enjoy abstract thinking.',
    'I am curious about perspectives different from my own.',
    'I question assumptions easily.',
    'I enjoy complexity more than oversimplified answers.',
    'I like exploring why, not just what.',
    'I am comfortable sitting with uncertainty while I think.',
    'I look for meaning beyond surface facts.',
    'I adapt my beliefs when presented with strong new insights.'
  ],
  C: [
    'I can observe my emotions without being overwhelmed by them.',
    'I usually need time to process emotions before I speak about them.',
    'I recover emotionally at my own pace.',
    'I am aware of my emotional boundaries.',
    'In stressful moments, I can usually keep my thinking organized.',
    'I notice patterns in what sets off my emotional reactions.',
    'When I am activated, I know what helps me return to baseline.',
    'I try not to make major decisions in the heat of emotion.'
  ],
  D: [
    'Emotional safety is essential for closeness.',
    'I am comfortable with emotional intimacy.',
    'I balance closeness and independence.',
    'I value emotional consistency.',
    'I feel unsettled by emotional unpredictability.',
    'I trust connection that grows over time.',
    'I commit carefully, but deeply, once I am sure.',
    'I am drawn to relationships that feel emotionally sustainable.'
  ],
  E: [
    'I feel drained after excessive social interaction.',
    'Solitude helps me reset.',
    'I set clear personal boundaries.',
    'I do not need constant interaction to feel connected.',
    'I prefer depth over breadth in relationships.',
    'I value quiet presence with someone I trust.',
    'After busy social events, I need recovery time.',
    'I feel my best with a balance of connection and personal space.'
  ],
  F: [
    'I function best with a routine.',
    'I like planning ahead.',
    'Last-minute changes typically throw me off.',
    'Reliability matters to me.',
    'I create systems to stay organized.',
    'I feel more secure when life feels structured.',
    'I keep track of responsibilities so I do not have to hold it all in my head.',
    'I feel stressed when the environment around me is chaotic.'
  ],
  G: [
    'I seek resolution rather than dominance in conflict.',
    'I try to stay calm during disagreement.',
    'I listen before responding.',
    'I reflect on conflicts afterward to learn from them.',
    'I avoid emotional manipulation by myself or others.',
    'I prefer directness over passive tension.',
    'I can name my needs without attacking someone else\'s character.',
    'I value mutual understanding more than being right.'
  ],
  H: [
    'I prioritize growth over comfort.',
    'I define success on my own terms.',
    'I question culturally imposed life scripts.',
    'I believe growth often requires discomfort.',
    'Alignment in core values matters to me in partnership.',
    'I want a partner with compatible ethics and intentions.',
    'I think long-term when it comes to commitment.',
    'I prefer substance over appearances.'
  ]
};

export const longForm = Object.entries(longFormDimensionText).flatMap(([dimension, items]) =>
  items.map((text, index) => ({ id: `${dimension}${index + 1}`, dimension, text }))
);

export function getQuestionnaire(formType = 'short') {
  return formType === 'long' ? longForm : shortForm;
}

export function computeDimensionScores(formType, responses) {
  const items = getQuestionnaire(formType);
  const thresholdByDimension = formType === 'long'
    ? { A: 6, B: 6, C: 6, D: 6, E: 6, F: 6, G: 6, H: 6 }
    : { A: 3, B: 4, C: 3, D: 4, E: 4, F: 3, G: 3, H: 4 };

  const grouped = { A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [] };
  for (const item of items) {
    const value = responses[item.id];
    if (typeof value === 'number' && value >= 1 && value <= 5) {
      grouped[item.dimension].push(value);
    }
  }

  const result = {};
  for (const [dimension, values] of Object.entries(grouped)) {
    if (values.length < thresholdByDimension[dimension]) {
      result[dimension] = null;
      continue;
    }
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    result[dimension] = Number(mean.toFixed(2));
  }
  return result;
}

export function buildResultNarrative(scores) {
  const complete = Object.values(scores).every((value) => value !== null);
  if (!complete) {
    return {
      title: 'EcoMind In Progress',
      subtitle: 'Not enough information yet',
      description:
        'Some dimensions need more answers before we can generate a full resonance profile. You can continue anytime.'
    };
  }

  const avg = Object.values(scores).reduce((sum, v) => sum + v, 0) / 8;
  const title = avg >= 3.8 ? 'Reflective Connector' : avg >= 3 ? 'Grounded Explorer' : 'Quiet Calibrator';

  return {
    title,
    subtitle: 'Your tendencies across 8 dimensions',
    description:
      'These scores describe current tendencies, not fixed traits. Context matters, and you can revisit this profile whenever life changes.'
  };
}

const BAND_THRESHOLDS = {
  high: 3.9,
  mid: 3.0
};

export const INTERPRETATION_GUARDRAILS = [
  'EcoMind is a reflective relationship tool, not a clinical or diagnostic instrument.',
  'Scores describe tendencies in context, not fixed identity.',
  'Interpretations should guide low-stakes reflection, communication, and growth actions only.',
  'Context, culture, language, stress, and relationship stage can shift score expression.',
  'Use behavioral evidence over time; avoid overgeneralization from one result snapshot.'
];

const DIMENSION_INTERPRETATION = {
  A: {
    headline: 'Reflective Grounder',
    researchMap: 'SRIS self-reflection and insight, with reflection-versus-rumination distinction',
    highKeywords: ['introspective', 'aware', 'pattern-learning'],
    midKeywords: ['situational reflection', 'emerging clarity', 'adaptive awareness'],
    lowKeywords: ['action-forward', 'present-focused', 'less self-monitoring'],
    actions: {
      universal: [
        'Use structured reflection -> insight -> one concrete action.',
        'Separate useful reflection from rumination loops.',
        'Ask for one safe feedback signal after conflict.'
      ],
      high: [
        'Turn insights into next-step commitments to avoid overprocessing.',
        'Share process with partners, not only conclusions.',
        'Use one-sentence pattern checks: "The pattern is..."'
      ],
      mid: [
        'Run 2-minute post-decision reflection prompts.',
        'Use learning-oriented questions: "What will I do differently next time?"',
        'Cross-check self-view with one interpersonal data point.'
      ],
      low: [
        'Anchor reflection to three facts: event, emotion, need.',
        'Practice one-word in-the-moment emotion labeling.',
        'Use a weekly one-good/one-hard/one-need check-in ritual.'
      ]
    },
    microcopy:
      'You build connection through clearer self-understanding. Naming what is happening inside you creates calmer, safer conversations.',
    caveat:
      'Low scores may reflect action orientation, not low capacity; interpret with behavior over time.'
  },
  B: {
    headline: 'Curious Sensemaker',
    researchMap: 'Need for Cognition and Big Five Intellect/Openness traditions',
    highKeywords: ['idea-driven', 'meaning-seeking', 'open-minded'],
    midKeywords: ['balanced thinker', 'curious and practical', 'context-flexible'],
    lowKeywords: ['concrete', 'closure-seeking', 'pragmatic'],
    actions: {
      universal: [
        'Pair exploration with decisions to avoid analysis paralysis.',
        'Use curiosity with consent in conversations.',
        'Practice belief-updating when strong new evidence appears.'
      ],
      high: [
        'End deep conversations with one decision summary.',
        'Use interpretation checks instead of mind-reading.',
        'Balance meaning-making with action timing.'
      ],
      mid: [
        'Alternate open questions with close questions.',
        'Notice stress default (explore vs close) and flex intentionally.',
        'Use two-level dialogue: facts then meaning.'
      ],
      low: [
        'Ask one deeper question per meaningful conversation.',
        'Convert meaning to behavior: "What changes next week?"',
        'Use 10-minute explore + decide timeboxes with abstract partners.'
      ]
    },
    microcopy:
      'Mental engagement helps you feel emotionally closer. The right connection values both your curiosity and your clarity.',
    caveat:
      'Cognitive style is not intelligence; low scores can reflect efficiency preferences.'
  },
  C: {
    headline: 'Steady Regulator',
    researchMap: 'Gross process model and ERQ reappraisal/suppression evidence',
    highKeywords: ['composed', 'deliberate', 'emotionally aware'],
    midKeywords: ['partly regulated', 'context-sensitive', 'learning tools'],
    lowKeywords: ['reactive', 'flooded', 'impulsive'],
    actions: {
      universal: [
        'Pause-and-name before major emotional reactions.',
        'Use reappraisal/problem-solving over suppression loops.',
        'Pre-agree relationship repair routines after conflict.'
      ],
      high: [
        'Avoid over-control by expressing emotions clearly.',
        'Use co-regulation language with partners.',
        'Add a reconnection ritual after hard conversations.'
      ],
      mid: [
        'Identify high-risk contexts and pre-plan responses.',
        'Use name-need-next-step during tension.',
        'Set timeout-with-return agreements.'
      ],
      low: [
        'Interrupt escalation physiologically before discussion.',
        'Replace one maladaptive strategy with one adaptive alternative.',
        'Adopt pause-soothe-return-summarize repair sequence.'
      ]
    },
    microcopy:
      'Your nervous system has patterns, and patterns are trainable. Small pauses can turn intensity into trust.',
    caveat:
      'Self-report regulation varies with current stress and mood; revisit interpretations regularly.'
  },
  D: {
    headline: 'Secure Builder',
    researchMap: 'Adult attachment anxiety/avoidance frameworks (ECR/ECR-R tradition)',
    highKeywords: ['steady closeness', 'consistency-valuing', 'trust-building'],
    midKeywords: ['selective openness', 'cautious trust', 'gradual bonding'],
    lowKeywords: ['unpredictability-sensitive', 'guarded', 'anxious/avoidant'],
    actions: {
      universal: [
        'Translate needs into clear behavioral requests.',
        'Build consistency rituals in communication.',
        'Use evidence checks before threat assumptions.'
      ],
      high: [
        'Make secure behavior explicit in small commitments.',
        'Ask partner-specific safety signals.',
        'Lead hard talks with connection cues.'
      ],
      mid: [
        'Use trust increments and evaluate responsiveness.',
        'Prioritize consistency over intensity in partner choice.',
        'Clarify expectation cadence early.'
      ],
      low: [
        'Use earned-security scaffolds: boundaries + consistency + repair.',
        'Practice security priming before difficult talks.',
        'Separate alarm from evidence in relationship stories.'
      ]
    },
    microcopy:
      'Closeness works best when it feels safe and consistent. You do not need perfection; you need repairable connection.',
    caveat:
      'Attachment patterns are shaped by history and context; treat scores as current tendencies, not destiny.'
  },
  E: {
    headline: 'Intentional Energizer',
    researchMap: 'Big Five Extraversion/low-Extraversion social energy patterns',
    highKeywords: ['solitude-recharging', 'boundary-clear', 'depth-oriented'],
    midKeywords: ['rhythm-flexible', 'balanced energy', 'contextual pacing'],
    lowKeywords: ['interaction-recharging', 'stimulation-seeking', 'socially energized'],
    actions: {
      universal: [
        'Communicate recharge style explicitly.',
        'Design a shared social cadence with partners.',
        'Treat space as care, not rejection.'
      ],
      high: [
        'Use low-social-load intimacy formats.',
        'Set non-apologetic boundary language.',
        'Co-plan social plus recovery blocks.'
      ],
      mid: [
        'Track what social contexts drain vs nourish.',
        'State default and exceptions in availability.',
        'Alternate social and intimate-date formats.'
      ],
      low: [
        'Protect one quiet anchor habit daily.',
        'Practice boundary empathy for quieter partners.',
        'Prioritize direct partner check-ins over only social venting.'
      ]
    },
    microcopy:
      'You have a natural rhythm for connection. Clear pacing language helps the right person understand your commitment accurately.',
    caveat:
      'Social energy is context-dependent and not a measure of warmth or social skill.'
  },
  F: {
    headline: 'Reliable Architect',
    researchMap: 'Conscientiousness facets, implementation intentions, and habit formation dynamics',
    highKeywords: ['organized', 'planful', 'dependable'],
    midKeywords: ['adaptable structure', 'functional routine', 'balanced follow-through'],
    lowKeywords: ['spontaneous', 'variable execution', 'lower routine preference'],
    actions: {
      universal: [
        'Use if-then planning for follow-through bottlenecks.',
        'Simplify systems to reduce friction.',
        'Repeat key habits in stable contexts.'
      ],
      high: [
        'Create flex slots to prevent rigidity.',
        'Explain why structure matters emotionally.',
        'Apply planning habits to relationship rituals.'
      ],
      mid: [
        'Standardize only high-impact domains.',
        'Use one implementation intention per week.',
        'Match structure level to stress level.'
      ],
      low: [
        'Start with one cue-based micro-habit.',
        'Define minimum viable reliability with partners.',
        'Use top-1 planning instead of full overhauls.'
      ]
    },
    microcopy:
      'Consistency can make relationships lighter, not stricter. Small systems create safety and reduce preventable stress.',
    caveat:
      'Structure preferences are influenced by environment and constraints; avoid moralizing discipline.'
  },
  G: {
    headline: 'Calm Repairer',
    researchMap: 'TKI conflict modes plus regulated vs dysregulated couple conflict findings',
    highKeywords: ['resolution-seeking', 'calm directness', 'repair-oriented'],
    midKeywords: ['mixed style', 'context-dependent conflict', 'developing repair'],
    lowKeywords: ['escalatory or avoidant', 'reactive', 'shutdown-prone'],
    actions: {
      universal: [
        'Use soft start-up and active listening.',
        'Take timeouts with explicit return timing.',
        'End conflict with shared repair summary.'
      ],
      high: [
        'Pair calm tone with explicit needs.',
        'Set finish-line criteria for conflict talks.',
        'Choose conflict mode intentionally by issue stakes.'
      ],
      mid: [
        'Map default stress mode and rehearse second move.',
        'Use predictable pause-return agreements.',
        'Practice weekly low-stakes micro-conflict processing.'
      ],
      low: [
        'Regulate physiology before content discussion.',
        'Build assertiveness and cooperativeness together.',
        'Repeat one constructive behavior per conflict.'
      ]
    },
    microcopy:
      'Conflict can become proof of safety when repair is reliable. Structure beats intensity for long-term trust.',
    caveat:
      'Conflict expression norms vary by culture and history; low scores can reflect protective learning in unsafe contexts.'
  },
  H: {
    headline: 'Values-Led Builder',
    researchMap: 'MLQ meaning dimensions, SDT autonomy/competence/relatedness, and CFC future orientation',
    highKeywords: ['growth-driven', 'purpose-led', 'long-horizon'],
    midKeywords: ['balanced priorities', 'pragmatic values', 'adaptive direction'],
    lowKeywords: ['externally cued', 'present-focused', 'comfort/status pulled'],
    actions: {
      universal: [
        'Clarify non-negotiable values versus flexible preferences.',
        'Use future-consequence check-ins before commitments.',
        'Maintain meaning-building routines in relationships.'
      ],
      high: [
        'Avoid using growth language as judgment.',
        'Convert values into specific behaviors.',
        'Balance standards with partner pace differences.'
      ],
      mid: [
        'Run quarterly shared-values check-ins.',
        'Pair one long-term and one short-term win.',
        'Use presence-of-meaning and search-of-meaning prompts.'
      ],
      low: [
        'Start from lived values moments rather than abstract ideals.',
        'Use SDT triad as quick relationship compass.',
        'Add one-step longer horizon question before key choices.'
      ]
    },
    microcopy:
      'Compatibility is not only chemistry; it is shared momentum. Clear values make choices calmer and more intentional.',
    caveat:
      'Values expression depends on culture, age, and resources; low scores may reflect current constraints, not low depth.'
  }
};

function bandFromScore(score) {
  if (score >= BAND_THRESHOLDS.high) return 'high';
  if (score >= BAND_THRESHOLDS.mid) return 'mid';
  return 'low';
}

export function buildInterpretationPayload(scores) {
  const dimensionInsights = Object.entries(DIMENSION_INTERPRETATION).map(([dimension, meta]) => {
    const score = scores[dimension];
    if (score === null || score === undefined) {
      return {
        dimension,
        name: DIMENSIONS[dimension],
        status: 'insufficient_data',
        message: 'Not enough answered items for a stable interpretation yet.'
      };
    }

    const band = bandFromScore(score);
    return {
      dimension,
      name: DIMENSIONS[dimension],
      score,
      band,
      headline: meta.headline,
      researchMap: meta.researchMap,
      keywords: meta[`${band}Keywords`],
      growthActions: meta.actions[band],
      universalActions: meta.actions.universal,
      microcopy: meta.microcopy,
      caveat: meta.caveat
    };
  });

  return {
    guardrails: INTERPRETATION_GUARDRAILS,
    interpretationPolicy:
      'Use these insights for reflection, communication, and preference-matching. Do not treat them as diagnosis or high-stakes prediction.',
    dimensions: dimensionInsights
  };
}
