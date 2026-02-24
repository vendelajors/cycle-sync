// Cycle phase data for dashboard + detail page

export const PHASE_DATA = {
  menstrual: {
    name: 'Menstrual',
    days: '1–5',
    color: '#C4948A',
    colorLight: '#C4948A15',
    emoji: '🌑',
    tagline: 'Rest & restore',
    body: 'Hormone levels are at their lowest. Your body is shedding the uterine lining, which can bring fatigue, cramps, and lower energy.',
    workout: 'Gentle movement — yoga, walking, stretching. Honor your body\'s need to slow down.',
    nutrition: 'Iron-rich foods (red meat, spinach, lentils), warming meals, and anti-inflammatory foods. Stay hydrated.',
    hormones: 'Estrogen and progesterone are at their lowest point. FSH begins to rise toward the end of this phase, signaling your body to start preparing the next egg.',
    mood: 'You may feel more introspective, tired, or emotionally sensitive. This is normal — your body is doing hard work. Give yourself permission to slow down.',
    skin: 'Skin may be drier and more sensitive. This is a good time for gentle, hydrating skincare rather than active ingredients.',
    sleep: 'You may need more sleep than usual. Prioritize rest and don\'t fight the fatigue.',
    supplements: 'Focus on iron (especially if you have heavy periods), magnesium for cramps, and omega-3s for inflammation.',
    doThis: ['Prioritize sleep and rest', 'Eat warming, iron-rich meals', 'Gentle yoga or walks', 'Journal or reflect', 'Use a heating pad for cramps'],
    avoidThis: ['Intense HIIT or heavy lifting', 'Skipping meals', 'Over-scheduling yourself', 'Excessive caffeine'],
  },
  follicular: {
    name: 'Follicular',
    days: '6–13',
    color: '#9BAF93',
    colorLight: '#9BAF9315',
    emoji: '🌒',
    tagline: 'Build & create',
    body: 'Estrogen is rising steadily, boosting energy, mood, and cognitive function. You\'ll likely feel more motivated and social.',
    workout: 'Great time for challenging workouts — strength training, HIIT, trying new classes. Your body recovers faster now.',
    nutrition: 'Focus on lean proteins, fresh vegetables, and fermented foods. Your metabolism is slightly lower, so lighter meals feel good.',
    hormones: 'Estrogen rises as follicles develop in the ovaries. FSH stimulates follicle growth, and one dominant follicle emerges. Testosterone begins to rise too.',
    mood: 'Rising estrogen boosts serotonin and dopamine. You may feel more optimistic, creative, and confident. Great time to start new projects or have important conversations.',
    skin: 'Estrogen promotes collagen production — skin tends to look its best during this phase. Good time to try new products or get treatments.',
    sleep: 'Sleep quality tends to be good. You may naturally wake earlier and feel more rested.',
    supplements: 'B vitamins to support energy metabolism, probiotics for gut health, and vitamin E.',
    doThis: ['Start new projects or goals', 'Schedule challenging workouts', 'Be social — plan dates or events', 'Try new recipes or activities', 'Schedule important meetings'],
    avoidThis: ['Playing it too safe — take advantage of high energy', 'Ignoring your hunger cues', 'Staying isolated'],
  },
  ovulation: {
    name: 'Ovulation',
    days: '14–16',
    color: '#C9A96E',
    colorLight: '#C9A96E15',
    emoji: '🌕',
    tagline: 'Peak power',
    body: 'Estrogen and testosterone peak — you\'re at your most energetic, confident, and communicative. Cervical mucus changes to egg-white consistency.',
    workout: 'Peak performance window. Go for PRs, high-intensity workouts, group fitness. Your body can handle the most right now.',
    nutrition: 'Lighter, raw foods feel great — salads, smoothies, fresh fruit. Support your liver with cruciferous vegetables (broccoli, kale) to metabolize estrogen.',
    hormones: 'LH surges to trigger egg release. Estrogen and testosterone are at their peak. You may notice increased libido and energy.',
    mood: 'This is typically when you feel your best — most confident, articulate, and magnetic. Great time for presentations, dates, or difficult conversations.',
    skin: 'Skin is glowing thanks to peak estrogen. Some may notice slight oiliness as testosterone peaks.',
    sleep: 'Body temperature rises slightly after ovulation. You may feel warmer at night.',
    supplements: 'Zinc to support the egg release process, vitamin C, and fiber to help metabolize excess estrogen.',
    doThis: ['Schedule presentations or interviews', 'Do your hardest workouts', 'Have important conversations', 'Go on dates', 'Take on leadership roles'],
    avoidThis: ['Wasting this high-energy window on low-priority tasks', 'Skipping workouts', 'Ignoring your body temperature changes'],
  },
  luteal: {
    name: 'Luteal',
    days: '17–28',
    color: '#A1928C',
    colorLight: '#A1928C15',
    emoji: '🌖',
    tagline: 'Wind down & nourish',
    body: 'Progesterone rises and peaks, then drops if no pregnancy occurs. Energy gradually decreases. PMS symptoms may appear in the late luteal phase.',
    workout: 'Moderate intensity — pilates, swimming, moderate strength training. Scale back as you approach your period.',
    nutrition: 'Complex carbs (sweet potatoes, oats, brown rice) to support serotonin production. Magnesium-rich foods. Your metabolism speeds up — honor increased hunger.',
    hormones: 'Progesterone dominates this phase, produced by the corpus luteum. If the egg isn\'t fertilized, both progesterone and estrogen drop toward the end, triggering your period.',
    mood: 'The first half may feel calm and grounded (progesterone\'s effect). The second half, as hormones drop, can bring irritability, anxiety, or sadness — classic PMS.',
    skin: 'Progesterone increases sebum production, making breakouts more likely. Stick to gentle cleansing and avoid harsh treatments.',
    sleep: 'Progesterone is a natural sedative — you may feel sleepier. But late luteal hormone drops can disrupt sleep quality.',
    supplements: 'Magnesium for PMS and sleep, B6 for mood support, calcium, and evening primrose oil.',
    doThis: ['Meal prep and organize', 'Do pilates or moderate workouts', 'Prioritize sleep hygiene', 'Eat complex carbs — don\'t restrict', 'Practice stress management'],
    avoidThis: ['Extreme dieting or calorie restriction', 'Over-committing socially', 'Ignoring PMS symptoms', 'Excessive alcohol or caffeine'],
  },
}

export const BLOODWORK_INSIGHTS = {
  'FERRITIN': {
    priority: 1,
    low: 'Your iron stores are depleted — very common in menstruating women. This can cause fatigue, brain fog, and hair thinning. Consider iron supplementation with vitamin C for absorption.',
    high: 'Elevated ferritin can indicate inflammation or iron overload. Worth discussing with your doctor.',
  },
  'HOMOCYSTEINE': {
    priority: 2,
    high: 'Elevated homocysteine often points to a need for more folate or B12. If your MMA is normal, folate is likely the priority. Methylated B vitamins can help.',
    low: 'Low homocysteine is generally not a concern.',
  },
  'LDL-CHOLESTEROL': {
    priority: 3,
    high: 'Your LDL is slightly above optimal. At 25, this is worth monitoring but not alarming. Increasing fiber, omega-3s, and exercise can help over time.',
    low: 'Low LDL is generally favorable for heart health.',
  },
  'EPA+DPA+DHA': {
    priority: 4,
    low: 'Your omega-3 levels are below optimal, which affects inflammation and heart health. Consider a high-quality fish oil supplement (aim for 1-2g EPA+DHA daily).',
    high: 'High omega-3s are generally beneficial.',
  },
  'LDL PARTICLE NUMBER': {
    priority: 5,
    high: 'Your LDL particle count is elevated, which is a more detailed cardiovascular risk marker than standard LDL. Focus on reducing refined carbs and increasing healthy fats.',
    low: 'Low particle number is favorable.',
  },
  'LDL SMALL': {
    priority: 6,
    high: 'Small dense LDL particles are more likely to contribute to arterial plaque. Reducing sugar and refined carbs while increasing omega-3s can shift the pattern.',
    low: 'Low small LDL is favorable.',
  },
  'HDL LARGE': {
    priority: 7,
    low: 'Large HDL particles are the most protective for heart health. Exercise, omega-3s, and healthy fats (avocado, olive oil, nuts) help increase them.',
    high: 'High large HDL is very favorable.',
  },
  'DPA': {
    priority: 8,
    low: 'DPA is an omega-3 fatty acid that supports heart and brain health. Increasing fatty fish or fish oil supplementation can help.',
    high: 'Generally not a concern.',
  },
  'VITAMIN D,25-OH,TOTAL,IA': {
    priority: 3,
    low: 'Vitamin D deficiency affects mood, immunity, and bone health. Supplement with D3 + K2, especially in winter months.',
    normal: 'Your vitamin D is in range but on the lower end. Many practitioners suggest 50-80 ng/mL as optimal.',
  },
  'TSH': {
    priority: 2,
    high: 'Elevated TSH may indicate your thyroid is underperforming. Worth monitoring with follow-up labs.',
    low: 'Low TSH could indicate an overactive thyroid.',
  },
  'ANA SCREEN, IFA': {
    priority: 6,
    abnormal: 'A positive ANA at low titer (1:80) with dense fine speckled pattern is common in healthy individuals and doesn\'t necessarily indicate autoimmune disease. Worth monitoring but not cause for alarm.',
  },
  'ANA TITER': {
    priority: 7,
    high: 'A 1:80 titer is considered low-level positive. The dense fine speckled pattern is the most common in healthy people. Monitor over time — a single result isn\'t diagnostic.',
  },
  'LEUKOCYTE ESTERASE': {
    priority: 9,
    abnormal: 'A trace positive leukocyte esterase can occur from sample contamination. Since your WBC and bacteria were negative, this is likely not significant.',
  },
}

export function getPhaseFromDay(day) {
  const d = parseInt(day)
  if (!d) return null
  if (d <= 5) return 'menstrual'
  if (d <= 13) return 'follicular'
  if (d <= 16) return 'ovulation'
  return 'luteal'
}

/**
 * Factory: creates an assignPhase function anchored to a detected ovulation day.
 * Use this everywhere instead of calling getPhaseFromDay directly, so phase
 * assignments are consistent across the cycle map, recommendations, correlations,
 * and symptom tracking.
 *
 * @param {number|null} detectedOvulDay - cycle_day of detected ovulation (from BBT/CM), or null
 * @param {string[]} ewcmValues - list of CM strings that indicate fertile mucus
 * @returns {function} (checkin) => phase string
 */
export function makeAssignPhase(detectedOvulDay = null, ewcmValues = ['egg white', 'egg_white', 'ewcm', 'stretchy', 'watery']) {
  return function assignPhase(c) {
    const cycleDay = parseInt(c.cycle_day)
    // 1. Anchor to BBT/ring detected ovulation day if available
    if (detectedOvulDay && !isNaN(cycleDay)) {
      if (cycleDay >= detectedOvulDay - 1 && cycleDay <= detectedOvulDay + 1) return 'ovulation'
      if (cycleDay < detectedOvulDay - 1) return cycleDay <= 5 ? 'menstrual' : 'follicular'
      return 'luteal'
    }
    // 2. Check if this specific day had EWCM logged (ovulation signal)
    const dayHasCM = c.cervical_mucus && ewcmValues.some(v => c.cervical_mucus.toLowerCase().includes(v))
    if (dayHasCM) return 'ovulation'
    // 3. Fall back to hardcoded day ranges
    return getPhaseFromDay(c.cycle_day)
  }
}

export function getTopBloodworkInsights(flaggedResults, maxCount = 5) {
  const insights = []

  flaggedResults.forEach((result) => {
    const name = result.test_name?.toUpperCase()
    const matchKey = Object.keys(BLOODWORK_INSIGHTS).find((key) =>
      name?.includes(key.toUpperCase())
    )
    if (matchKey) {
      const insight = BLOODWORK_INSIGHTS[matchKey]
      const context =
        insight[result.status] || insight.abnormal || insight.normal || ''
      if (context) {
        insights.push({
          ...result,
          context,
          priority: insight.priority,
        })
      }
    }
  })

  const seen = new Set()
  return insights
    .sort((a, b) => a.priority - b.priority)
    .filter((item) => {
      const key = Object.keys(BLOODWORK_INSIGHTS).find((k) =>
        item.test_name?.toUpperCase().includes(k.toUpperCase())
      )
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, maxCount)
}