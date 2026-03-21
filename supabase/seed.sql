-- PeptidePin Seed Data: Common Peptides Catalog
-- Dosing information is for reference only. Users should consult their healthcare provider.

INSERT INTO public.peptides (name, slug, description, category, typical_vial_size_mcg, recommended_dose_mcg_min, recommended_dose_mcg_max, recommended_frequency, reconstitution_notes, half_life_hours, common_bac_water_ml, storage_instructions) VALUES

-- Healing & Recovery
('BPC-157', 'bpc-157', 'Body Protection Compound. A pentadecapeptide studied for its regenerative and healing properties on tendons, ligaments, and the gut.', 'healing', 5000, 200, 500, '1-2x daily', 'Reconstitute slowly by letting BAC water run down the side of the vial. Do not shake.', 4, 2.0, 'Refrigerate after reconstitution. Use within 30 days.'),

('TB-500', 'tb-500', 'Thymosin Beta-4 fragment. Studied for wound healing, tissue repair, and anti-inflammatory effects.', 'healing', 5000, 2000, 5000, '2x weekly', 'Reconstitute gently. Can be combined with BPC-157 in the same syringe.', 6, 2.0, 'Refrigerate. Use within 30 days of reconstitution.'),

-- Weight Loss / GLP-1
('Semaglutide', 'semaglutide', 'GLP-1 receptor agonist used for weight management. Reduces appetite and slows gastric emptying.', 'weight-loss', 5000, 250, 2500, 'Once weekly', 'Reconstitute with BAC water. Start at lowest dose and titrate up every 4 weeks.', 168, 2.0, 'Refrigerate. Stable for up to 56 days reconstituted.'),

('Tirzepatide', 'tirzepatide', 'Dual GIP/GLP-1 receptor agonist. More potent weight loss effects than GLP-1 agonists alone.', 'weight-loss', 10000, 2500, 15000, 'Once weekly', 'Reconstitute with BAC water. Titrate dose gradually over weeks.', 120, 2.0, 'Refrigerate after reconstitution. Use within 28 days.'),

('Retatrutide', 'retatrutide', 'Triple agonist (GLP-1/GIP/Glucagon). Next-generation weight management peptide.', 'weight-loss', 10000, 1000, 12000, 'Once weekly', 'Reconstitute with BAC water. Start low and titrate.', 120, 2.0, 'Refrigerate. Use within 28 days.'),

('AOD-9604', 'aod-9604', 'Anti-Obesity Drug fragment of growth hormone (176-191). Studied for fat metabolism without growth effects.', 'weight-loss', 5000, 250, 500, '1x daily', 'Reconstitute with BAC water. Best taken on an empty stomach.', 6, 2.0, 'Refrigerate. Use within 30 days.'),

-- Growth Hormone Secretagogues
('CJC-1295 (no DAC)', 'cjc-1295-no-dac', 'Modified GRF (1-29). Growth hormone releasing hormone analog. Short-acting, often paired with Ipamorelin.', 'growth', 5000, 100, 300, '1-3x daily', 'Reconstitute with BAC water. Often stacked with Ipamorelin.', 0.5, 2.0, 'Refrigerate. Use within 30 days.'),

('CJC-1295 (with DAC)', 'cjc-1295-dac', 'Drug Affinity Complex variant. Long-acting growth hormone releasing hormone analog.', 'growth', 5000, 1000, 2000, '1-2x weekly', 'Reconstitute with BAC water. Longer acting than no-DAC version.', 192, 2.0, 'Refrigerate. Use within 30 days.'),

('Ipamorelin', 'ipamorelin', 'Growth hormone secretagogue peptide. Selective GH release with minimal cortisol/prolactin increase.', 'growth', 5000, 100, 300, '1-3x daily', 'Reconstitute with BAC water. Often combined with CJC-1295 (no DAC).', 2, 2.0, 'Refrigerate. Use within 30 days.'),

('Tesamorelin', 'tesamorelin', 'Growth hormone releasing hormone analog. FDA-approved for reducing visceral adipose tissue.', 'growth', 2000, 1000, 2000, '1x daily', 'Reconstitute with provided diluent or BAC water.', 0.5, 2.0, 'Refrigerate. Use within 28 days.'),

-- Anti-Aging
('GHK-Cu', 'ghk-cu', 'Copper peptide complex. Studied for skin rejuvenation, wound healing, and anti-aging effects.', 'anti-aging', 5000, 200, 600, '1x daily', 'Reconstitute with BAC water. Can also be used topically.', 12, 2.0, 'Refrigerate. Use within 30 days.'),

('Epithalon', 'epithalon', 'Tetrapeptide studied for telomerase activation and anti-aging effects.', 'anti-aging', 10000, 5000, 10000, '1x daily for 10-20 days', 'Reconstitute with BAC water. Typically used in cycles.', 6, 2.0, 'Refrigerate. Use within 30 days.'),

('MOTS-c', 'mots-c', 'Mitochondrial-derived peptide. Studied for metabolic regulation, exercise mimetic effects, and longevity.', 'anti-aging', 5000, 5000, 10000, '3-5x weekly', 'Reconstitute with BAC water.', 24, 2.0, 'Refrigerate. Use within 30 days.'),

('SS-31 (Elamipretide)', 'ss-31', 'Mitochondria-targeted peptide. Studied for cellular energy production and mitochondrial health.', 'anti-aging', 5000, 5000, 50000, '1x daily', 'Reconstitute with BAC water.', 4, 2.0, 'Refrigerate. Use within 28 days.'),

-- Immune
('Thymosin Alpha-1', 'thymosin-alpha-1', 'Immune-modulating peptide. Approved in some countries for hepatitis and as an immune booster.', 'immune', 5000, 1600, 3200, '2-3x weekly', 'Reconstitute with BAC water.', 2, 2.0, 'Refrigerate. Use within 28 days.'),

-- Cognitive
('Selank', 'selank', 'Synthetic analog of immunomodulatory peptide tuftsin. Studied for anxiolytic and nootropic effects.', 'cognitive', 5000, 250, 500, '1-3x daily', 'Typically administered as a nasal spray. Can be reconstituted with BAC water for SubQ.', 0.3, 2.0, 'Refrigerate. Use within 30 days.'),

('Semax', 'semax', 'Synthetic ACTH analog. Studied for cognitive enhancement and neuroprotection.', 'cognitive', 5000, 200, 600, '1-3x daily', 'Typically administered as a nasal spray. Can be reconstituted with BAC water for SubQ.', 0.5, 2.0, 'Refrigerate. Use within 30 days.'),

('DSIP', 'dsip', 'Delta Sleep-Inducing Peptide. Studied for sleep regulation and stress modulation.', 'sleep', 5000, 100, 300, '1x daily before bed', 'Reconstitute with BAC water. Take 30-60 minutes before sleep.', 3, 2.0, 'Refrigerate. Use within 30 days.'),

-- Sexual Health
('PT-141 (Bremelanotide)', 'pt-141', 'Melanocortin receptor agonist. FDA-approved for hypoactive sexual desire disorder.', 'sexual-health', 10000, 500, 2000, 'As needed', 'Reconstitute with BAC water. Use at least 45 minutes before activity. Max once per 24h.', 4, 2.0, 'Refrigerate. Use within 30 days.'),

('Melanotan II', 'melanotan-ii', 'Melanocortin receptor agonist. Studied for tanning and sexual function effects.', 'sexual-health', 10000, 100, 500, '1x daily during loading, then maintenance', 'Reconstitute with BAC water. Start at lowest dose to assess tolerance.', 1, 2.0, 'Refrigerate. Protect from light. Use within 30 days.'),

('Kisspeptin', 'kisspeptin', 'Neuropeptide involved in reproductive hormone regulation. Studied for fertility and hormonal balance.', 'sexual-health', 5000, 100, 1000, '1-2x daily', 'Reconstitute with BAC water.', 0.5, 2.0, 'Refrigerate. Use within 28 days.'),

-- Other
('NAD+', 'nad-plus', 'Nicotinamide adenine dinucleotide. Coenzyme essential for cellular energy and DNA repair.', 'anti-aging', 50000, 50000, 100000, '2-3x weekly', 'Reconstitute with BAC water or sterile water. SubQ injection may cause a stinging sensation.', 4, 3.0, 'Refrigerate. Use within 14 days of reconstitution.'),

('Survodutide', 'survodutide', 'Dual glucagon/GLP-1 receptor agonist. Studied for weight management and NASH.', 'weight-loss', 10000, 600, 4800, 'Once weekly', 'Reconstitute with BAC water. Titrate gradually.', 120, 2.0, 'Refrigerate. Use within 28 days.');
