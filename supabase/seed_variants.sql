-- PeptidePin Seed: Variants, Titration Steps, SEO Content
-- Run AFTER 002_seo_calculator.sql migration
-- Run AFTER seed.sql (requires existing peptide rows)

-- ============================================================
-- UPDATE EXISTING PEPTIDES WITH SEO + UNIT DATA
-- ============================================================

-- BPC-157
UPDATE public.peptides SET
  unit_type = 'mcg',
  seo_title = 'BPC-157 Dosage Calculator — Reconstitution & Injection Units',
  seo_description = 'Free BPC-157 dosage calculator. Enter your vial size and BAC water amount to get exact syringe units. Works for 5mg and 10mg vials with visual syringe guide.',
  how_to_calculate = 'BPC-157 is typically dosed at 250-500mcg per injection, 1-2 times daily. For a 5mg vial reconstituted with 2mL of bacteriostatic water: concentration = 5000mcg / 2mL = 2500mcg/mL. For a 250mcg dose: 250 / 2500 = 0.1mL = 10 units on a U-100 insulin syringe. Most users run BPC-157 for 4-8 week cycles.',
  faq = '[
    {"q": "How much bacteriostatic water should I add to BPC-157?", "a": "For a 5mg vial, 2mL of BAC water gives a concentration of 2.5mg/mL (2500mcg/mL), making dose calculations simple. For a 10mg vial, 2mL gives 5mg/mL. You can use 1-3mL depending on your preferred injection volume."},
    {"q": "How many units of BPC-157 should I inject?", "a": "It depends on your vial size and BAC water amount. For example, with a 5mg vial and 2mL BAC water, a 250mcg dose equals 10 units on a U-100 insulin syringe. Use the calculator above to get your exact units."},
    {"q": "How many doses are in a 5mg BPC-157 vial?", "a": "At 250mcg per dose, a 5mg vial contains 20 doses. At 500mcg per dose (twice daily protocol), you get 10 doses, lasting about 5 days."},
    {"q": "Should I inject BPC-157 near the injury site?", "a": "BPC-157 has systemic effects regardless of injection site, but many users prefer injecting subcutaneously near the injury area. Standard subcutaneous injection sites (abdomen, thigh) also work well."},
    {"q": "How long does reconstituted BPC-157 last?", "a": "When reconstituted with bacteriostatic water and stored refrigerated at 2-8°C, BPC-157 remains stable for approximately 28-30 days. Do not freeze reconstituted peptides."}
  ]'::jsonb
WHERE slug = 'bpc-157';

-- TB-500
UPDATE public.peptides SET
  unit_type = 'mcg',
  seo_title = 'TB-500 Dosage Calculator — Reconstitution & Syringe Units',
  seo_description = 'Free TB-500 (Thymosin Beta-4) dosage calculator. Calculate exact injection units for 5mg and 10mg vials. Loading and maintenance phase dosing.',
  how_to_calculate = 'TB-500 is typically dosed at 2-2.5mg per injection during the loading phase (twice weekly for 4-6 weeks), then 2mg once weekly for maintenance. For a 5mg vial reconstituted with 1mL BAC water: concentration = 5000mcg/mL. For a 2.5mg (2500mcg) dose: 2500 / 5000 = 0.5mL = 50 units.',
  faq = '[
    {"q": "What is the TB-500 loading phase?", "a": "The loading phase typically involves injecting 2-2.5mg twice per week (Mon/Thu) for 4-6 weeks. This totals 4-5mg per week. After loading, reduce to a maintenance dose of 2mg once per week."},
    {"q": "How much BAC water for a TB-500 5mg vial?", "a": "1mL of BAC water gives 5mg/mL concentration, making a 2.5mg dose equal to 50 units. 2mL gives 2.5mg/mL, making 2.5mg = 100 units (a full 1mL syringe). Most users prefer 1mL for smaller injection volumes."},
    {"q": "Can I stack TB-500 with BPC-157?", "a": "Yes, BPC-157 and TB-500 are commonly stacked together for enhanced healing effects. They can be drawn into the same syringe for a single injection. A typical stack is BPC-157 250mcg daily + TB-500 2.5mg twice weekly."}
  ]'::jsonb
WHERE slug = 'tb-500';

-- Semaglutide
UPDATE public.peptides SET
  unit_type = 'mcg',
  seo_title = 'Semaglutide Dosage Calculator — Units, Titration & Reconstitution',
  seo_description = 'Free semaglutide dose calculator. Calculate exact syringe units for your vial concentration. Includes titration schedule from 0.25mg to 2.4mg with visual syringe guide.',
  how_to_calculate = 'Semaglutide is injected once weekly and requires a slow titration over 16+ weeks. For a 5mg vial reconstituted with 1mL BAC water: concentration = 5000mcg/mL. Starting dose of 0.25mg (250mcg): 250 / 5000 = 0.05mL = 5 units. At this starting dose, a single 5mg vial lasts approximately 20 weeks.',
  faq = '[
    {"q": "How do I calculate semaglutide units on an insulin syringe?", "a": "Divide your dose in mcg by your concentration in mcg/mL, then multiply by 100. Example: 5mg vial + 1mL BAC = 5000mcg/mL. For 0.25mg (250mcg): 250/5000 = 0.05mL × 100 = 5 units."},
    {"q": "What is the semaglutide titration schedule?", "a": "The standard titration is: 0.25mg for 4 weeks → 0.5mg for 4 weeks → 1mg for 4 weeks → 1.7mg for 4 weeks → 2.4mg maintenance. Each step should last at least 4 weeks before increasing."},
    {"q": "How long does a 5mg semaglutide vial last?", "a": "It depends on your dose. At 0.25mg/week (starting dose), one 5mg vial lasts 20 weeks. At 1mg/week, it lasts 5 weeks. At 2.4mg/week (maintenance), about 2 weeks."},
    {"q": "How much BAC water for semaglutide?", "a": "Most users add 1mL of BAC water to keep the concentration high (5mg/mL for a 5mg vial), resulting in small injection volumes. Some prefer 2mL for easier measurement of small starting doses."},
    {"q": "Can I take semaglutide with food?", "a": "Yes, injectable semaglutide can be taken regardless of meals. Choose a consistent day and time each week. Some users prefer injecting before bed to sleep through any initial nausea."}
  ]'::jsonb
WHERE slug = 'semaglutide';

-- Tirzepatide
UPDATE public.peptides SET
  unit_type = 'mcg',
  seo_title = 'Tirzepatide Dosage Calculator — Units, Titration Schedule & Vial Guide',
  seo_description = 'Free tirzepatide dose calculator for compounded vials. Calculate exact syringe units for 5mg to 60mg vials. Includes full titration schedule from 2.5mg to 15mg.',
  how_to_calculate = 'Tirzepatide is injected once weekly with a titration schedule over 20+ weeks. For a 30mg vial reconstituted with 3mL BAC water: concentration = 10000mcg/mL. Starting dose of 2.5mg (2500mcg): 2500 / 10000 = 0.25mL = 25 units on a U-100 syringe.',
  faq = '[
    {"q": "How do I calculate tirzepatide syringe units?", "a": "Divide your dose (in mcg) by your concentration (in mcg/mL), then multiply by 100 for syringe units. Example: 30mg vial + 3mL BAC = 10,000mcg/mL. For 5mg dose: 5000/10000 = 0.5mL = 50 units."},
    {"q": "What is the tirzepatide titration schedule?", "a": "Standard titration: 2.5mg × 4 weeks → 5mg × 4 weeks → 7.5mg × 4 weeks → 10mg × 4 weeks → 12.5mg × 4 weeks → 15mg maintenance. Many users stabilize at 5-10mg."},
    {"q": "How much BAC water for a 30mg tirzepatide vial?", "a": "3mL of BAC water gives a concentration of 10mg/mL, making math simple. A 5mg dose = 50 units, 10mg = 100 units (full 1mL syringe). Some users prefer 2mL for higher concentration."},
    {"q": "How long does a 30mg tirzepatide vial last?", "a": "At 2.5mg/week: 12 weeks. At 5mg/week: 6 weeks. At 10mg/week: 3 weeks. At 15mg/week: 2 weeks."},
    {"q": "Tirzepatide vs semaglutide — what is the difference?", "a": "Tirzepatide is a dual GIP/GLP-1 receptor agonist, while semaglutide targets only GLP-1. Clinical trials showed tirzepatide produced greater weight loss at comparable doses. Both require weekly injection and gradual dose titration."}
  ]'::jsonb
WHERE slug = 'tirzepatide';

-- Retatrutide
UPDATE public.peptides SET
  unit_type = 'mcg',
  seo_title = 'Retatrutide Dosage Calculator — Units & Titration Guide',
  seo_description = 'Free retatrutide dose calculator. Calculate exact syringe units for 5mg to 30mg vials. Includes titration schedule for this triple-agonist GLP-1/GIP/Glucagon peptide.',
  how_to_calculate = 'Retatrutide is a triple-agonist (GLP-1/GIP/Glucagon) injected once weekly. For a 10mg vial reconstituted with 2mL BAC water: concentration = 5000mcg/mL. Starting dose of 1mg (1000mcg): 1000 / 5000 = 0.2mL = 20 units.',
  faq = '[
    {"q": "What is retatrutide?", "a": "Retatrutide is a novel triple-agonist peptide targeting GLP-1, GIP, and glucagon receptors simultaneously. In clinical trials, it showed significant weight loss effects. It is currently in development and not yet FDA-approved."},
    {"q": "What is the retatrutide titration schedule?", "a": "Based on clinical trials: 1mg × 4 weeks → 2mg × 4 weeks → 4mg × 4 weeks → 8-12mg maintenance. Dose doubling at each step is more aggressive than semaglutide or tirzepatide."},
    {"q": "How much BAC water for a 10mg retatrutide vial?", "a": "2mL of BAC water gives 5mg/mL concentration. A 1mg starting dose = 20 units. A 4mg dose = 80 units. This keeps injection volumes manageable across the titration range."},
    {"q": "How does retatrutide compare to tirzepatide?", "a": "Retatrutide adds glucagon receptor activation on top of GIP and GLP-1, potentially providing additional metabolic benefits. Early trials showed up to 24% body weight loss at higher doses."}
  ]'::jsonb
WHERE slug = 'retatrutide';

-- CJC-1295 No DAC
UPDATE public.peptides SET
  unit_type = 'mcg',
  seo_title = 'CJC-1295 (No DAC) Dosage Calculator — Reconstitution & Units',
  seo_description = 'Free CJC-1295 no DAC dosage calculator. Calculate injection units for growth hormone peptide dosing. Often combined with Ipamorelin.',
  how_to_calculate = 'CJC-1295 (no DAC) is typically dosed at 100-300mcg per injection, often combined with Ipamorelin. For a 5mg vial reconstituted with 2.5mL BAC water: concentration = 2000mcg/mL. For a 200mcg dose: 200 / 2000 = 0.1mL = 10 units.',
  faq = '[
    {"q": "Should I take CJC-1295 with Ipamorelin?", "a": "Yes, CJC-1295 (no DAC) and Ipamorelin are commonly combined for synergistic growth hormone release. A typical protocol is 200mcg of each, injected together before bed on an empty stomach, 5 days on / 2 days off."},
    {"q": "When should I inject CJC-1295?", "a": "Best taken before bed on an empty stomach (2+ hours fasted). This amplifies the natural growth hormone pulse during deep sleep. Eating carbs or fats close to injection time can blunt the GH response."},
    {"q": "What is the difference between CJC-1295 with and without DAC?", "a": "CJC-1295 no DAC (also called Mod GRF 1-29) has a short half-life of about 30 minutes and produces a GH pulse. CJC-1295 with DAC has a half-life of about 8 days and elevates GH levels continuously. Most users prefer no DAC for more physiological pulsatile release."}
  ]'::jsonb
WHERE slug = 'cjc-1295-no-dac';

-- Ipamorelin
UPDATE public.peptides SET
  unit_type = 'mcg',
  seo_title = 'Ipamorelin Dosage Calculator — Units & Reconstitution Guide',
  seo_description = 'Free Ipamorelin dosage calculator. Calculate syringe units for growth hormone secretagogue dosing. Works with 5mg and 10mg vials.',
  how_to_calculate = 'Ipamorelin is typically dosed at 100-300mcg per injection, 1-3 times daily. For a 5mg vial reconstituted with 2.5mL BAC water: concentration = 2000mcg/mL. For a 200mcg dose: 200 / 2000 = 0.1mL = 10 units.',
  faq = '[
    {"q": "How often should I take Ipamorelin?", "a": "Most protocols use 200-300mcg before bed, 5 days on / 2 days off, for 8-12 week cycles. Some protocols include 2-3 injections daily (upon waking, post-workout, and before bed), each at 100-200mcg."},
    {"q": "Does Ipamorelin need to be taken on an empty stomach?", "a": "Yes, Ipamorelin should be injected after fasting for at least 2 hours. Food, especially carbohydrates and fats, can significantly blunt the growth hormone release. Wait at least 30 minutes after injection before eating."}
  ]'::jsonb
WHERE slug = 'ipamorelin';

-- GHK-Cu
UPDATE public.peptides SET
  unit_type = 'mcg',
  seo_title = 'GHK-Cu Dosage Calculator — Copper Peptide Reconstitution Guide',
  seo_description = 'Free GHK-Cu copper peptide dosage calculator. Calculate injection units for anti-aging and wound healing protocols. Supports 5mg to 100mg vials.',
  how_to_calculate = 'GHK-Cu is typically dosed at 200-600mcg per injection once daily. For a 5mg vial reconstituted with 2mL BAC water: concentration = 2500mcg/mL. For a 500mcg dose: 500 / 2500 = 0.2mL = 20 units.',
  faq = '[
    {"q": "What is GHK-Cu used for?", "a": "GHK-Cu is a copper peptide studied for skin rejuvenation, wound healing, hair growth, and anti-aging effects. It can be administered via subcutaneous injection or applied topically as a cream or serum."},
    {"q": "Can GHK-Cu be used topically?", "a": "Yes, GHK-Cu is available as a topical cream or serum for direct skin application. Injectable forms provide systemic effects, while topical application targets specific areas like the face, scalp, or injury sites."}
  ]'::jsonb
WHERE slug = 'ghk-cu';

-- PT-141
UPDATE public.peptides SET
  unit_type = 'mcg',
  seo_title = 'PT-141 (Bremelanotide) Dosage Calculator — Units & Timing Guide',
  seo_description = 'Free PT-141 dosage calculator. Calculate exact syringe units for this FDA-approved peptide. Includes timing and frequency guidance.',
  how_to_calculate = 'PT-141 is used as-needed, typically 500-2000mcg injected subcutaneously 45-60 minutes before activity. For a 10mg vial reconstituted with 2mL BAC water: concentration = 5000mcg/mL. For a 1000mcg dose: 1000 / 5000 = 0.2mL = 20 units.',
  faq = '[
    {"q": "How long before does PT-141 take to work?", "a": "PT-141 typically takes 45-60 minutes to reach peak effects. Some users report effects lasting 24-72 hours. Do not use more than once in 24 hours."},
    {"q": "What dose of PT-141 should I start with?", "a": "Start with 500mcg to assess tolerance, as PT-141 can cause nausea at higher doses. Most users find their effective dose between 500-1500mcg. Do not exceed 2000mcg per dose."}
  ]'::jsonb
WHERE slug = 'pt-141';

-- Sermorelin
UPDATE public.peptides SET
  unit_type = 'mcg',
  seo_title = 'Sermorelin Dosage Calculator — Reconstitution & Injection Units',
  seo_description = 'Free Sermorelin dosage calculator. Calculate syringe units for this growth hormone releasing hormone. Works with 5mg and 10mg vials.',
  how_to_calculate = 'Sermorelin is typically dosed at 200-500mcg before bed on an empty stomach. For a 5mg vial reconstituted with 2mL BAC water: concentration = 2500mcg/mL. For a 300mcg dose: 300 / 2500 = 0.12mL = 12 units.',
  faq = '[
    {"q": "When should I take Sermorelin?", "a": "Inject Sermorelin before bed, at least 2 hours after your last meal. This timing works with your natural growth hormone cycle, which peaks during deep sleep."},
    {"q": "How long does Sermorelin take to work?", "a": "Most users notice improved sleep quality within 1-2 weeks. Body composition changes typically become noticeable after 3-6 months of consistent use."}
  ]'::jsonb
WHERE slug = 'sermorelin';

-- AOD-9604
UPDATE public.peptides SET
  unit_type = 'mcg',
  seo_title = 'AOD-9604 Dosage Calculator — Fat Loss Peptide Reconstitution',
  seo_description = 'Free AOD-9604 dosage calculator. Calculate injection units for this growth hormone fragment. Includes reconstitution guide for 2mg and 5mg vials.',
  how_to_calculate = 'AOD-9604 is typically dosed at 250-500mcg once daily, best taken on an empty stomach in the morning. For a 5mg vial reconstituted with 2mL BAC water: concentration = 2500mcg/mL. For a 300mcg dose: 300 / 2500 = 0.12mL = 12 units.',
  faq = '[
    {"q": "When should I take AOD-9604?", "a": "Best taken first thing in the morning on an empty stomach, or before fasted cardio. Wait 30 minutes before eating. Some users also take a second dose before bed."},
    {"q": "Does AOD-9604 affect growth hormone levels?", "a": "No, AOD-9604 is the fat-metabolizing fragment of growth hormone (amino acids 176-191). It stimulates fat breakdown without affecting blood sugar, growth, or other GH-related effects."}
  ]'::jsonb
WHERE slug = 'aod-9604';

-- MOTS-c
UPDATE public.peptides SET
  unit_type = 'mcg',
  seo_title = 'MOTS-c Dosage Calculator — Mitochondrial Peptide Reconstitution',
  seo_description = 'Free MOTS-c dosage calculator. Calculate injection units for this mitochondrial peptide. Supports 5mg to 40mg vials.',
  how_to_calculate = 'MOTS-c is typically dosed at 5-10mg per injection, 3-5 times per week. For a 10mg vial reconstituted with 2mL BAC water: concentration = 5000mcg/mL. For a 5mg (5000mcg) dose: 5000 / 5000 = 1.0mL = 100 units (full 1mL syringe).',
  faq = '[
    {"q": "What is MOTS-c?", "a": "MOTS-c is a mitochondrial-derived peptide that acts as an exercise mimetic. It is studied for metabolic regulation, insulin sensitivity, cellular energy production, and longevity."},
    {"q": "How much BAC water for MOTS-c?", "a": "For a 10mg vial, 2mL gives 5mg/mL. Since MOTS-c doses are relatively large (5-10mg), you may need a 1mL syringe. Some users prefer lower BAC water (1mL) to get higher concentration, but this means a full syringe for a 10mg dose."}
  ]'::jsonb
WHERE slug = 'mots-c';

-- ============================================================
-- ADD NEW PEPTIDES: HCG and HGH (IU-based)
-- ============================================================

INSERT INTO public.peptides (name, slug, description, category, typical_vial_size_mcg, recommended_dose_mcg_min, recommended_dose_mcg_max, recommended_frequency, reconstitution_notes, half_life_hours, common_bac_water_ml, storage_instructions, unit_type, seo_title, seo_description, how_to_calculate, faq) VALUES

('HCG (Human Chorionic Gonadotropin)', 'hcg', 'Glycoprotein hormone used for testosterone support, fertility, and post-cycle therapy. Measured in International Units (IU).', 'other', 5000, 250, 1000, '2-3x weekly', 'Reconstitute with included diluent or BAC water. Do not shake. Refrigerate immediately.', 33, 2.0, 'Refrigerate after reconstitution. Use within 60 days.', 'iu',
  'HCG Dosage Calculator — IU to Syringe Units Conversion',
  'Free HCG dosage calculator. Convert IU (International Units) to syringe units. Calculate exact injection volume for 5000 IU and 10000 IU vials.',
  'HCG is measured in International Units (IU), not mg or mcg. For a 5000 IU vial reconstituted with 2mL BAC water: concentration = 2500 IU/mL. For a 500 IU dose: 500 / 2500 = 0.2mL = 20 units on an insulin syringe.',
  '[
    {"q": "How do I calculate HCG units on an insulin syringe?", "a": "The math is the same as with mg-based peptides, just using IU instead. Divide your dose (in IU) by the concentration (IU/mL), multiply by 100 for syringe units. Example: 5000 IU vial + 2mL BAC = 2500 IU/mL. For 500 IU: 500/2500 = 0.2mL = 20 units."},
    {"q": "What is the typical HCG dose?", "a": "For testosterone support/TRT: 250-500 IU 2-3 times per week. For fertility: 1000-2000 IU 2-3 times per week. For post-cycle therapy: 500-1000 IU every other day for 2-3 weeks. Always follow your prescribing physician guidance."},
    {"q": "How long does reconstituted HCG last?", "a": "HCG reconstituted with bacteriostatic water lasts up to 60 days refrigerated. With sterile water, use within 48 hours. Keep refrigerated at 2-8°C at all times."},
    {"q": "What is the difference between IU and mg?", "a": "IU (International Units) is a measure of biological activity, not weight. For HCG, 1 IU is not equivalent to a specific weight in mg. The conversion depends on the specific preparation and purity. Always dose HCG in IU as labeled."}
  ]'::jsonb),

('HGH (Human Growth Hormone)', 'hgh', 'Recombinant human growth hormone (somatropin, 191 amino acids). Used for growth hormone deficiency and anti-aging. Measured in IU.', 'growth', 10, 1, 4, '1x daily', 'Reconstitute with BAC water or provided diluent. Let water run down side of vial. Do not shake.', 3, 1.0, 'Refrigerate after reconstitution. Use within 30 days. Do not freeze.', 'iu',
  'HGH Dosage Calculator — IU to Syringe Units Conversion',
  'Free HGH (growth hormone) dosage calculator. Convert IU to injection units. Calculate exact syringe volume for 10 IU, 12 IU, 24 IU, and 36 IU vials.',
  'HGH is measured in International Units (IU). For a 10 IU vial reconstituted with 1mL BAC water: concentration = 10 IU/mL. For a 2 IU dose: 2 / 10 = 0.2mL = 20 units on an insulin syringe.',
  '[
    {"q": "How do I calculate HGH syringe units?", "a": "Same formula as other peptides but using IU. Divide your dose (IU) by concentration (IU/mL), multiply by 100. Example: 10 IU vial + 1mL BAC = 10 IU/mL. For 2 IU: 2/10 = 0.2mL = 20 units."},
    {"q": "What is a typical HGH dose?", "a": "Anti-aging/general wellness: 1-2 IU/day. Fat loss: 2-4 IU/day. Performance: 4-6 IU/day. Higher doses increase the risk of side effects. Start low and assess tolerance."},
    {"q": "When should I inject HGH?", "a": "Most users inject first thing in the morning on an empty stomach, or before bed. For fat loss, morning injection on an empty stomach is preferred. Split doses (half AM, half PM) are common for higher daily amounts."},
    {"q": "How is HGH different from growth hormone peptides?", "a": "HGH is actual recombinant growth hormone (somatropin). Peptides like CJC-1295 and Ipamorelin stimulate your body to produce its own growth hormone. HGH provides a direct, immediate supply of GH."}
  ]'::jsonb);

-- ============================================================
-- PEPTIDE VARIANTS (size options)
-- ============================================================

-- BPC-157 variants
INSERT INTO public.peptide_variants (peptide_id, size_mcg, size_label, common_bac_water_ml, is_default, sort_order)
SELECT id, 5000, '5mg', 2.0, true, 1 FROM public.peptides WHERE slug = 'bpc-157'
UNION ALL
SELECT id, 10000, '10mg', 2.0, false, 2 FROM public.peptides WHERE slug = 'bpc-157';

-- TB-500 variants
INSERT INTO public.peptide_variants (peptide_id, size_mcg, size_label, common_bac_water_ml, is_default, sort_order)
SELECT id, 5000, '5mg', 1.0, true, 1 FROM public.peptides WHERE slug = 'tb-500'
UNION ALL
SELECT id, 10000, '10mg', 2.0, false, 2 FROM public.peptides WHERE slug = 'tb-500';

-- Semaglutide variants
INSERT INTO public.peptide_variants (peptide_id, size_mcg, size_label, common_bac_water_ml, is_default, sort_order)
SELECT id, 3000, '3mg', 1.0, false, 1 FROM public.peptides WHERE slug = 'semaglutide'
UNION ALL
SELECT id, 5000, '5mg', 1.0, true, 2 FROM public.peptides WHERE slug = 'semaglutide'
UNION ALL
SELECT id, 10000, '10mg', 2.0, false, 3 FROM public.peptides WHERE slug = 'semaglutide'
UNION ALL
SELECT id, 20000, '20mg', 2.0, false, 4 FROM public.peptides WHERE slug = 'semaglutide';

-- Tirzepatide variants
INSERT INTO public.peptide_variants (peptide_id, size_mcg, size_label, common_bac_water_ml, is_default, sort_order)
SELECT id, 5000, '5mg', 1.0, false, 1 FROM public.peptides WHERE slug = 'tirzepatide'
UNION ALL
SELECT id, 10000, '10mg', 2.0, false, 2 FROM public.peptides WHERE slug = 'tirzepatide'
UNION ALL
SELECT id, 15000, '15mg', 2.0, false, 3 FROM public.peptides WHERE slug = 'tirzepatide'
UNION ALL
SELECT id, 30000, '30mg', 3.0, true, 4 FROM public.peptides WHERE slug = 'tirzepatide'
UNION ALL
SELECT id, 60000, '60mg', 3.0, false, 5 FROM public.peptides WHERE slug = 'tirzepatide';

-- Retatrutide variants
INSERT INTO public.peptide_variants (peptide_id, size_mcg, size_label, common_bac_water_ml, is_default, sort_order)
SELECT id, 5000, '5mg', 1.0, false, 1 FROM public.peptides WHERE slug = 'retatrutide'
UNION ALL
SELECT id, 10000, '10mg', 2.0, true, 2 FROM public.peptides WHERE slug = 'retatrutide'
UNION ALL
SELECT id, 20000, '20mg', 2.0, false, 3 FROM public.peptides WHERE slug = 'retatrutide'
UNION ALL
SELECT id, 30000, '30mg', 3.0, false, 4 FROM public.peptides WHERE slug = 'retatrutide';

-- CJC-1295 No DAC variants
INSERT INTO public.peptide_variants (peptide_id, size_mcg, size_label, common_bac_water_ml, is_default, sort_order)
SELECT id, 5000, '5mg', 2.5, true, 1 FROM public.peptides WHERE slug = 'cjc-1295-no-dac';

-- Ipamorelin variants
INSERT INTO public.peptide_variants (peptide_id, size_mcg, size_label, common_bac_water_ml, is_default, sort_order)
SELECT id, 5000, '5mg', 2.5, true, 1 FROM public.peptides WHERE slug = 'ipamorelin'
UNION ALL
SELECT id, 10000, '10mg', 2.5, false, 2 FROM public.peptides WHERE slug = 'ipamorelin';

-- GHK-Cu variants
INSERT INTO public.peptide_variants (peptide_id, size_mcg, size_label, common_bac_water_ml, is_default, sort_order)
SELECT id, 5000, '5mg', 2.0, true, 1 FROM public.peptides WHERE slug = 'ghk-cu'
UNION ALL
SELECT id, 10000, '10mg', 2.0, false, 2 FROM public.peptides WHERE slug = 'ghk-cu'
UNION ALL
SELECT id, 50000, '50mg', 3.0, false, 3 FROM public.peptides WHERE slug = 'ghk-cu';

-- PT-141 variants
INSERT INTO public.peptide_variants (peptide_id, size_mcg, size_label, common_bac_water_ml, is_default, sort_order)
SELECT id, 10000, '10mg', 2.0, true, 1 FROM public.peptides WHERE slug = 'pt-141';

-- Sermorelin variants
INSERT INTO public.peptide_variants (peptide_id, size_mcg, size_label, common_bac_water_ml, is_default, sort_order)
SELECT id, 5000, '5mg', 2.0, true, 1 FROM public.peptides WHERE slug = 'sermorelin'
UNION ALL
SELECT id, 10000, '10mg', 2.0, false, 2 FROM public.peptides WHERE slug = 'sermorelin';

-- AOD-9604 variants
INSERT INTO public.peptide_variants (peptide_id, size_mcg, size_label, common_bac_water_ml, is_default, sort_order)
SELECT id, 2000, '2mg', 1.0, false, 1 FROM public.peptides WHERE slug = 'aod-9604'
UNION ALL
SELECT id, 5000, '5mg', 2.0, true, 2 FROM public.peptides WHERE slug = 'aod-9604';

-- MOTS-c variants
INSERT INTO public.peptide_variants (peptide_id, size_mcg, size_label, common_bac_water_ml, is_default, sort_order)
SELECT id, 5000, '5mg', 1.0, false, 1 FROM public.peptides WHERE slug = 'mots-c'
UNION ALL
SELECT id, 10000, '10mg', 2.0, true, 2 FROM public.peptides WHERE slug = 'mots-c';

-- HCG variants (IU-based — size_mcg stores IU value for IU-type peptides)
INSERT INTO public.peptide_variants (peptide_id, size_mcg, size_label, common_bac_water_ml, is_default, sort_order)
SELECT id, 5000, '5000 IU', 2.0, true, 1 FROM public.peptides WHERE slug = 'hcg'
UNION ALL
SELECT id, 10000, '10000 IU', 2.0, false, 2 FROM public.peptides WHERE slug = 'hcg';

-- HGH variants (IU-based)
INSERT INTO public.peptide_variants (peptide_id, size_mcg, size_label, common_bac_water_ml, is_default, sort_order)
SELECT id, 10, '10 IU', 1.0, true, 1 FROM public.peptides WHERE slug = 'hgh'
UNION ALL
SELECT id, 12, '12 IU', 1.0, false, 2 FROM public.peptides WHERE slug = 'hgh'
UNION ALL
SELECT id, 24, '24 IU', 1.0, false, 3 FROM public.peptides WHERE slug = 'hgh'
UNION ALL
SELECT id, 36, '36 IU', 1.0, false, 4 FROM public.peptides WHERE slug = 'hgh';

-- ============================================================
-- TITRATION STEPS (GLP-1 dose escalation schedules)
-- ============================================================

-- Semaglutide titration (Wegovy protocol)
INSERT INTO public.peptide_titration_steps (peptide_id, step_number, dose_mcg, duration_weeks, label, notes)
SELECT id, 1, 250, 4, 'Month 1', 'Starting dose. Assess tolerance before increasing.' FROM public.peptides WHERE slug = 'semaglutide'
UNION ALL
SELECT id, 2, 500, 4, 'Month 2', 'First dose increase. Nausea may occur for 2-3 days.' FROM public.peptides WHERE slug = 'semaglutide'
UNION ALL
SELECT id, 3, 1000, 4, 'Month 3', 'Therapeutic dose for many users. Evaluate progress.' FROM public.peptides WHERE slug = 'semaglutide'
UNION ALL
SELECT id, 4, 1700, 4, 'Month 4', 'Higher therapeutic dose. Monitor side effects.' FROM public.peptides WHERE slug = 'semaglutide'
UNION ALL
SELECT id, 5, 2400, 0, 'Maintenance', 'Maximum dose. Stay here or reduce to tolerated level.' FROM public.peptides WHERE slug = 'semaglutide';

-- Tirzepatide titration (Zepbound protocol)
INSERT INTO public.peptide_titration_steps (peptide_id, step_number, dose_mcg, duration_weeks, label, notes)
SELECT id, 1, 2500, 4, 'Month 1', 'Starting dose. Mandatory minimum 4 weeks.' FROM public.peptides WHERE slug = 'tirzepatide'
UNION ALL
SELECT id, 2, 5000, 4, 'Month 2', 'First maintenance option. Many users stabilize here.' FROM public.peptides WHERE slug = 'tirzepatide'
UNION ALL
SELECT id, 3, 7500, 4, 'Month 3', 'Optional increase if weight loss plateaus.' FROM public.peptides WHERE slug = 'tirzepatide'
UNION ALL
SELECT id, 4, 10000, 4, 'Month 4', 'Second maintenance option. Strong appetite suppression.' FROM public.peptides WHERE slug = 'tirzepatide'
UNION ALL
SELECT id, 5, 12500, 4, 'Month 5', 'Optional increase. Monitor GI side effects.' FROM public.peptides WHERE slug = 'tirzepatide'
UNION ALL
SELECT id, 6, 15000, 0, 'Maintenance', 'Maximum dose. Stay here or reduce to tolerated level.' FROM public.peptides WHERE slug = 'tirzepatide';

-- Retatrutide titration (Clinical trial protocol)
INSERT INTO public.peptide_titration_steps (peptide_id, step_number, dose_mcg, duration_weeks, label, notes)
SELECT id, 1, 1000, 4, 'Month 1', 'Starting dose. Triple-agonist may cause more GI effects.' FROM public.peptides WHERE slug = 'retatrutide'
UNION ALL
SELECT id, 2, 2000, 4, 'Month 2', 'Double the starting dose. Monitor tolerance closely.' FROM public.peptides WHERE slug = 'retatrutide'
UNION ALL
SELECT id, 3, 4000, 4, 'Month 3', 'Significant dose increase. Assess before continuing.' FROM public.peptides WHERE slug = 'retatrutide'
UNION ALL
SELECT id, 4, 8000, 0, 'Maintenance', 'Target maintenance dose. Some protocols go up to 12mg.' FROM public.peptides WHERE slug = 'retatrutide';
