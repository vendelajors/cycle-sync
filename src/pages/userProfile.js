// ═══════════════════════════════════════════════════════
// User Profile — Single Source of Truth
// ═══════════════════════════════════════════════════════

const SUPPLEMENT_LABELS = {
  multivitamin: 'Multivitamin', vitamin_d: 'Vitamin D', vitamin_c: 'Vitamin C',
  magnesium: 'Magnesium', iron: 'Iron', omega3: 'Omega-3', probiotic: 'Probiotic',
  b_complex: 'B-Complex', zinc: 'Zinc', ashwagandha: 'Ashwagandha', maca: 'Maca',
  vitex: 'Vitex', dim: 'DIM', inositol: 'Inositol', nac: 'NAC',
  collagen: 'Collagen', creatine: 'Creatine', coq10: 'CoQ10',
}

const CYCLE_LENGTH_MAP = {
  'less_than_24': '< 24 days (short)',
  '24_26': '24–26 days',
  '27_29': '27–29 days (typical)',
  '30_32': '30–32 days',
  '33_35': '33–35 days',
  'more_than_35': '35+ days (long)',
  'irregular': 'Irregular / variable',
}

const CYCLE_LENGTH_DAYS = {
  'less_than_24': 22,
  '24_26': 25,
  '27_29': 28,
  '30_32': 31,
  '33_35': 34,
  'more_than_35': 38,
  'irregular': 28,
}

export function getEstimatedCycleLength() {
  const profile = getUserProfile()
  return CYCLE_LENGTH_DAYS[profile?.cycleLength] || 28
}

const PERIOD_LENGTH_MAP = {
  '2_3': '2–3 days (light)',
  '4_5': '4–5 days (typical)',
  '6_7': '6–7 days',
  'more_than_7': '7+ days (heavy)',
  'varies': 'Varies significantly',
}

const BC_STATUS_MAP = {
  'none': 'Not on hormonal birth control',
  'yes_hormonal': 'Currently on hormonal birth control',
  'iud_copper': 'Copper IUD (non-hormonal)',
}

const BC_HISTORY_MAP = {
  'never': 'Never used hormonal birth control',
  'less_6mo': 'Stopped hormonal BC < 6 months ago (recent — body still adjusting)',
  '6mo_1yr': 'Stopped hormonal BC 6–12 months ago',
  '1yr_2yr': 'Stopped hormonal BC 1–2 years ago',
  'more_2yr': 'Stopped hormonal BC 2+ years ago',
}

const CONDITION_LABELS = {
  pcos: 'PCOS',
  endo: 'Endometriosis',
  pmdd: 'PMDD',
  fibroids: 'Fibroids / adenomyosis',
  thyroid: 'Thyroid disorder',
  insulin_resistance: 'Insulin resistance',
  anemia: 'Anemia / low ferritin',
  ibs: 'IBS / gut issues',
  migraines: 'Menstrual migraines',
  anxiety: 'Anxiety',
  depression: 'Depression',
  autoimmune: 'Autoimmune condition',
  perimenopause: 'Perimenopause',
}

const GOAL_LABELS = {
  energy: 'More consistent energy', sleep: 'Better sleep', mood: 'Mood stability',
  hormones: 'Hormone balance', fitness: 'Fitness performance', skin: 'Skin health',
  digestion: 'Better digestion', stress: 'Stress management',
  fertility: 'Fertility awareness', weight: 'Body composition',
}

/**
 * Get the full user profile from localStorage
 */
export function getUserProfile() {
  try {
    const raw = JSON.parse(localStorage.getItem('onboardingAnswers') || '{}')

    const cycleLength = raw.cycle_length || null
    const periodLength = raw.period_length || null
    const lastPeriodDate = raw.last_period_date || null
    const trackingMethods = raw.tracking_method || []
    const birthControl = raw.birth_control || null
    const bcHistory = raw.bc_history || null
    const name = raw.name || null
    const birthday = raw.birthday || null

    // Calculate age dynamically from birthday
    const age = (() => {
      if (!birthday) return null
      const today = new Date()
      const birth = new Date(birthday)
      if (isNaN(birth.getTime())) return null
      let years = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) years--
      return years
    })()

    const goals = (raw.goals || []).filter(g => g !== 'none')
    const conditions = (raw.conditions || []).filter(c => c !== 'none')

    const wearables = (raw.wearables || []).filter(w => w !== 'none')
    const hasRecentBloodwork = raw.bloodwork || null

    // Build supplement list from onboarding
    const onboardingSupplements = (raw.current_supplements || [])
      .filter(s => s !== 'none')
      .map(s => SUPPLEMENT_LABELS[s] || s)

    // Parse free-text other_supplements field
    const otherSupplements = raw.other_supplements
      ? raw.other_supplements.split(',').map(s => s.trim()).filter(Boolean)
      : []

    // User-edited protocol takes priority over onboarding
    // This is updated any time the user adds/removes supplements in Settings
    const editedProtocol = (() => {
      try {
        const val = localStorage.getItem('suppProtocol')
        if (!val) return null
        const parsed = JSON.parse(val)
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
      } catch { return null }
    })()

    const supplements = editedProtocol ?? [...onboardingSupplements, ...otherSupplements]

    const isPostHBC = birthControl === 'none' && bcHistory && bcHistory !== 'never'
    const isRecentPostHBC = birthControl === 'none' && ['less_6mo', '6mo_1yr'].includes(bcHistory)
    const isOnHBC = birthControl === 'yes_hormonal'
    const hasPCOS = conditions.includes('pcos')
    const hasEndo = conditions.includes('endo')
    const hasPMDD = conditions.includes('pmdd')
    const hasThyroid = conditions.includes('thyroid')
    const hasInsulinResistance = conditions.includes('insulin_resistance')
    const hasMigraines = conditions.includes('migraines')
    const hasDepression = conditions.includes('depression')
    const hasAnxiety = conditions.includes('anxiety')
    const hasAutoimmune = conditions.includes('autoimmune')
    const hasPerimenopause = conditions.includes('perimenopause')
    const hasIrregularCycles = cycleLength === 'irregular' || cycleLength === 'more_than_35' || cycleLength === 'less_than_24'

    const isOlderAdult = age >= 40
    const isPerimenopauseAge = age >= 40

    return {
      name, birthday, age, ageLabel: age ? `${age} years old` : null,
      cycleLength, periodLength, lastPeriodDate, trackingMethods, birthControl, bcHistory,
      goals, conditions, wearables, hasRecentBloodwork,
      supplements, onboardingSupplements, otherSupplements,

      isPostHBC, isRecentPostHBC, isOnHBC,
      isOlderAdult, isPerimenopauseAge,
      hasPCOS, hasEndo, hasPMDD, hasThyroid, hasInsulinResistance,
      hasMigraines, hasDepression, hasAnxiety, hasAutoimmune, hasPerimenopause,
      hasIrregularCycles,

      cycleLengthLabel: CYCLE_LENGTH_MAP[cycleLength] || 'Not specified',
      periodLengthLabel: PERIOD_LENGTH_MAP[periodLength] || 'Not specified',
      birthControlLabel: BC_STATUS_MAP[birthControl] || 'Not specified',
      bcHistoryLabel: BC_HISTORY_MAP[bcHistory] || 'Not specified',
      conditionLabels: conditions.map(c => CONDITION_LABELS[c] || c),
      goalLabels: goals.map(g => GOAL_LABELS[g] || g),

      hasProfile: Object.keys(raw).length > 0,
    }
  } catch (e) {
    console.error('Error reading profile:', e)
    return { hasProfile: false, supplements: [], goals: [], conditions: [], wearables: [] }
  }
}

/**
 * Generate AI prompt context block
 */
export function getProfileContext() {
  const p = getUserProfile()
  if (!p.hasProfile) return '## User Profile\nNo profile data available yet.\n'

  let ctx = '## User Profile\n'

  if (p.name) ctx += `Name: ${p.name}\n`
  if (p.age) {
    ctx += `Age: ${p.age}\n`
    if (p.isPerimenopauseAge && !p.hasPerimenopause) {
      ctx += `→ Age context: User is ${p.age} — perimenopause can begin in the early 40s. Be attentive to cycle changes and hormonal fluctuation patterns.\n`
    }
  }

  ctx += `Cycle length: ${p.cycleLengthLabel}\n`
  ctx += `Period length: ${p.periodLengthLabel}\n`

  if (p.isOnHBC) {
    ctx += `Birth control: CURRENTLY ON HORMONAL BC — focus on general wellness rather than phase-specific hormonal advice.\n`
  } else if (p.isRecentPostHBC) {
    ctx += `Birth control: ${p.bcHistoryLabel} — IMPORTANT: post-hormonal BC recovery. Cycle may be irregular. Prioritize cycle regulation and hormone rebalancing.\n`
  } else if (p.isPostHBC) {
    ctx += `Birth control: ${p.bcHistoryLabel}\n`
  }

  if (p.conditions.length > 0) {
    ctx += `Known conditions: ${p.conditionLabels.join(', ')}\n`
    if (p.hasPCOS) ctx += `→ PCOS: Consider insulin resistance, androgen excess. Relevant: inositol, berberine, anti-inflammatory diet, strength training.\n`
    if (p.hasEndo) ctx += `→ Endometriosis: Prioritize anti-inflammatory strategies, estrogen management. Relevant: omega-3, DIM, turmeric.\n`
    if (p.hasPMDD) ctx += `→ PMDD: Prioritize luteal phase mood support, GABA-boosting nutrients, progesterone-sensitive strategies. Relevant: magnesium, B6, calcium.\n`
    if (p.hasThyroid) ctx += `→ Thyroid: BBT patterns may differ from standard. Relevant: selenium, iodine, stress management.\n`
    if (p.hasInsulinResistance) ctx += `→ Insulin resistance: Emphasize low-GI nutrition, carb timing by phase, blood sugar stability.\n`
    if (p.hasMigraines) ctx += `→ Menstrual migraines: Track hormone-shift triggers across cycle phases. Relevant: magnesium, riboflavin.\n`
    if (p.hasAnxiety) ctx += `→ Anxiety: Flag luteal phase anxiety spikes. Relevant: magnesium, ashwagandha, GABA-supporting foods.\n`
    if (p.hasDepression) ctx += `→ Depression: Track mood across phases, flag follicular/luteal mood drops. Relevant: omega-3, vitamin D, saffron.\n`
    if (p.hasAutoimmune) ctx += `→ Autoimmune: Factor in immune-hormone interactions and inflammation patterns.\n`
    if (p.hasPerimenopause) ctx += `→ Perimenopause: Adapt to irregular cycles and fluctuating hormones. Focus on sleep, bone density, mood.\n`
  }

  if (p.goals.length > 0) ctx += `Health goals: ${p.goalLabels.join(', ')}\n`
  if (p.hasIrregularCycles && !p.isOnHBC) ctx += `→ Irregular cycles: Phase estimates may be less accurate — focus on tracking patterns over multiple cycles.\n`
  if (p.supplements.length > 0) ctx += `Current supplements: ${p.supplements.join(', ')}\n`
  if (p.wearables.length > 0) ctx += `Wearables: ${p.wearables.map(w => w.replace('_', ' ')).join(', ')}\n`

  return ctx
}

/**
 * Get supplements list — used by CheckIn form and supplement protocol manager.
 * Priority: user-edited suppProtocol > onboarding answers > empty array
 */
export function getSupplements() {
  const p = getUserProfile()
  return p.supplements || []
}

/**
 * Save updated supplement protocol.
 * Call this any time the user adds or removes supplements in Settings.
 */
export function saveSupplements(supplements) {
  localStorage.setItem('suppProtocol', JSON.stringify(supplements))
}