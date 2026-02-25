/**
 * Evidence-Based Cycle Syncing Research Database
 *
 * Every recommendation includes:
 * - mechanism: WHY it works (hormonal/physiological basis)
 * - source: Published study or systematic review
 * - tags: for smart retrieval (symptom/biometric matching)
 *
 * Sources prioritized: PubMed, Cochrane reviews, peer-reviewed journals
 * Last updated: Feb 2026
 */

export const RESEARCH_DB = {

    // ═══════════════════════════════════════════
    // MENSTRUAL PHASE (Days 1-5)
    // Hormones: Estrogen + progesterone at lowest
    // ═══════════════════════════════════════════
    menstrual: {
      hormoneContext: "Both estrogen and progesterone are at their lowest levels. The uterine lining sheds, causing blood loss. Prostaglandins trigger uterine contractions. Energy and iron stores may be depleted. Inflammatory markers tend to be elevated. Core body temperature drops to its cycle low.",
  
      nutrition: [
        {
          rec: "Iron-rich foods: red meat, liver, spinach, lentils, dark chocolate",
          mechanism: "Menstrual blood loss depletes iron stores; average loss is 30-40ml blood per cycle, equivalent to 15-20mg iron. Heme iron from animal sources has 15-35% absorption vs 2-20% for plant sources.",
          source: "Hallberg L, et al. Iron absorption from Southeast Asian diets. Am J Clin Nutr. 1977;30(4):539-548",
          tags: ["fatigue", "iron", "heavy_flow", "anemia"]
        },
        {
          rec: "Omega-3 fatty acids: salmon, sardines, walnuts, flaxseed",
          mechanism: "Omega-3s (EPA/DHA) competitively inhibit omega-6 conversion to pro-inflammatory prostaglandins (PGE2, PGF2α), reducing uterine cramping intensity. 1080mg EPA + 720mg DHA showed significant pain reduction.",
          source: "Rahbar N, et al. Effect of omega-3 fatty acids on intensity of primary dysmenorrhea. Int J Gynaecol Obstet. 2012;117(1):45-47",
          tags: ["cramps", "pain", "inflammation", "dysmenorrhea"]
        },
        {
          rec: "Anti-inflammatory foods: turmeric, ginger, berries, leafy greens",
          mechanism: "Curcumin inhibits COX-2 and NF-κB inflammatory pathways. Ginger (250mg 4x/day) shown to be as effective as ibuprofen for menstrual pain in RCTs. Berries provide anthocyanins that modulate inflammatory prostaglandins.",
          source: "Ozgoli G, et al. Comparison of effects of ginger, mefenamic acid, and ibuprofen on pain in women with primary dysmenorrhea. J Altern Complement Med. 2009;15(2):129-132",
          tags: ["cramps", "pain", "inflammation", "nausea"]
        },
        {
          rec: "Vitamin C-rich foods with iron sources: citrus, bell peppers, strawberries",
          mechanism: "Vitamin C (ascorbic acid) enhances non-heme iron absorption by reducing ferric to ferrous iron and forming soluble chelates. 100mg vitamin C can increase iron absorption 4-fold.",
          source: "Hallberg L, et al. The role of vitamin C in iron absorption. Int J Vitam Nutr Res Suppl. 1989;30:103-108",
          tags: ["iron", "fatigue", "anemia"]
        },
        {
          rec: "Warm, cooked foods: soups, stews, bone broth",
          mechanism: "Warm foods support digestion during a time when prostaglandins can cause GI symptoms (diarrhea, nausea). Bone broth provides glycine which supports anti-inflammatory pathways and gut lining integrity.",
          source: "Bernstein MT, et al. Gastrointestinal symptoms before and during menses in healthy women. BMC Womens Health. 2014;14:14",
          tags: ["nausea", "digestion", "bloating", "diarrhea"]
        },
        {
          rec: "Reduce alcohol completely during menstruation",
          mechanism: "Alcohol increases prostaglandin production, worsening cramping and inflammation. It depletes B vitamins and magnesium needed for pain modulation, and disrupts the sleep architecture already compromised by hormone withdrawal.",
          source: "Parazzini F, et al. Diet and endometriosis risk: a literature review. Reprod Biomed Online. 2013;26(4):323-336",
          tags: ["cramps", "sleep", "inflammation"]
        }
      ],
  
      supplements: [
        {
          rec: "Magnesium glycinate 300-400mg",
          mechanism: "Magnesium modulates prostaglandin synthesis, relaxes uterine smooth muscle, and reduces pain perception via NMDA receptor antagonism. Menstrual magnesium levels are measurably lower than other cycle phases.",
          source: "Parazzini F, et al. Magnesium in the gynecological practice: a literature review. Magnes Res. 2017;30(1):1-7",
          tags: ["cramps", "pain", "sleep", "anxiety", "headache"]
        },
        {
          rec: "Iron bisglycinate 18-27mg (if heavy flow)",
          mechanism: "Chelated iron bisglycinate has superior absorption and fewer GI side effects than ferrous sulfate. Heavy menstrual bleeding (>80ml/cycle) significantly increases iron deficiency risk and fatigue.",
          source: "Milman N, et al. Iron status in 268 Danish women aged 18-30 years. Ann Hematol. 1999;78(3):97-102",
          tags: ["heavy_flow", "fatigue", "anemia", "iron"]
        },
        {
          rec: "Omega-3 fish oil 1-2g EPA/DHA",
          mechanism: "Supplemental omega-3s at 1080mg EPA + 720mg DHA for 2 months significantly reduced menstrual pain intensity and rescue analgesic use in a randomized controlled trial.",
          source: "Rahbar N, et al. Int J Gynaecol Obstet. 2012;117(1):45-47",
          tags: ["cramps", "pain", "inflammation"]
        },
        {
          rec: "Zinc 15-30mg",
          mechanism: "Zinc is lost during menstruation and is critical for prostaglandin metabolism via 15-PGDH enzyme activity. Zinc supplementation (30mg/day) reduced duration and severity of menstrual cramps in an RCT.",
          source: "Eby GA. Zinc treatment prevents dysmenorrhea. Med Hypotheses. 2007;69(2):297-301",
          tags: ["cramps", "pain", "immune"]
        },
        {
          rec: "Vitamin D3 2000 IU",
          mechanism: "Vitamin D receptors exist in uterine tissue and modulate prostaglandin production. A single high-dose vitamin D (300,000 IU) 5 days before menses reduced pain scores by 41% vs placebo.",
          source: "Lasco A, et al. Improvement of primary dysmenorrhea caused by a single oral dose of vitamin D. Arch Intern Med. 2012;172(4):366-367",
          tags: ["cramps", "pain", "immune", "fatigue"]
        },
        {
          rec: "Thiamine (B1) 100mg",
          mechanism: "In an RCT of 556 women, thiamine 100mg/day for 90 days completely eliminated dysmenorrhea in 87% of participants. B1 is involved in cellular energy metabolism and nerve signal transmission.",
          source: "Gokhale LB. Curative treatment of primary (spasmodic) dysmenorrhoea. Indian J Med Res. 1996;103:227-231",
          tags: ["cramps", "pain", "fatigue"]
        }
      ],
  
      exercise: [
        {
          rec: "Light walking 20-30 minutes",
          mechanism: "Low-intensity aerobic exercise increases endorphin and enkephalin release (natural analgesics) and improves pelvic blood flow, reducing ischemic cramping. Does not further deplete an already taxed system.",
          source: "Daley AJ. Exercise and primary dysmenorrhea: a comprehensive and critical review. Sports Med. 2008;38(8):659-670",
          tags: ["cramps", "fatigue", "mood"]
        },
        {
          rec: "Gentle yoga (restorative, yin: supta baddha konasana, cat-cow, child's pose)",
          mechanism: "Specific yoga postures increase pelvic circulation and activate the parasympathetic nervous system, reducing pain via vagal tone. A 12-week yoga intervention reduced menstrual pain and emotional distress.",
          source: "Rakhshaee Z. Effect of three yoga poses on dysmenorrhea. J Pediatr Adolesc Gynecol. 2011;24(4):192-196",
          tags: ["cramps", "pain", "anxiety", "mood"]
        },
        {
          rec: "Avoid high-intensity training on heavy flow days",
          mechanism: "Cortisol is already elevated during menstruation. High-intensity exercise further raises cortisol, worsening inflammation, fatigue, and immune suppression. Training performance is measurably lower on day 1-2.",
          source: "Hackney AC. Stress and the neuroendocrine system: the role of exercise as a stressor and modifier. Expert Rev Endocrinol Metab. 2006;1(6):783-792",
          tags: ["fatigue", "recovery", "hrv_low"]
        },
        {
          rec: "Swimming if comfortable: warm water provides therapeutic heat effect",
          mechanism: "Warm water immersion reduces pain perception via gate control theory and promotes muscle relaxation. The buoyancy reduces pelvic pressure. Light swimming maintained fitness while reducing perceived exertion.",
          source: "Kannan P, Claydon LS. Some physiotherapy treatments may relieve menstrual pain. J Physiother. 2014;60(2):68-73",
          tags: ["cramps", "pain", "fatigue"]
        }
      ],
  
      sleep: [
        {
          rec: "Prioritize 8-9 hours; use a slightly warmer environment than luteal phase",
          mechanism: "Core temperature drops to its cycle lowest during menstruation, aiding sleep onset. However, cramps and GI symptoms frequently disrupt sleep. Studies show 50% of women report sleep disturbance on day 1-2.",
          source: "Baker FC, Driver HS. Circadian rhythms, sleep, and the menstrual cycle. Sleep Med. 2007;8(6):613-622",
          tags: ["sleep", "fatigue", "insomnia"]
        },
        {
          rec: "Magnesium glycinate 200mg 30 minutes before bed",
          mechanism: "Magnesium activates the parasympathetic nervous system and GABA receptors, reducing the pain-related arousal that disrupts sleep during menstruation. Glycine component also has independent sleep-promoting effects.",
          source: "Wienecke E, Nolden C. Long-term HRV analysis shows stress reduction by magnesium intake. MMW Fortschr Med. 2016;158(Suppl 6):12-16",
          tags: ["sleep", "insomnia", "cramps", "anxiety"]
        }
      ],
  
      symptoms: {
        cramps: {
          rec: "Heat therapy (40°C), magnesium, ginger tea, light movement, TENS if severe",
          mechanism: "Topical heat was non-inferior to ibuprofen for dysmenorrhea in an RCT (OR 1.0). Heat increases blood flow and relaxes smooth muscle via thermoreceptor activation. TENS provides pain gate control.",
          source: "Akin M, et al. Continuous low-level topical heat in the treatment of dysmenorrhea. Obstet Gynecol. 2001;97(3):343-349",
          tags: ["cramps", "pain"]
        },
        fatigue: {
          rec: "Iron-rich meals with vitamin C, B1 100mg, 8+ hours sleep, limit caffeine after noon",
          mechanism: "Prostaglandin withdrawal + blood loss drive fatigue. Iron depletion reduces hemoglobin oxygen-carrying capacity. Caffeine's 5-6 hour half-life compounds the sleep disruption already common in menstruation.",
          source: "Baker FC, Driver HS. Sleep Med. 2007;8(6):613-622",
          tags: ["fatigue", "energy_low", "iron"]
        },
        bloating: {
          rec: "Reduce sodium, increase potassium (banana, avocado), drink 2-3L water, dandelion tea",
          mechanism: "Prostaglandins cause local fluid retention. Potassium counteracts sodium-mediated water retention via Na+/K+ ATPase. Increased water intake reduces bloating by improving renal clearance.",
          source: "White CP, et al. Fluid retention over the menstrual cycle. Obstet Gynecol. 2011;118(6):1293-1300",
          tags: ["bloating", "fluid_retention"]
        },
        headache: {
          rec: "Magnesium 400mg, stay well hydrated, reduce processed foods, avoid skipping meals",
          mechanism: "Menstrual migraines are triggered by estrogen withdrawal. Magnesium deficiency is found in 50% of migraine sufferers and supplementation reduces attack frequency by 41%. Hypoglycemia is a known trigger.",
          source: "Peikert A, et al. Prophylaxis of migraine with oral magnesium: results from a prospective, multi-center, placebo-controlled, double-blind RCT. Cephalalgia. 1996;16(4):257-263",
          tags: ["headache", "migraine", "hormone_headache"]
        },
        lowLibido: {
          rec: "Rest and self-compassion; this is physiologically normal — lowest libido phase",
          mechanism: "Testosterone and estrogen are at their lowest during menstruation. Libido is hormonally suppressed. Prostaglandin-induced discomfort further reduces desire. This is the body's natural state, not dysfunction.",
          source: "Stanislaw H, Rice FJ. Correlation between sexual desire and menstrual cycle characteristics. Arch Sex Behav. 1988;17(6):499-508",
          tags: ["low_libido", "mood"]
        }
      }
    },
  
    // ═══════════════════════════════════════════
    // FOLLICULAR PHASE (Days 6-13)
    // Hormones: Estrogen rising, FSH active
    // ═══════════════════════════════════════════
    follicular: {
      hormoneContext: "Estrogen rises steadily as follicles develop under FSH stimulation. Energy, mood, and cognitive function progressively improve. Insulin sensitivity is at its highest. Muscle protein synthesis is enhanced. Serotonin rises with estrogen. Dopamine sensitivity increases. Core body temperature is at its lowest stable level.",
  
      nutrition: [
        {
          rec: "Prioritize protein: 1.6-2.0g/kg bodyweight — chicken, fish, eggs, legumes, Greek yogurt",
          mechanism: "Rising estrogen enhances muscle protein synthesis and satellite cell activity. The follicular phase shows greater hypertrophy response to resistance training. Higher protein intake capitalizes on this anabolic window.",
          source: "Wikström-Frisén L, et al. Effects on power, strength and lean body mass of menstrual/oral contraceptive cycle based resistance training. J Sports Med Phys Fitness. 2017;57(1-2):43-52",
          tags: ["energy", "recovery", "muscle", "training_high"]
        },
        {
          rec: "Fermented foods: kimchi, sauerkraut, yogurt, kefir, miso",
          mechanism: "Estrogen is metabolized by the estrobolome (gut bacteria). Healthy gut microbiome ensures proper estrogen conjugation and excretion via beta-glucuronidase regulation, preventing estrogen dominance.",
          source: "Baker JM, et al. Estrogen-gut microbiome axis: physiological and clinical implications. Maturitas. 2017;103:45-53",
          tags: ["gut_health", "estrogen_balance", "bloating"]
        },
        {
          rec: "Complex carbohydrates: oats, quinoa, sweet potatoes — maximize during this phase",
          mechanism: "Insulin sensitivity peaks in the follicular phase due to estrogen upregulating GLUT4 transporters. This is the optimal time for carbohydrate utilization, glycogen storage, and fueling hard workouts.",
          source: "Yeung EH, et al. Longitudinal study of insulin resistance and sex hormones over the menstrual cycle. J Clin Endocrinol Metab. 2010;95(12):5435-5442",
          tags: ["energy", "training_high", "insulin_sensitivity"]
        },
        {
          rec: "Phytoestrogen-containing foods: flaxseed, sesame seeds, sprouted legumes",
          mechanism: "Phytoestrogens (lignans, isoflavones) act as selective estrogen receptor modulators (SERMs). During follicular phase when estrogen is building, they support healthy estrogen metabolism pathways and gut estrobolome.",
          source: "Patisaul HB, Jefferson W. The pros and cons of phytoestrogens. Front Neuroendocrinol. 2010;31(4):400-419",
          tags: ["estrogen_balance", "gut_health"]
        },
        {
          rec: "Zinc-rich foods: oysters, pumpkin seeds, beef — to support follicle development",
          mechanism: "Zinc is essential for follicular development, LH receptor expression, and the LH surge that triggers ovulation. Zinc deficiency is associated with delayed ovulation and reduced egg quality.",
          source: "Garner TB, et al. Role of zinc in female reproduction. Biol Reprod. 2021;104(5):976-994",
          tags: ["ovulation", "fertility", "follicular_development"]
        },
        {
          rec: "Green tea 2-3 cups: EGCG supports phase II estrogen detox",
          mechanism: "EGCG in green tea induces NQO1 and other phase II detoxification enzymes in the liver, supporting healthy estrogen metabolism. Also provides L-theanine for calm focus as energy rises.",
          source: "Kensler TW, et al. Keap1-Nrf2 signaling: a target for cancer prevention by sulforaphane and related electrophiles. Nutr Rev. 2004;62(7 Pt 2):S195-198",
          tags: ["estrogen_balance", "energy", "focus"]
        }
      ],
  
      supplements: [
        {
          rec: "Probiotic (multi-strain, 10+ billion CFU: Lactobacillus + Bifidobacterium)",
          mechanism: "Supports the estrobolome for healthy estrogen metabolism. Specific strains improve beta-glucuronidase regulation, preventing unconjugated estrogen recirculation. Also supports vaginal microbiome health.",
          source: "Kwa M, et al. The intestinal microbiome and estrogen receptor-positive female breast cancer. J Natl Cancer Inst. 2016;108(8):djw029",
          tags: ["gut_health", "estrogen_balance", "immunity"]
        },
        {
          rec: "B-complex vitamins (especially B6, B12, folate)",
          mechanism: "B6 is a cofactor in hepatic estrogen conjugation. B12 and folate support the methylation cycle critical for estrogen detoxification via COMT pathway. Rising estrogen increases demand for these cofactors.",
          source: "Chocano-Bedoya PO, et al. Dietary B vitamin intake and incident premenstrual syndrome. Am J Clin Nutr. 2011;93(5):1080-1086",
          tags: ["energy", "mood", "estrogen_balance", "pms_prevention"]
        },
        {
          rec: "Vitamin E 400 IU",
          mechanism: "Vitamin E modulates prostaglandin synthesis and has been shown to reduce menstrual pain when taken starting in the follicular phase. Also supports healthy follicle development and reduces oxidative stress in follicular fluid.",
          source: "Ziaei S, et al. A randomised controlled trial of vitamin E in the treatment of primary dysmenorrhoea. BJOG. 2005;112(4):466-469",
          tags: ["fertility", "antioxidant", "cramps_prevention"]
        },
        {
          rec: "CoQ10 200mg",
          mechanism: "CoQ10 levels in follicular fluid correlate with egg quality. Supplementation improves mitochondrial function in granulosa cells supporting follicular development. Particularly important for women over 35.",
          source: "Bentov Y, et al. Coenzyme Q10 supplementation and oocyte aneuploidy in women undergoing IVF-ICSI treatment. Clin Med Insights Reprod Health. 2014;8:31-36",
          tags: ["fertility", "egg_quality", "energy", "antioxidant"]
        },
        {
          rec: "Iron bisglycinate 18mg (especially if heavy previous period)",
          mechanism: "The follicular phase is the recovery window after menstrual iron loss. Replenishing iron stores now supports both energy and the increased training capacity this phase allows. Check ferritin: optimal is 50-100ng/mL.",
          source: "Milman N. Dietary iron intake in women — requirements and recommendations. Ugeskr Laeger. 2013;175(21):1480-1483",
          tags: ["fatigue", "iron", "recovery", "heavy_flow"]
        }
      ],
  
      exercise: [
        {
          rec: "Heavy resistance training: compound lifts, progressive overload, PBs",
          mechanism: "Follicular-phase-based resistance training produced significantly greater increases in lean mass and upper body strength compared to luteal-phase training. Estrogen has anabolic properties and reduces muscle damage markers.",
          source: "Wikström-Frisén L, et al. J Sports Med Phys Fitness. 2017;57(1-2):43-52",
          tags: ["training_high", "strength", "recovery_good", "hrv_high"]
        },
        {
          rec: "High-intensity interval training (HIIT): 85-95% max HR",
          mechanism: "VO2max and aerobic capacity are highest in the follicular phase. Glycogen storage and insulin-mediated glucose uptake are optimal. Estrogen's fat-sparing effect means greater carbohydrate oxidation at high intensities.",
          source: "Janse de Jonge XA. Effects of the menstrual cycle on exercise performance. Sports Med. 2003;33(11):833-851",
          tags: ["training_high", "cardio", "hrv_high", "energy_high"]
        },
        {
          rec: "Learn new skills: complex movement patterns, sports technique, dance",
          mechanism: "Estrogen enhances neuroplasticity, hippocampal neurogenesis, and motor learning via BDNF upregulation. Dopamine sensitivity increases, making new skill acquisition faster and more rewarding in this phase.",
          source: "Sundström Poromaa I, Gingnell M. Menstrual cycle influence on cognitive function and emotion processing. Mol Psychiatry. 2014;19(2):137-143",
          tags: ["focus", "learning", "energy_high", "mood_high"]
        },
        {
          rec: "Increase training volume 15-20% vs luteal baseline",
          mechanism: "Estrogen reduces exercise-induced muscle damage and accelerates glycogen resynthesis post-exercise. Recovery between sessions is faster. Studies show women in follicular phase recover full strength within 24h vs 48h in luteal.",
          source: "Enns DL, Tiidus PM. The influence of estrogen on skeletal muscle. Sports Med. 2010;40(1):41-58",
          tags: ["recovery_good", "training_high", "hrv_high"]
        }
      ],
  
      sleep: [
        {
          rec: "Sleep quality typically best in follicular phase — maintain 7-9 hours",
          mechanism: "Core body temperature is at its lowest stable point, facilitating sleep onset. Low progesterone means minimal thermogenic disruption. REM sleep tends to be longer and more restorative in this phase.",
          source: "Driver HS, et al. Menstrual factors in sleep. Sleep Med Rev. 1998;2(4):213-229",
          tags: ["sleep", "recovery", "hrv_high"]
        }
      ],
  
      symptoms: {
        acne: {
          rec: "Zinc 30mg, reduce dairy and high-glycemic foods, increase cruciferous vegetables, spearmint tea",
          mechanism: "Pre-ovulatory androgen rises trigger sebum production. Zinc inhibits 5-alpha-reductase (testosterone→DHT conversion). DIM from crucifers supports estrogen metabolism. Spearmint has documented anti-androgenic effects.",
          source: "Brandt S. The clinical effects of zinc as a topical or oral agent on acne. J Am Acad Dermatol. 2013;68(5):S28-S35",
          tags: ["acne", "androgen_excess", "skin"]
        },
        lowEnergy: {
          rec: "If energy is still low after menstruation: check ferritin, iron-rich meals, B12",
          mechanism: "Persistent low energy in the follicular phase when estrogen is rising suggests iron deficiency (ferritin <30ng/mL), B12 deficiency, or thyroid dysfunction. Energy should be naturally improving at this point.",
          source: "Milman N. Serum ferritin in Danes. Scand J Clin Lab Invest. 1996;56(2):95-104",
          tags: ["fatigue", "energy_low", "iron", "thyroid"]
        }
      }
    },
  
    // ═══════════════════════════════════════════
    // OVULATION PHASE (Days 14-16)
    // Hormones: Estrogen peak → LH surge → egg release
    // ═══════════════════════════════════════════
    ovulation: {
      hormoneContext: "Estrogen peaks triggering the LH surge from the pituitary. Testosterone briefly spikes to its monthly high. The egg is released from the dominant follicle. Energy, libido, and verbal fluency are typically at their highest. Body temperature begins to rise 0.3-0.5°F post-ovulation. Pain tolerance peaks. Cervical mucus becomes clear and stretchy.",
  
      nutrition: [
        {
          rec: "Cruciferous vegetables: broccoli, cauliflower, Brussels sprouts, kale (cooked)",
          mechanism: "Contain DIM (diindolylmethane) and I3C (indole-3-carbinol) which support phase II estrogen detoxification, shifting metabolism toward the less proliferative 2-OH estrone pathway vs the 16-OH pathway.",
          source: "Michnovicz JJ, et al. Changes in urinary estrogen metabolites after oral indole-3-carbinol treatment. J Natl Cancer Inst. 1997;89(10):718-723",
          tags: ["estrogen_balance", "estrogen_dominance", "detox"]
        },
        {
          rec: "High-fiber foods: vegetables, whole grains, chia seeds (aim 30-35g/day)",
          mechanism: "Fiber binds conjugated estrogens in the gut preventing reabsorption (enterohepatic recirculation). Women consuming 25g+ fiber daily have significantly lower circulating estrogen. Critical at estrogen peak.",
          source: "Gaskins AJ, et al. Effect of daily fiber intake on reproductive function. Am J Clin Nutr. 2009;90(4):1061-1069",
          tags: ["estrogen_balance", "estrogen_dominance", "gut_health"]
        },
        {
          rec: "Antioxidant-rich foods: berries, dark leafy greens, colorful vegetables",
          mechanism: "Ovulation is an inflammatory event (follicular rupture requiring proteolytic enzymes). Antioxidants (glutathione precursors, vitamin C, polyphenols) support inflammatory resolution needed for healthy corpus luteum formation.",
          source: "Ruder EH, et al. Oxidative stress and antioxidants: exposure and impact on female fertility. Hum Reprod Update. 2008;14(4):345-357",
          tags: ["fertility", "antioxidant", "inflammation"]
        },
        {
          rec: "Adequate healthy fats: avocado, olive oil, nuts, eggs",
          mechanism: "Cholesterol is the direct precursor to progesterone (produced by corpus luteum post-ovulation). Adequate dietary fat supports the hormonal transition to luteal phase. Low-fat diets are associated with anovulation.",
          source: "Mumford SL, et al. Dietary fat intake and reproductive hormone concentrations. Am J Clin Nutr. 2016;103(3):868-877",
          tags: ["fertility", "progesterone_support", "hormone_balance"]
        },
        {
          rec: "Selenium-rich foods: Brazil nuts (2-3), tuna, sunflower seeds",
          mechanism: "Selenium is required for glutathione peroxidase activity in granulosa cells protecting the oocyte from oxidative damage during ovulation. Follicular fluid selenium correlates with fertilization rates.",
          source: "Forges T, et al. Impact of folate and homocysteine metabolism on human reproductive health. Hum Reprod Update. 2007;13(3):225-238",
          tags: ["fertility", "antioxidant", "egg_quality"]
        }
      ],
  
      supplements: [
        {
          rec: "NAC (N-Acetyl Cysteine) 600mg",
          mechanism: "NAC is a glutathione precursor, the dominant antioxidant in follicular fluid. Supports the oxidative stress of ovulation. In PCOS, NAC improved ovulation rates comparable to metformin. Also reduces homocysteine.",
          source: "Rizk AY, et al. N-acetyl-cysteine is a novel adjuvant to clomiphene citrate in clomiphene-resistant PCOS patients. Fertil Steril. 2005;83(2):367-370",
          tags: ["fertility", "pcos", "antioxidant", "ovulation"]
        },
        {
          rec: "CoQ10 200-400mg",
          mechanism: "CoQ10 supports mitochondrial energy production in the oocyte (the most energy-demanding cell in the body). Supplementation improved egg quality, fertilization rates, and pregnancy rates particularly in women over 35.",
          source: "Bentov Y, et al. Coenzyme Q10 supplementation and oocyte aneuploidy. Clin Med Insights Reprod Health. 2014;8:31-36",
          tags: ["fertility", "egg_quality", "mitochondria", "antioxidant"]
        },
        {
          rec: "Vitamin D 2000-4000 IU",
          mechanism: "Vitamin D receptors are present in ovarian granulosa cells. Vitamin D deficiency is associated with anovulation, reduced fertilization rates, and lower AMH. Supplementation improved follicular development.",
          source: "Irani M, Merhi Z. Role of vitamin D in ovarian physiology and reproduction. Fertil Steril. 2014;102(2):460-468",
          tags: ["fertility", "ovulation", "immune", "vitamin_d_deficiency"]
        },
        {
          rec: "Folate/Methylfolate 400-800mcg",
          mechanism: "Folate is critical for DNA synthesis in the rapidly dividing oocyte and for preventing neural tube defects. Methylfolate (5-MTHF) is preferable for women with MTHFR variants who cannot convert folic acid.",
          source: "Gaskins AJ, Chavarro JE. Diet and fertility: a review. Am J Obstet Gynecol. 2018;218(4):379-389",
          tags: ["fertility", "pregnancy_prevention", "dna_synthesis"]
        }
      ],
  
      exercise: [
        {
          rec: "Peak performance: PRs, races, time trials, competitions",
          mechanism: "Estrogen and testosterone peak simultaneously, creating the highest strength-to-weight ratio and peak aerobic capacity. Pain tolerance is highest (endogenous opioid activity peaks). Reaction time is fastest.",
          source: "Pallavi LC, et al. Assessment of musculoskeletal strength and levels of fatigue during menstrual cycle phases. J Clin Diagn Res. 2017;11(2):CC11-CC13",
          tags: ["training_high", "strength", "performance", "hrv_high"]
        },
        {
          rec: "Social exercise: group classes, team sports, partner workouts",
          mechanism: "Elevated estrogen increases oxytocin receptor sensitivity and social bonding motivation. Verbal fluency and social confidence peak around ovulation. Group exercise feels more rewarding and sustainable in this phase.",
          source: "Sundström Poromaa I, Gingnell M. Menstrual cycle influence on cognitive function. Mol Psychiatry. 2014;19(2):137-143",
          tags: ["mood_high", "social", "energy_high"]
        },
        {
          rec: "Plyometrics and power movements — with careful warm-up",
          mechanism: "Power output peaks at ovulation. However, ligament laxity increases due to relaxin and estrogen effects on collagen crosslinking. ACL injury risk is measurably higher around ovulation. Thorough warm-up and proprioception drills are critical.",
          source: "Herzberg SD, et al. Effect of menstrual cycle and contraceptives on ACL injuries. Orthop J Sports Med. 2017;5(7):2325967117718781",
          tags: ["training_high", "injury_prevention", "power"]
        }
      ],
  
      sleep: [
        {
          rec: "Sleep is usually good — leverage it for recovery from hard training",
          mechanism: "The pre-ovulatory estrogen peak improves sleep quality and increases REM duration. This is the best window for sleep-dependent memory consolidation and physical recovery from intense training.",
          source: "Driver HS, et al. Menstrual factors in sleep. Sleep Med Rev. 1998;2(4):213-229",
          tags: ["sleep", "recovery", "training_high"]
        }
      ],
  
      symptoms: {
        ovulationPain: {
          rec: "Anti-inflammatory foods, gentle heat, magnesium 400mg, evening primrose oil",
          mechanism: "Mittelschmerz occurs from follicular fluid and blood irritating the peritoneum post-rupture. Occurs in 40% of women. Usually resolves within 24-48h. Evening primrose oil (GLA) modulates prostaglandin balance.",
          source: "O'Herlihy C, et al. Mittelschmerz and ovulation. Br Med J. 1980;281(6239):547",
          tags: ["ovulation_pain", "cramps", "pelvic_pain"]
        },
        highLibido: {
          rec: "This is the biological peak — testosterone and estrogen are both at their highest",
          mechanism: "Simultaneous estrogen and testosterone peaks create the highest libido window in the cycle. Evolutionarily timed with fertility. This is physiologically normal and expected, not something to manage.",
          source: "Stanislaw H, Rice FJ. Correlation between sexual desire and menstrual cycle characteristics. Arch Sex Behav. 1988;17(6):499-508",
          tags: ["libido", "mood_high"]
        }
      }
    },
  
    // ═══════════════════════════════════════════
    // LUTEAL PHASE (Days 17-28)
    // Hormones: Progesterone dominant, estrogen secondary rise
    // ═══════════════════════════════════════════
    luteal: {
      hormoneContext: "Progesterone rises sharply from the corpus luteum, peaking around day 21. A secondary estrogen rise occurs mid-luteal. Body temperature increases 0.3-0.5°F above follicular baseline. Metabolic rate increases 89-279 kcal/day. Insulin resistance increases. Serotonin levels decline in late luteal. Cortisol reactivity increases. The body prepares for potential implantation. HRV typically lower than follicular phase.",
  
      nutrition: [
        {
          rec: "Increase caloric intake by 100-200 kcal via complex carbs and healthy fats",
          mechanism: "Basal metabolic rate increases 89-279 kcal/day in the luteal phase due to progesterone's thermogenic effect. Fighting this increase leads to cravings and binge-restrict cycles. Working with it reduces PMS severity.",
          source: "Webb P. 24-hour energy expenditure and the menstrual cycle. Am J Clin Nutr. 1986;44(5):614-619",
          tags: ["cravings", "appetite", "pms", "metabolism"]
        },
        {
          rec: "Magnesium-rich foods: dark chocolate (85%+), pumpkin seeds, almonds, avocado, spinach",
          mechanism: "Progesterone increases renal magnesium excretion, creating a functional deficiency. Low magnesium correlates with PMS severity including anxiety, water retention, and cramping. Dark chocolate also contains theobromine (mild mood elevator) and PEA.",
          source: "Quaranta S, et al. Pilot study of modified-release magnesium 250mg tablet for PMS. Clin Drug Investig. 2007;27(1):51-58",
          tags: ["pms", "anxiety", "bloating", "cravings", "mood_low", "sleep"]
        },
        {
          rec: "Calcium-rich foods: sardines, sesame seeds, leafy greens, full-fat yogurt",
          mechanism: "1000mg/day calcium reduced overall PMS symptom scores by 48% vs placebo in a large RCT (466 women). Calcium modulates the neuroexcitability changes caused by fluctuating estrogen and progesterone on neuronal calcium channels.",
          source: "Thys-Jacobs S, et al. Calcium carbonate and the premenstrual syndrome. Am J Obstet Gynecol. 1998;179(2):444-452",
          tags: ["pms", "mood_low", "anxiety", "cramps"]
        },
        {
          rec: "Tryptophan-rich foods: turkey, eggs, cheese, pumpkin seeds, oats",
          mechanism: "Serotonin levels decline in late luteal phase due to progesterone's upregulation of MAO-A (the enzyme that breaks down serotonin). Tryptophan is the serotonin precursor. Carbohydrates facilitate tryptophan crossing the blood-brain barrier.",
          source: "Halbreich U. The etiology, biology, and evolving pathology of premenstrual syndromes. Psychoneuroendocrinology. 2003;28(Suppl 3):55-99",
          tags: ["mood_low", "pms", "anxiety", "depression", "cravings"]
        },
        {
          rec: "Cruciferous vegetables and liver support: beets, artichoke, lemon water, dandelion greens",
          mechanism: "The liver must metabolize both the progesterone peak and secondary estrogen rise. Glucosinolates from crucifers upregulate phase II detoxification (glucuronidation, sulfation). Supporting liver clearance reduces estrogen dominance symptoms.",
          source: "Higdon JV, et al. Cruciferous vegetables and human cancer risk. Pharmacol Res. 2007;55(3):224-236",
          tags: ["estrogen_dominance", "bloating", "breast_tenderness", "pms"]
        },
        {
          rec: "Reduce caffeine to 1 cup max, avoid after noon",
          mechanism: "Caffeine blocks adenosine receptors, increasing anxiety and cortisol. In the luteal phase when cortisol reactivity is already elevated and GABA activity altered, caffeine significantly worsens anxiety, breast tenderness, and insomnia.",
          source: "Rossignol AM, Bonnlander H. Caffeine-containing beverages, total fluid consumption, and premenstrual syndrome. Am J Public Health. 1990;80(9):1106-1110",
          tags: ["anxiety", "breast_tenderness", "insomnia", "pms", "mood_low"]
        },
        {
          rec: "Reduce alcohol or avoid entirely in late luteal",
          mechanism: "Alcohol depletes magnesium and B vitamins required for serotonin and GABA synthesis — both already compromised in the late luteal phase. Alcohol worsens PMDD symptoms and disrupts the quality of progesterone-influenced sleep.",
          source: "Bertone-Johnson ER, et al. Alcohol use and premenstrual syndrome. Am J Clin Nutr. 2008;88(4):933-940",
          tags: ["pms", "pmdd", "mood_low", "sleep", "anxiety"]
        },
        {
          rec: "Anti-inflammatory fats: olive oil, avocado, fatty fish — reduce saturated and trans fats",
          mechanism: "Progesterone promotes a pro-inflammatory state via increased arachidonic acid availability. Anti-inflammatory fats shift eicosanoid balance toward PGE1 and resolvins, reducing PMS inflammatory symptoms.",
          source: "Deutch B. Painful menstruation and low intake of n-3 fatty acids. Ugeskr Laeger. 1996;158(29):4196-4198",
          tags: ["pms", "inflammation", "cramps", "breast_tenderness"]
        }
      ],
  
      supplements: [
        {
          rec: "Magnesium glycinate 400mg (take at night)",
          mechanism: "Glycinate form has superior bioavailability and calming effect — glycine is an inhibitory neurotransmitter that enhances GABA activity. Magnesium + B6 combination reduced PMS anxiety scores by 40% in an RCT.",
          source: "De Souza MC, et al. A synergistic effect of 200mg magnesium plus 50mg B6 for relief of anxiety-related PMS. J Womens Health Gend Based Med. 2000;9(2):131-139",
          tags: ["pms", "anxiety", "sleep", "cramps", "mood_low"]
        },
        {
          rec: "Vitamin B6 50-100mg",
          mechanism: "B6 is a cofactor for DOPA decarboxylase (serotonin synthesis) and GABA synthesis. A systematic review of 9 RCTs found B6 significantly reduced PMS mood symptoms including depression and irritability.",
          source: "Wyatt KM, et al. Efficacy of vitamin B-6 in treatment of PMS: systematic review. BMJ. 1999;318(7195):1375-1381",
          tags: ["pms", "mood_low", "anxiety", "depression", "irritability"]
        },
        {
          rec: "Calcium 1000-1200mg (split into two doses)",
          mechanism: "Calcium supplementation is the most robustly evidence-based PMS intervention. It modulates neuroexcitability changes from fluctuating ovarian steroids and reduces symptom severity across mood, pain, and physical domains.",
          source: "Ghanbari Z, et al. Effects of calcium supplement therapy in women with PMS. Taiwan J Obstet Gynecol. 2009;48(2):124-129",
          tags: ["pms", "mood_low", "cramps", "bloating", "anxiety"]
        },
        {
          rec: "Vitex (Chasteberry) 20-40mg standardized extract (take daily, effects in 3+ cycles)",
          mechanism: "Vitex acts on dopamine D2 receptors in the pituitary, reducing prolactin. It also has mild progesterone receptor activity. Meta-analysis of 12 RCTs found significant improvement in overall PMS and PMDD symptoms.",
          source: "Verkaik S, et al. Treatment of PMS with Vitex agnus castus: systematic review and meta-analysis. Am J Obstet Gynecol. 2017;217(2):150-166",
          tags: ["pms", "pmdd", "breast_tenderness", "mood_low", "irritability"]
        },
        {
          rec: "Evening Primrose Oil 2-3g",
          mechanism: "Contains GLA (gamma-linolenic acid) which converts to DGLA and anti-inflammatory PGE1. Reduces breast tenderness (cyclic mastalgia) and mood symptoms. Takes 3+ months for full effect via prostaglandin rebalancing.",
          source: "Pruthi S, et al. Vitamin E and evening primrose oil for management of cyclical mastalgia. Altern Med Rev. 2010;15(1):59-67",
          tags: ["breast_tenderness", "pms", "inflammation"]
        },
        {
          rec: "5-HTP 50-100mg (if strong mood symptoms; don't combine with antidepressants)",
          mechanism: "5-HTP is the immediate precursor to serotonin, bypassing the tryptophan hydroxylase rate-limiting step. Directly addresses the luteal serotonin decline. A small RCT showed significant improvement in PMS mood symptoms.",
          source: "Steinberg S, et al. A placebo-controlled clinical trial of L-tryptophan in premenstrual dysphoria. Biol Psychiatry. 1999;45(3):313-320",
          tags: ["mood_low", "depression", "pmdd", "anxiety", "cravings"]
        },
        {
          rec: "Vitamin D3 2000 IU (maintain adequate levels)",
          mechanism: "Vitamin D modulates serotonin synthesis via TPH2 gene expression. Women with adequate vitamin D (>40ng/mL) report significantly lower PMS severity. Also supports progesterone receptor sensitivity.",
          source: "Bertone-Johnson ER, et al. Vitamin D and risk of premenstrual syndrome in a prospective study. Am J Clin Nutr. 2010;91(5):1220-1226",
          tags: ["pms", "mood_low", "depression"]
        }
      ],
  
      exercise: [
        {
          rec: "Moderate steady-state cardio: swimming, cycling, hiking, brisk walking (60-70% max HR)",
          mechanism: "Progesterone raises core temperature 0.3-0.5°C, increasing perceived exertion at the same absolute workload. Steady-state exercise maintains fitness and endorphin release without overloading the thermoregulatory system.",
          source: "Janse de Jonge XA, et al. Exercise performance over the menstrual cycle in temperate and hot environments. Med Sci Sports Exerc. 2012;44(11):2190-2198",
          tags: ["training_moderate", "fatigue", "mood_low", "pms"]
        },
        {
          rec: "Strength training: moderate loads (65-75% 1RM), 8-12 reps, technique focus",
          mechanism: "Progesterone's catabolic properties and reduced anaerobic capacity mean maximal strength output is slightly lower. Moderate-load training maintains stimulus while respecting altered recovery. Focus on mind-muscle connection over numbers.",
          source: "Sung E, et al. Effects of follicular versus luteal phase-based strength training. Springerplus. 2014;3:668",
          tags: ["training_moderate", "strength", "recovery_lower"]
        },
        {
          rec: "Yoga and pilates: forward folds, hip openers, breathwork, gentle inversions",
          mechanism: "Progesterone enhances GABA receptor sensitivity, making the nervous system more responsive to calming practices. A 12-week yoga RCT reduced cortisol levels and PMS symptom severity significantly vs control.",
          source: "Tsai SY. Effect of yoga exercise on PMS symptoms. Int J Environ Res Public Health. 2016;13(7):721",
          tags: ["pms", "anxiety", "mood_low", "stress_high", "cramps"]
        },
        {
          rec: "Reduce training volume 15-20% in late luteal (days 24-28)",
          mechanism: "Late luteal phase shows reduced anaerobic capacity, increased RPE, longer recovery times, reduced HRV, and measurably higher injury risk — particularly ACL. Deloading aligns with and respects this physiological reality.",
          source: "Bruinvels G, et al. Sport, exercise and the menstrual cycle: where is the research? Br J Sports Med. 2017;51(6):487-488",
          tags: ["recovery_lower", "hrv_low", "fatigue", "injury_prevention"]
        },
        {
          rec: "Walking after meals to manage insulin resistance",
          mechanism: "Progesterone-induced insulin resistance can cause blood sugar dysregulation. A 10-15 minute walk after meals significantly reduces postprandial glucose spikes. Particularly relevant for women with PCOS or insulin resistance.",
          source: "Colberg SR, et al. Postprandial walking is better for lowering the glycemic effect of dinner than pre-dinner exercise. Diabetes Care. 2009;32(12):2258-2263",
          tags: ["pms", "cravings", "insulin_resistance", "pcos", "bloating"]
        }
      ],
  
      sleep: [
        {
          rec: "Set room temperature to 65-67°F; use cooling pillow or breathable sheets",
          mechanism: "Progesterone's thermogenic effect raises core body temperature 0.3-0.5°C, disrupting the core temperature drop (0.5-1°C) needed for sleep onset. A cool sleep environment is clinically significant for luteal sleep quality.",
          source: "Baker FC, et al. Sleep and sleep disorders in the menopausal transition. Sleep Med Clin. 2018;13(3):443-456",
          tags: ["sleep", "insomnia", "hot_flashes", "temperature"]
        },
        {
          rec: "Magnesium glycinate 200-300mg 45 min before bed",
          mechanism: "Magnesium activates GABA receptors, promotes muscle relaxation, and reduces cortisol. The glycine component independently lowers core body temperature by dilating peripheral blood vessels. Shown to improve sleep quality scores.",
          source: "Wienecke E, Nolden C. Long-term HRV analysis shows stress reduction by magnesium. MMW Fortschr Med. 2016;158(Suppl 6):12-16",
          tags: ["sleep", "insomnia", "anxiety", "pms"]
        },
        {
          rec: "Tart cherry juice (240ml) or melatonin 0.5mg if sleep is significantly disrupted",
          mechanism: "Tart cherries are a natural melatonin source. Studies show 240ml twice daily increased sleep time by 84 minutes. Low-dose melatonin (0.5mg) avoids the rebound effect of higher doses. Both support sleep without suppressing natural melatonin production.",
          source: "Howatson G, et al. Effect of tart cherry juice on melatonin levels and sleep quality in healthy adults. Eur J Nutr. 2012;51(8):909-916",
          tags: ["sleep", "insomnia", "hrv_low"]
        },
        {
          rec: "Avoid screens 60+ min before bed; blue light has stronger melatonin suppression in luteal phase",
          mechanism: "Progesterone increases sensitivity to light-induced melatonin suppression. The same blue light exposure causes greater melatonin suppression in the luteal phase vs follicular. This directly extends sleep latency.",
          source: "Shechter A, Boivin DB. Sleep, hormones, and circadian rhythms throughout the menstrual cycle. Int J Endocrinol. 2010;2010:259345",
          tags: ["sleep", "insomnia", "pms"]
        }
      ],
  
      symptoms: {
        pmsAnxiety: {
          rec: "Magnesium glycinate, B6, ashwagandha, GABA-supporting movement, strict caffeine limit",
          mechanism: "Allopregnanolone (progesterone metabolite) normally enhances GABA activity. In PMS-susceptible women, paradoxical neurosteroid sensitivity causes anxiety instead. Magnesium and B6 support GABA synthesis. Ashwagandha reduces cortisol reactivity.",
          source: "Bäckström T, et al. Allopregnanolone and mood disorders. Prog Neurobiol. 2014;113:88-94",
          tags: ["anxiety", "pms", "pmdd", "stress_high", "mood_low"]
        },
        pmsCravings: {
          rec: "Honor cravings with nutrient-dense versions: dark chocolate (magnesium), sweet potato, trail mix",
          mechanism: "BMR increases 100-200 kcal/day. Serotonin drop increases carbohydrate cravings (carbs facilitate tryptophan uptake). Restriction worsens binge-restrict cycles. Dark chocolate (85%+) provides magnesium, PEA, and theobromine.",
          source: "Dye L, Blundell JE. Menstrual cycle and appetite control. Hum Reprod. 1997;12(6):1142-1151",
          tags: ["cravings", "appetite", "pms", "mood_low"]
        },
        bloating: {
          rec: "Potassium-rich foods, dandelion root tea, reduce sodium, light movement, avoid carbonated drinks",
          mechanism: "Progesterone activates RAAS (renin-angiotensin-aldosterone system), causing sodium and water retention. Potassium counteracts aldosterone. Dandelion leaf acts as a mild natural diuretic. Movement promotes lymphatic drainage.",
          source: "Stachenfeld NS. Sex hormone effects on body fluid regulation. Exerc Sport Sci Rev. 2008;36(3):152-159",
          tags: ["bloating", "fluid_retention", "pms"]
        },
        breastTenderness: {
          rec: "Evening primrose oil 2-3g, vitamin E 400 IU, reduce caffeine completely, supportive bra",
          mechanism: "Progesterone stimulates mammary duct proliferation and increases vascular permeability causing engorgement. EPO (GLA) modulates prostaglandin-mediated breast inflammation. Caffeine (methylxanthines) significantly worsens cyclic mastalgia.",
          source: "Pruthi S, et al. Altern Med Rev. 2010;15(1):59-67",
          tags: ["breast_tenderness", "pms"]
        },
        insomnia: {
          rec: "Cool room (65-67°F), magnesium before bed, tart cherry juice, no screens 60 min before bed",
          mechanism: "Progesterone's thermogenic effect disrupts the core temperature drop needed for sleep onset. The late luteal cortisol reactivity increase contributes to early morning awakening. A multi-modal approach addresses both pathways.",
          source: "Shechter A, Boivin DB. Int J Endocrinol. 2010;2010:259345",
          tags: ["insomnia", "sleep", "pms", "hrv_low"]
        },
        lowHRV: {
          rec: "Reduce training intensity, prioritize sleep, breathwork (4-7-8 breathing), magnesium",
          mechanism: "HRV is measurably lower in the luteal phase due to progesterone's effect on the autonomic nervous system — shifting toward sympathetic dominance. Low HRV in this phase is physiologically normal; don't override it with high-intensity training.",
          source: "Sato N, Miyake S. Cardiovascular reactivity to mental stress: relationship with menstrual cycle. J Physiol Anthropol. 2004;23(6):215-223",
          tags: ["hrv_low", "recovery_lower", "stress_high", "training_high"]
        },
        irritability: {
          rec: "Vitamin B6, magnesium, saffron 30mg, omega-3s, reduce refined sugar and alcohol",
          mechanism: "Irritability in PMS is linked to the serotonin decline and altered GABA sensitivity. Saffron (30mg/day) showed significant improvement in PMS mood symptoms in 3 RCTs — comparable to low-dose fluoxetine in one trial.",
          source: "Agha-Hosseini M, et al. Crocus sativus L. (saffron) in the treatment of PMS. BJOG. 2008;115(4):515-519",
          tags: ["irritability", "pms", "pmdd", "mood_low"]
        }
      }
    },
  
    // ═══════════════════════════════════════════
    // CONDITION-SPECIFIC EVIDENCE
    // ═══════════════════════════════════════════
    conditions: {
      pcos: {
        general: [
          {
            rec: "Myo-inositol 4g + D-chiro-inositol 100mg daily (40:1 ratio)",
            mechanism: "Myo-inositol is a second messenger in insulin signaling. The 40:1 ratio mirrors physiological follicular fluid ratios. Meta-analysis of 10 RCTs showed improved ovulation rates, reduced androgen levels, and better insulin sensitivity.",
            source: "Unfer V, et al. Myo-inositol effects in women with PCOS: a meta-analysis of RCTs. Endocr Connect. 2017;6(8):647-658",
            tags: ["pcos", "insulin_resistance", "ovulation", "androgen_excess"]
          },
          {
            rec: "Low-glycemic, anti-inflammatory Mediterranean diet",
            mechanism: "PCOS involves chronic low-grade inflammation and insulin resistance. Mediterranean diet reduced androgens by 22%, improved insulin sensitivity (HOMA-IR), and decreased inflammatory markers (CRP, IL-6) in PCOS women over 12 weeks.",
            source: "Barrea L, et al. Adherence to Mediterranean diet and sirtuin 4 in PCOS. Nutrients. 2019;11(5):1116",
            tags: ["pcos", "insulin_resistance", "androgen_excess", "inflammation"]
          },
          {
            rec: "Spearmint tea 2 cups/day",
            mechanism: "Spearmint has documented anti-androgenic properties via 5-alpha-reductase inhibition. A 30-day RCT showed significant reduction in free testosterone and total testosterone, with increases in LH and FSH.",
            source: "Grant P. Spearmint herbal tea has significant anti-androgen effects in PCOS. Phytother Res. 2010;24(2):186-188",
            tags: ["pcos", "androgen_excess", "acne", "hirsutism"]
          },
          {
            rec: "Berberine 500mg 3x/day with meals (comparable to metformin in studies)",
            mechanism: "Berberine activates AMPK (same pathway as metformin), improving insulin sensitivity. A meta-analysis of 14 RCTs found berberine comparable to metformin for PCOS management: similar effects on BMI, insulin resistance, and androgen levels.",
            source: "An Y, et al. The use of berberine for women with PCOS undergoing IVF treatment. Clin Endocrinol. 2014;80(3):425-431",
            tags: ["pcos", "insulin_resistance", "androgen_excess", "fertility"]
          },
          {
            rec: "Vitamin D 4000 IU daily (deficiency is near-universal in PCOS)",
            mechanism: "Vitamin D receptors are present in ovarian tissue. Deficiency is found in 67-85% of women with PCOS. Supplementation reduced testosterone, improved insulin sensitivity, and restored ovulation in vitamin D-deficient PCOS patients.",
            source: "Selimoglu H, et al. The effect of Vitamin D replacement therapy on insulin resistance and androgen levels in women with PCOS. J Endocrinol Invest. 2010;33(4):234-238",
            tags: ["pcos", "insulin_resistance", "vitamin_d_deficiency", "ovulation"]
          },
          {
            rec: "Zone 2 cardio 150+ min/week: improves insulin sensitivity without spiking cortisol",
            mechanism: "Zone 2 training (60-70% max HR) improves mitochondrial density and GLUT4 expression without cortisol spikes that can worsen androgen production. Resistance training additionally improves insulin-mediated glucose disposal.",
            source: "Harrison CL, et al. The impact of intensified exercise training on insulin resistance and fitness in overweight and obese women with PCOS. Clin Endocrinol. 2012;76(3):351-357",
            tags: ["pcos", "insulin_resistance", "exercise", "cortisol"]
          },
          {
            rec: "Reduce ultra-processed foods and refined carbohydrates",
            mechanism: "Hyperinsulinemia drives LH-stimulated androgen production in PCOS theca cells. Refined carbohydrates cause rapid insulin spikes, directly worsening the androgen excess. Glycemic index matters more in PCOS than in typical cycles.",
            source: "Baillargeon JP, Nestler JE. Commentary: polycystic ovary syndrome: a syndrome of ovarian hypersensitivity to insulin. J Clin Endocrinol Metab. 2006;91(1):22-24",
            tags: ["pcos", "insulin_resistance", "androgen_excess", "diet"]
          }
        ]
      },
  
      pmdd: {
        general: [
          {
            rec: "Calcium 1200mg + Vitamin D 2000 IU daily (most evidence-based first-line approach)",
            mechanism: "PMDD involves an abnormal neurobiological response to normal hormonal fluctuations. Calcium deficiency worsens PMDD severity and both calcium and vitamin D modulate serotonin synthesis pathways affected in PMDD.",
            source: "Bertone-Johnson ER, et al. Calcium and vitamin D intake and risk of incident premenstrual syndrome. Arch Intern Med. 2005;165(11):1246-1252",
            tags: ["pmdd", "mood_low", "anxiety", "depression"]
          },
          {
            rec: "Saffron 30mg/day (crocus sativus extract)",
            mechanism: "Saffron inhibits serotonin reuptake and has MAO-A inhibitory properties. Three RCTs showed significant improvement in PMDD mood symptoms vs placebo, with comparable effects to low-dose fluoxetine in one trial.",
            source: "Agha-Hosseini M, et al. Crocus sativus L. in treatment of PMS. BJOG. 2008;115(4):515-519",
            tags: ["pmdd", "mood_low", "depression", "anxiety", "irritability"]
          },
          {
            rec: "Strict caffeine elimination in luteal phase",
            mechanism: "Women with PMDD show heightened cortisol and anxiety responses to caffeine. Caffeine reduces GABA activity and depletes the B vitamins and magnesium needed for serotonin/GABA synthesis already compromised in PMDD.",
            source: "Rossignol AM, Bonnlander H. Am J Public Health. 1990;80(9):1106-1110",
            tags: ["pmdd", "anxiety", "mood_low", "sleep"]
          },
          {
            rec: "Regular aerobic exercise 30 min 5x/week (particularly in luteal phase)",
            mechanism: "Aerobic exercise acutely increases serotonin and beta-endorphin release, directly counteracting the neurochemical deficits of PMDD. A 12-week exercise intervention reduced PMDD severity scores by 40% vs sedentary control.",
            source: "Steege JF, Blumenthal JA. The effects of aerobic exercise on PMS in women with and without PMDD. J Psychosom Res. 1993;37(2):127-133",
            tags: ["pmdd", "mood_low", "anxiety", "depression", "exercise"]
          }
        ]
      },
  
      endometriosis: {
        general: [
          {
            rec: "Anti-inflammatory diet: high omega-3s, turmeric, ginger; reduce red meat, trans fats, alcohol",
            mechanism: "Endometriosis is an estrogen-dependent inflammatory condition. Women consuming ≥2 servings/week omega-3 fish had 22% lower endometriosis risk. Red meat consumption increased risk by 56%. Alcohol increases circulating estrogen.",
            source: "Missmer SA, et al. Dietary fat consumption and endometriosis risk. Hum Reprod. 2010;25(6):1528-1535",
            tags: ["endometriosis", "pain", "cramps", "inflammation", "estrogen_dominance"]
          },
          {
            rec: "NAC (N-Acetyl Cysteine) 600mg 3x/day on empty stomach",
            mechanism: "NAC modulates NF-κB, reduces oxidative stress, inhibits cell proliferation in endometrial tissue, and has anti-angiogenic effects. A cohort study showed reduction in endometrioma size and significant pain score reduction.",
            source: "Porpora MG, et al. A promise in the treatment of endometriosis: NAC. Eur Rev Med Pharmacol Sci. 2013;17(10):1327-1333",
            tags: ["endometriosis", "pain", "antioxidant", "inflammation"]
          },
          {
            rec: "Resveratrol 30-40mg with meals",
            mechanism: "Resveratrol inhibits aromatase (reducing local estrogen production in lesions), suppresses COX-2, inhibits NF-κB, and has anti-angiogenic effects that limit endometrial implant growth and vascularization.",
            source: "Maia H Jr, et al. Inhibition of angiogenesis by antiestrogen agents. Gynecol Endocrinol. 2012;28(2):100-103",
            tags: ["endometriosis", "estrogen_dominance", "inflammation", "pain"]
          },
          {
            rec: "Gluten-free trial for 3 months (if symptoms are severe)",
            mechanism: "A prospective study found 75% of women with endometriosis reported significant pain reduction after 12 months on a gluten-free diet. Mechanism may involve reducing intestinal inflammation and immune activation that can worsen endometriosis.",
            source: "Marziali M, et al. Gluten-free diet: a new strategy for management of painful endometriosis. Minerva Chir. 2012;67(6):499-504",
            tags: ["endometriosis", "pain", "inflammation", "gluten"]
          },
          {
            rec: "High-intensity exercise (at manageable pain levels) reduces estrogen and inflammation",
            mechanism: "Regular vigorous exercise reduces circulating estrogen, increases SHBG, and reduces systemic inflammation. Women who exercised vigorously >4 hours/week had significantly lower endometriosis risk. Do not push through severe pain.",
            source: "Vitonis AF, et al. Adult physical activity and endometriosis risk. Epidemiology. 2010;21(1):16-23",
            tags: ["endometriosis", "estrogen_dominance", "inflammation", "exercise"]
          }
        ]
      },
  
      thyroid: {
        general: [
          {
            rec: "Selenium 200mcg daily (2-3 Brazil nuts provide ~200mcg)",
            mechanism: "The thyroid contains more selenium per gram than any organ. Selenium is required for T4→T3 conversion via selenoprotein deiodinase enzymes and protects thyroid from oxidative damage. Reduces TPO antibodies in Hashimoto's by ~50%.",
            source: "Rayman MP. Selenium and human health. Lancet. 2012;379(9822):1256-1268",
            tags: ["thyroid", "hashimotos", "hypothyroid", "t3_t4"]
          },
          {
            rec: "Zinc 25-30mg with food",
            mechanism: "Zinc is required for TRH (thyrotropin-releasing hormone) synthesis, T3 receptor binding, and T4→T3 conversion. Zinc deficiency impairs thyroid function and is common in hypothyroidism. Also protects against thyroid autoimmunity.",
            source: "Betsy A, et al. Zinc deficiency associated with hypothyroidism. Asian J Pharm Clin Res. 2013;6(suppl 2):S113-S116",
            tags: ["thyroid", "hypothyroid", "hashimotos", "immune"]
          },
          {
            rec: "Iodine from food (seaweed 1-2x/week, seafood) rather than high-dose supplements",
            mechanism: "Iodine is required for thyroid hormone synthesis. However, excessive supplemental iodine can trigger autoimmune thyroid conditions (Wolff-Chaikoff effect). Food-based iodine is self-limiting and generally safe.",
            source: "Leung AM, Braverman LE. Consequences of excess iodine. Nature Rev Endocrinol. 2014;10(3):136-142",
            tags: ["thyroid", "hypothyroid", "hashimotos", "iodine"]
          },
          {
            rec: "Avoid raw goitrogenic foods in large quantities: raw cruciferous, raw soy, millet",
            mechanism: "Goitrogens inhibit thyroid peroxidase and compete with iodine uptake. Cooking reduces goitrogenic activity 30-50% via myrosinase inactivation. Moderate cooked cruciferous is fine. Only raw, large quantities are problematic.",
            source: "Felker P, et al. Concentrations of thiocyanate and goitrin in human plasma. J Toxicol Environ Health A. 2016;79(9-10):401-406",
            tags: ["thyroid", "hashimotos", "hypothyroid", "goitrogen"]
          },
          {
            rec: "Gluten-free trial for 3-6 months (especially for Hashimoto's)",
            mechanism: "Gliadin (gluten protein) has molecular mimicry with thyroid tissue. In genetically susceptible individuals, gluten triggers anti-thyroid antibody cross-reactivity. Studies show reduced TPO antibodies on gluten-free diet in Hashimoto's.",
            source: "Sategna-Guidetti C, et al. The effects of 1-year gluten withdrawal on bone mass, bone metabolism and nutritional status in newly-diagnosed adult coeliac disease patients. Aliment Pharmacol Ther. 2000;14(1):35-43",
            tags: ["thyroid", "hashimotos", "autoimmune", "gluten"]
          }
        ]
      },
  
      postHBC: {
        general: [
          {
            rec: "Zinc 30mg, B-complex (especially B6, B12, folate), magnesium — the 'post-pill nutrient repletion protocol'",
            mechanism: "Hormonal contraceptives deplete zinc (by up to 30%), B6, B12, folate, magnesium, vitamin C, and CoQ10 via upregulation of hepatic enzymes. These nutrients are critical for restoring HPO axis function and natural ovulation.",
            source: "Palmery M, et al. Oral contraceptives and changes in nutritional requirements. Eur Rev Med Pharmacol Sci. 2013;17(13):1804-1813",
            tags: ["postHBC", "post_pill", "ovulation", "nutrient_depletion"]
          },
          {
            rec: "Vitex (Chasteberry) 20-40mg for 3-6 months",
            mechanism: "Post-pill amenorrhea affects ~3% of women. Vitex stimulates pituitary LH secretion and supports corpus luteum progesterone production, helping resume ovulatory cycles. Effects seen within 3-6 months of consistent use.",
            source: "Westphal LM, et al. Nutritional supplement for improving fertility in women. Clin Exp Obstet Gynecol. 2006;33(4):205-208",
            tags: ["postHBC", "post_pill", "irregular_cycles", "ovulation", "progesterone"]
          },
          {
            rec: "Liver support: milk thistle 150mg, cruciferous vegetables, NAC 600mg",
            mechanism: "The liver metabolizes synthetic hormones and must re-calibrate natural estrogen metabolism post-HBC. Supporting hepatic detoxification pathways helps clear residual synthetic hormone effects and supports natural estrogen cycling.",
            source: "Palmery M, et al. Eur Rev Med Pharmacol Sci. 2013;17(13):1804-1813",
            tags: ["postHBC", "post_pill", "liver", "estrogen_balance"]
          },
          {
            rec: "Track cycles: expect 3-6 months for regularization, 6-12 months for ovulatory cycles",
            mechanism: "After discontinuing HBC, the HPO axis takes time to resume normal pulsatile GnRH secretion. First ovulation may occur 1-3 months post-pill, but regular ovulatory cycles may take 6-9 months. Progesterone levels confirm ovulation.",
            source: "Barnhart KT, Schreiber CA. Return to fertility following discontinuation of oral contraceptives. Fertil Steril. 2009;91(3):659-663",
            tags: ["postHBC", "post_pill", "irregular_cycles", "tracking"]
          }
        ]
      },
  
      ironDeficiency: {
        general: [
          {
            rec: "Iron bisglycinate 25-50mg daily on empty stomach with vitamin C",
            mechanism: "Ferritin below 30ng/mL causes fatigue, poor focus, and reduced exercise capacity even without anemia. Bisglycinate form has superior absorption and tolerability vs ferrous sulfate. Optimal ferritin is 50-100ng/mL.",
            source: "Vaucher P, et al. Effect of iron supplementation on fatigue in nonanemic menstruating women. CMAJ. 2012;184(11):1247-1254",
            tags: ["iron", "fatigue", "anemia", "heavy_flow", "exercise_performance"]
          },
          {
            rec: "Cook in cast iron: can increase food iron content by 17-100%",
            mechanism: "Acidic foods cooked in cast iron leach iron into food. Tomato sauce cooked in cast iron had 17x higher iron content. A simple, cost-effective intervention for mild iron insufficiency.",
            source: "Brittin HC, Nossaman CE. Iron content of food cooked in iron utensils. J Am Diet Assoc. 1986;86(7):897-901",
            tags: ["iron", "fatigue", "anemia", "nutrition"]
          },
          {
            rec: "Avoid coffee/tea within 1 hour of iron-rich meals",
            mechanism: "Tannins in coffee and tea bind iron and reduce absorption by 60-80%. Polyphenols chelate iron in the gut. This single intervention can significantly improve iron status without changing foods consumed.",
            source: "Morck TA, et al. Inhibition of food iron absorption by coffee. Am J Clin Nutr. 1983;37(3):416-420",
            tags: ["iron", "fatigue", "anemia", "absorption"]
          }
        ]
      },
  
      insulinResistance: {
        general: [
          {
            rec: "Berberine 500mg with meals 2-3x/day",
            mechanism: "Berberine activates AMPK, the cellular energy sensor that improves insulin sensitivity through the same pathway as metformin. Reduces fasting glucose, post-meal glucose spikes, and insulin levels. Well-tolerated for long-term use.",
            source: "Yin J, et al. Efficacy of berberine in patients with type 2 diabetes. Metabolism. 2008;57(5):712-717",
            tags: ["insulin_resistance", "pcos", "blood_sugar", "cravings"]
          },
          {
            rec: "Apple cider vinegar 1-2 tbsp before meals",
            mechanism: "Acetic acid reduces post-meal glucose response by inhibiting salivary amylase and delaying gastric emptying. Studies show 20-34% reduction in post-meal blood sugar. Particularly effective before high-carbohydrate meals.",
            source: "Johnston CS, et al. Vinegar improves insulin sensitivity to a high-carbohydrate meal in subjects with insulin resistance. Diabetes Care. 2004;27(1):281-282",
            tags: ["insulin_resistance", "blood_sugar", "cravings", "pcos"]
          },
          {
            rec: "Resistance training 3x/week: most potent tool for insulin sensitivity",
            mechanism: "Resistance training increases GLUT4 transporter expression in muscle, improving insulin-independent glucose uptake. Effect persists 24-48h post-session. Building muscle mass improves metabolic capacity long-term.",
            source: "Malin SK, et al. Exercise and insulin resistance. In: Handbook of Exercise and Health. 2017",
            tags: ["insulin_resistance", "pcos", "exercise", "blood_sugar"]
          }
        ]
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════
  // SMART CONTEXT RETRIEVAL
  // Injects only the most relevant research based on user's actual data
  // ═══════════════════════════════════════════════════════════════════
  
  /**
   * Build a tag set from user's current context
   * This is how we match research to what's actually relevant for her right now
   */
  function buildUserTags({ symptoms = [], bloodworkFlags = [], latestCheckin = {}, wearableToday = null, conditions = [] }) {
    const tags = new Set()
  
    // From symptoms
    const symptomTagMap = {
      cramps: ['cramps', 'pain'],
      bloating: ['bloating', 'fluid_retention'],
      fatigue: ['fatigue', 'energy_low'],
      headache: ['headache', 'migraine'],
      'mood swings': ['mood_low', 'pms'],
      anxiety: ['anxiety', 'pms'],
      irritability: ['irritability', 'pms', 'pmdd'],
      insomnia: ['insomnia', 'sleep'],
      'breast tenderness': ['breast_tenderness'],
      acne: ['acne', 'skin'],
      'low energy': ['energy_low', 'fatigue'],
      'brain fog': ['focus', 'fatigue'],
      nausea: ['nausea'],
      'low libido': ['low_libido'],
      'back pain': ['pain', 'cramps'],
      'pelvic pain': ['pelvic_pain', 'cramps'],
      'ovulation pain': ['ovulation_pain'],
      cravings: ['cravings', 'appetite'],
    }
    symptoms.forEach(s => {
      const sLower = s.toLowerCase()
      Object.entries(symptomTagMap).forEach(([key, tagList]) => {
        if (sLower.includes(key)) tagList.forEach(t => tags.add(t))
      })
    })
  
    // From check-in scores
    if (latestCheckin.mood && parseInt(latestCheckin.mood) <= 5) tags.add('mood_low')
    if (latestCheckin.mood && parseInt(latestCheckin.mood) >= 8) tags.add('mood_high')
    if (latestCheckin.energy && parseInt(latestCheckin.energy) <= 4) tags.add('energy_low')
    if (latestCheckin.energy && parseInt(latestCheckin.energy) >= 8) tags.add('energy_high')
    if (latestCheckin.stress && parseInt(latestCheckin.stress) >= 7) tags.add('stress_high')
    if (latestCheckin.sleep_quality && parseInt(latestCheckin.sleep_quality) <= 4) tags.add('sleep')
  
    // From wearable data
    if (wearableToday) {
      if (wearableToday.avgSleepHrv) {
        // Flag low HRV (rough thresholds — ideally compare to personal baseline)
        const hrv = wearableToday.avgSleepHrv
        if (hrv < 30) tags.add('hrv_low')
        else if (hrv > 50) tags.add('hrv_high')
      }
      if (wearableToday.recoveryIndex) {
        const rec = wearableToday.recoveryIndex
        if (rec < 50) { tags.add('recovery_lower'); tags.add('hrv_low') }
        else if (rec > 75) tags.add('recovery_good')
      }
      if (wearableToday.sleepScore && wearableToday.sleepScore < 60) tags.add('insomnia')
    }
  
    // From bloodwork
    const bloodworkTagMap = {
      ferritin: ['iron', 'fatigue', 'anemia'],
      'vitamin d': ['vitamin_d_deficiency'],
      tsh: ['thyroid'],
      't3': ['thyroid', 't3_t4'],
      't4': ['thyroid', 't3_t4'],
      insulin: ['insulin_resistance'],
      testosterone: ['androgen_excess', 'pcos'],
      'free testosterone': ['androgen_excess', 'pcos'],
      dhea: ['androgen_excess', 'pcos'],
      cortisol: ['stress_high', 'cortisol'],
      b12: ['fatigue', 'energy_low'],
      folate: ['fatigue'],
      iron: ['iron', 'anemia'],
    }
    bloodworkFlags.forEach(flag => {
      const name = (flag.test_name || '').toLowerCase()
      Object.entries(bloodworkTagMap).forEach(([key, tagList]) => {
        if (name.includes(key)) tagList.forEach(t => tags.add(t))
      })
    })
  
    // From conditions
    const condTagMap = {
      pcos: ['pcos', 'insulin_resistance', 'androgen_excess'],
      endometriosis: ['endometriosis', 'pain', 'estrogen_dominance'],
      thyroid: ['thyroid'],
      hashimotos: ['thyroid', 'hashimotos', 'autoimmune'],
      hypothyroid: ['thyroid', 'hypothyroid'],
      pmdd: ['pmdd', 'mood_low', 'anxiety'],
      'iron deficiency': ['iron', 'fatigue', 'anemia'],
      'insulin resistance': ['insulin_resistance'],
      post_hbc: ['postHBC', 'post_pill'],
    }
    conditions.forEach(cond => {
      const cLower = cond.toLowerCase()
      Object.entries(condTagMap).forEach(([key, tagList]) => {
        if (cLower.includes(key)) tagList.forEach(t => tags.add(t))
      })
    })
  
    return tags
  }
  
  /**
   * Score a research item's relevance to the user's current tag set
   */
  function scoreRelevance(item, userTags) {
    if (!item.tags) return 0.5 // untagged items get a neutral score
    const matches = item.tags.filter(t => userTags.has(t)).length
    return matches / Math.max(item.tags.length, 1)
  }
  
  /**
   * Get research context string for AI prompts
   * 
   * New: smart retrieval based on user's actual symptoms, wearable data, and bloodwork
   * Rather than injecting everything, we score and prioritize what's relevant
   */
  export function getResearchContext(phaseKey, conditions = [], userContext = {}) {
    const phase = RESEARCH_DB[phaseKey]
    if (!phase) return ''
  
    // Build user tag profile from their actual data
    const userTags = buildUserTags({
      symptoms: userContext.symptoms || [],
      bloodworkFlags: userContext.bloodworkFlags || [],
      latestCheckin: userContext.latestCheckin || {},
      wearableToday: userContext.wearableToday || null,
      conditions,
    })
  
    let ctx = `\n## EVIDENCE-BASED RESEARCH (cite mechanisms in your response)\n`
    ctx += `### ${phaseKey.charAt(0).toUpperCase() + phaseKey.slice(1)} Phase\n`
    ctx += `Hormonal context: ${phase.hormoneContext}\n\n`
  
    // Helper: sort by relevance, take top N, format
    const formatItems = (items, label, topN = 4) => {
      if (!items || items.length === 0) return ''
      const scored = items
        .map(item => ({ item, score: scoreRelevance(item, userTags) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topN)
      let out = `**${label}:**\n`
      scored.forEach(({ item }) => {
        out += `- ${item.rec}\n  Mechanism: ${item.mechanism}\n  Source: ${item.source}\n`
      })
      return out
    }
  
    ctx += formatItems(phase.nutrition, 'Nutrition (evidence-backed)', 4)
    ctx += '\n' + formatItems(phase.supplements, 'Supplements (evidence-backed)', 4)
    ctx += '\n' + formatItems(phase.exercise, 'Exercise (evidence-backed)', 3)
  
    // Sleep section (new)
    if (phase.sleep && phase.sleep.length > 0) {
      const hasSleepTag = userTags.has('sleep') || userTags.has('insomnia') || userTags.has('hrv_low')
      if (hasSleepTag || phase.sleep.some(s => scoreRelevance(s, userTags) > 0)) {
        ctx += '\n' + formatItems(phase.sleep, 'Sleep optimization', 2)
      }
    }
  
    // Symptom-specific: inject only symptoms the user actually has
    if (phase.symptoms && userTags.size > 0) {
      const relevantSymptoms = Object.entries(phase.symptoms)
        .filter(([key, s]) => {
          const tags = s.tags || []
          return tags.some(t => userTags.has(t))
        })
      if (relevantSymptoms.length > 0) {
        ctx += `\n**Symptom-Specific (matches your logged symptoms):**\n`
        relevantSymptoms.slice(0, 4).forEach(([key, s]) => {
          ctx += `- ${key}: ${s.rec}\n  Mechanism: ${s.mechanism}\n  Source: ${s.source}\n`
        })
      }
    }
  
    // Condition-specific evidence
    const conditionKeyMap = {
      pcos: 'pcos', 'PCOS': 'pcos',
      pmdd: 'pmdd', 'PMDD': 'pmdd',
      endometriosis: 'endometriosis', 'Endometriosis': 'endometriosis',
      thyroid: 'thyroid', 'Thyroid': 'thyroid', 'Hypothyroidism': 'thyroid', 'Hashimotos': 'thyroid',
      'iron deficiency': 'ironDeficiency', 'Iron Deficiency': 'ironDeficiency',
      'insulin resistance': 'insulinResistance', 'Insulin Resistance': 'insulinResistance',
    }
  
    const addedConditions = new Set()
    conditions.forEach(cond => {
      const key = conditionKeyMap[cond] || Object.keys(conditionKeyMap).find(k => cond.toLowerCase().includes(k.toLowerCase()))
      if (key && RESEARCH_DB.conditions[conditionKeyMap[key] || key] && !addedConditions.has(key)) {
        addedConditions.add(key)
        const condData = RESEARCH_DB.conditions[conditionKeyMap[key] || key]
        ctx += `\n### Condition: ${cond}\n`
        const scored = condData.general
          .map(item => ({ item, score: scoreRelevance(item, userTags) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
        scored.forEach(({ item }) => {
          ctx += `- ${item.rec}\n  Mechanism: ${item.mechanism}\n  Source: ${item.source}\n`
        })
      }
    })
  
    // Post-HBC detection
    const isPostHBC = conditions.some(c => c.toLowerCase().includes('post') || c.toLowerCase().includes('hbc') || c.toLowerCase().includes('pill'))
    if (isPostHBC && !addedConditions.has('postHBC')) {
      ctx += `\n### Post-Hormonal Birth Control Recovery\n`
      RESEARCH_DB.conditions.postHBC.general.slice(0, 3).forEach(r => {
        ctx += `- ${r.rec}\n  Mechanism: ${r.mechanism}\n  Source: ${r.source}\n`
      })
    }
  
    ctx += `\n**IMPORTANT: Base recommendations on the evidence above. Always cite the mechanism. If recommending something not in this database, note it as "general guidance" not "evidence-backed."**`
  
    return ctx
  }