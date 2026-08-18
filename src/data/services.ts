export type ServiceCategory = 'injectables' | 'hifu' | 'radio-frequency' | 'body-contouring' | 'hair-restoration' | 'laser' | 'hormone-wellness';

export interface Treatment {
  slug: string;
  name: string;
  category: ServiceCategory;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  whatToExpect: string[];
  duration: string;
  downtime: string;
  targetAreas?: string[];
  videoUrl?: string;
  faqs: { question: string; answer: string }[];
}

export interface ServiceCategoryInfo {
  slug: ServiceCategory;
  name: string;
  headline: string;
  description: string;
  icon: string;
  metaTitle: string;
  metaDescription: string;
  faqs: { question: string; answer: string }[];
}

export const serviceCategories: ServiceCategoryInfo[] = [
  {
    slug: 'injectables',
    name: 'Injectables & Regenerative',
    headline: 'Restore, Refresh & Rejuvenate',
    description: 'From Botox and dermal fillers to cutting-edge PRP and PRF therapies, our injectable and regenerative treatments help you look and feel your best with minimal downtime.',
    icon: 'Syringe',
    metaTitle: 'Injectables & Regenerative Treatments in Huntington Beach',
    metaDescription: 'Botox, PRP Microneedling, PRP Hair Restoration, PRF Treatment, and Sculptra at InfinityU Med Spa in Huntington Beach, CA.',
    faqs: [
      {
        question: 'Which injectable is right for me?',
        answer:
          'It depends on your goals. Botox smooths dynamic wrinkles caused by muscle movement, while fillers and regenerative treatments like PRP, PRF, and Sculptra restore volume, improve skin quality, or stimulate collagen. A complimentary consultation is the best way to build a personalized plan.',
      },
      {
        question: 'Will I look "done" or overdone?',
        answer:
          'Our approach is natural-first. We dose conservatively, refine in stages when needed, and aim for refreshed — not frozen. You should look like yourself on your best day.',
      },
      {
        question: 'Is there any downtime after an injectable?',
        answer:
          'Most injectables have minimal downtime. You can expect possible pinpoint redness, slight swelling, or mild bruising that typically resolves within a few hours to a couple of days. Regenerative treatments like PRP microneedling involve 2–3 days of redness.',
      },
      {
        question: 'What\'s the difference between PRP and PRF?',
        answer:
          'Both use your own blood, but PRF is processed at a slower spin, preserving more growth factors and white blood cells and forming a fibrin matrix that releases those healing proteins gradually — generally producing stronger, longer-lasting results.',
      },
      {
        question: 'How do I prepare for an injectable appointment?',
        answer:
          'Avoid blood-thinning medications, alcohol, fish oil, and anti-inflammatories for 48 hours before your appointment when possible. Come with clean skin (no makeup if possible) and eat beforehand — especially for blood-draw-based treatments like PRP and PRF.',
      },
      {
        question: 'How often should I come back?',
        answer:
          'Botox typically lasts 3–4 months. Fillers and Sculptra last much longer (6 months to 2+ years). PRP/PRF series are usually 3–4 sessions spaced 4–6 weeks apart, with maintenance every 6–12 months.',
      },
    ],
  },
  {
    slug: 'hifu',
    name: 'HiFu',
    headline: 'Non-Invasive Skin Tightening & Lifting',
    description: 'High-Intensity Focused Ultrasound (HiFu) delivers precise ultrasound energy deep beneath the skin to stimulate collagen production and tighten tissue without surgery or downtime.',
    icon: 'Waves',
    metaTitle: 'HiFu Treatment in Huntington Beach',
    metaDescription: 'Non-invasive HiFu skin tightening for face, neck, chin, tummy, and underarm at InfinityU Med Spa in Huntington Beach, CA.',
    faqs: [
      {
        question: 'How does HiFu work?',
        answer:
          'HiFu uses focused ultrasound to deliver precise thermal energy deep beneath the surface of the skin. That controlled heat triggers a natural wound-healing response, prompting new collagen and elastin production that tightens and lifts tissue over the following weeks.',
      },
      {
        question: 'How is HiFu different from lasers, RF, or microneedling?',
        answer:
          'Lasers target the skin\'s surface and upper layers. Radio Frequency warms broader tissue volumes. Microneedling creates controlled micro-injuries. HiFu is unique in that it can reach deeper foundational layers — including the SMAS layer targeted in surgical facelifts — without damaging the surface.',
      },
      {
        question: 'Is HiFu painful?',
        answer:
          'Most patients describe it as tolerable warmth with occasional brief tingling or prickling sensations as the energy pulses are delivered. We can adjust settings for comfort and the sensation fades immediately after treatment.',
      },
      {
        question: 'How many sessions do I need?',
        answer:
          'Many patients see meaningful improvement after a single session, with optimal results from 1–2 treatments depending on skin laxity and goals. Annual maintenance helps sustain results.',
      },
      {
        question: 'When will I see results — and how long do they last?',
        answer:
          'Some tightening is visible immediately, but the best results develop gradually over 2–3 months as new collagen matures. Results commonly last 12–18 months.',
      },
      {
        question: 'Is there any downtime?',
        answer:
          'None to minimal. You can expect possible mild redness or slight tenderness for a few hours. You can return to normal activities, makeup, and skincare the same day.',
      },
      {
        question: 'Who is a good candidate for HiFu?',
        answer:
          'Adults with mild to moderate skin laxity — typically in the 30s through 60s — who want lifting and tightening without surgery. HiFu is not a replacement for a facelift in cases of significant laxity; we\'ll be honest about expected outcomes during your consultation.',
      },
    ],
  },
  {
    slug: 'radio-frequency',
    name: 'Radio Frequency (RF)',
    headline: 'Advanced Skin Tightening & Contouring',
    description: 'Radio Frequency treatments use controlled thermal energy to stimulate collagen remodeling, tighten skin, and improve overall tone and texture for a more youthful appearance.',
    icon: 'Zap',
    metaTitle: 'Radio Frequency Skin Tightening in Huntington Beach',
    metaDescription: 'RF skin tightening treatments for face, chin, and arms at InfinityU Med Spa in Huntington Beach, CA.',
    faqs: [
      {
        question: 'How does Radio Frequency tighten skin?',
        answer:
          'RF heats the deeper layers of your skin in a controlled, uniform way. That thermal signal contracts existing collagen and stimulates your body to produce new collagen and elastin — gradually firming and smoothing the skin.',
      },
      {
        question: 'Is RF safe for all skin tones?',
        answer:
          'Yes. Unlike some laser treatments, RF energy is not absorbed by pigment, making it safe for every Fitzpatrick skin type without increased risk of hyperpigmentation.',
      },
      {
        question: 'What does an RF session feel like?',
        answer:
          'Most patients describe it as a warm, relaxing massage. The handpiece glides across the treatment area in gentle, heated passes. If the sensation is ever too warm, we adjust the settings immediately.',
      },
      {
        question: 'How many treatments will I need?',
        answer:
          'A series of 4–6 sessions spaced 1–2 weeks apart is typical for optimal results. Many patients start to see tightening and brighter skin after the first session, with continued improvement as new collagen forms.',
      },
      {
        question: 'Can RF be combined with other treatments?',
        answer:
          'Absolutely. RF pairs particularly well with HiFu, microneedling, and injectables. Combined plans often deliver better results than any single modality on its own — your provider will design a plan around your goals.',
      },
      {
        question: 'Is there any downtime?',
        answer:
          'None. You may notice a warm, flushed glow for an hour or two after treatment, but you can apply makeup and return to normal activities right away.',
      },
      {
        question: 'How long do results last?',
        answer:
          'Results typically last 12–18 months. Quarterly maintenance sessions help extend and compound improvements over time.',
      },
    ],
  },
  {
    slug: 'body-contouring',
    name: 'Body Contouring',
    headline: 'Sculpt Your Ideal Silhouette',
    description: 'Our body contouring treatments use advanced non-invasive technology to reduce stubborn fat, tighten skin, and reshape your body without surgery or extended recovery time.',
    icon: 'Sparkles',
    metaTitle: 'Body Contouring in Huntington Beach',
    metaDescription: 'Non-invasive body contouring and fat reduction at InfinityU Med Spa in Huntington Beach, CA.',
    faqs: [
      {
        question: 'Is body contouring a weight-loss program?',
        answer:
          'No. Body contouring is designed for targeted fat reduction and skin tightening in stubborn areas — not overall weight loss. It works best for people at or near a stable, healthy weight who want to refine specific regions.',
      },
      {
        question: 'Which areas can be treated?',
        answer:
          'Common areas include the abdomen, flanks ("love handles"), inner and outer thighs, upper arms, bra-line, back, and under the chin. During your consultation we map your target areas and build a plan around them.',
      },
      {
        question: 'How many sessions will I need?',
        answer:
          'Most patients reach their goals in 4–8 sessions, depending on the treatment area and how much change they\'re after. We build this into your personalized plan up front so there are no surprises.',
      },
      {
        question: 'When will I see results?',
        answer:
          'Early changes often appear within 2–4 weeks. Because your body processes treated fat cells gradually, most patients see full results between 8 and 12 weeks after their final session.',
      },
      {
        question: 'Are the results permanent?',
        answer:
          'Treated fat cells are eliminated and do not come back. Remaining fat cells can still grow or shrink, so maintaining a healthy lifestyle is key to keeping your results long-term.',
      },
      {
        question: 'Is body contouring painful? What does it feel like?',
        answer:
          'Most technologies produce warming, cooling, or a pulsing sensation — all tolerable without anesthesia. Many patients read, scroll, or relax during treatment.',
      },
      {
        question: 'Is there downtime?',
        answer:
          'Minimal to none. You may notice temporary redness, mild tenderness, or a warm sensation in the treated area. Most patients return to normal activities — including workouts — the same or next day.',
      },
      {
        question: 'Who is NOT a candidate?',
        answer:
          'Pregnant or nursing patients, and those with certain medical conditions, should wait or choose alternatives. We go through a full screening at your consultation to make sure it\'s the right fit.',
      },
    ],
  },
  {
    slug: 'hair-restoration',
    name: 'Hair Restoration',
    headline: 'Restore Your Hair, Restore Your Confidence',
    description: 'From advanced PRP and exosome therapies to surgical hair transplantation, our hair restoration programs combine cutting-edge science with personalized care to address thinning and loss for men and women.',
    icon: 'Scissors',
    metaTitle: 'Hair Restoration in Huntington Beach',
    metaDescription: 'Hair transplant, exosome therapy, and PRP hair restoration at InfinityU Med Spa in Huntington Beach, CA.',
    faqs: [
      {
        question: 'Am I a candidate for hair restoration?',
        answer:
          'Most adults experiencing hair thinning or loss — whether from genetics, hormonal changes, or other factors — are candidates for at least one of our hair restoration options. A consultation helps us evaluate your degree of loss and match you to the right treatment or combination.',
      },
      {
        question: 'What is the difference between PRP, exosomes, and a hair transplant?',
        answer:
          'PRP and exosome therapies are non-surgical treatments that stimulate and strengthen existing follicles using your own growth factors or concentrated cell-signaling molecules. A hair transplant surgically relocates healthy follicles from a donor area to fill in areas of significant loss. We often combine them for the best long-term outcome.',
      },
      {
        question: 'How many sessions do I need?',
        answer:
          'PRP and exosome treatments typically require an initial series of 3–4 sessions spaced 4–6 weeks apart, followed by maintenance every 6–12 months. Hair transplantation is usually a single procedure, with supportive PRP/exosome sessions recommended afterward to optimize graft survival.',
      },
      {
        question: 'When will I see results?',
        answer:
          'Non-surgical therapies show gradual improvement starting around 3–6 months, with continued thickening over 12 months. Hair transplant results begin to appear at 3–4 months as new growth cycles in, with full density visible at 9–12 months.',
      },
      {
        question: 'Is there downtime?',
        answer:
          'PRP and exosome injections have minimal downtime — mild scalp tenderness and possible redness for 24–48 hours. Hair transplant recovery involves a few days of scalp care and activity restrictions; most patients return to normal routines within a week.',
      },
    ],
  },
  {
    slug: 'laser',
    name: 'Laser Treatments',
    headline: 'Precision Light-Based Skin & Hair Solutions',
    description: 'Our laser treatments harness targeted light energy to rejuvenate skin, reduce unwanted hair, and address pigmentation concerns — with precision, safety, and minimal downtime.',
    icon: 'Sun',
    metaTitle: 'Laser Treatments in Huntington Beach',
    metaDescription: 'Laser facial and laser hair removal at InfinityU Med Spa in Huntington Beach, CA.',
    faqs: [
      {
        question: 'Is laser treatment safe for my skin tone?',
        answer:
          'Safety depends on the specific laser and your Fitzpatrick skin type. During your consultation, we select the appropriate wavelength and settings for your skin to minimize risk and maximize results.',
      },
      {
        question: 'How many sessions will I need?',
        answer:
          'Laser facials are often done as a series of 4–6 sessions for skin rejuvenation goals. Laser hair removal requires multiple sessions (typically 6–8) spaced 4–6 weeks apart to address hair at all growth stages.',
      },
      {
        question: 'Is there any downtime?',
        answer:
          'Laser facials may involve 1–3 days of mild redness or flaking. Laser hair removal has virtually no downtime — you may notice temporary redness that resolves within a few hours.',
      },
      {
        question: 'Does laser hair removal hurt?',
        answer:
          'Most patients describe it as a brief snapping or warming sensation. We use cooling techniques to minimize discomfort, and settings can be adjusted for sensitive areas.',
      },
      {
        question: 'How permanent is laser hair removal?',
        answer:
          'After a full series, most patients achieve an 80–90% permanent reduction in hair. Occasional maintenance sessions address any regrowth, which tends to be finer and lighter.',
      },
    ],
  },
  {
    slug: 'hormone-wellness',
    name: 'Hormone Optimization',
    headline: 'Restore Balance, Reclaim Your Vitality',
    description: 'InfinityU is a Purepell Certified Provider of Bioidentical Hormone Replacement Therapy (BHRT). Our hormone optimization program uses Purepell\'s precision-compounded bioidentical pellets to help men and women restore hormone balance, reclaim energy, improve libido, and feel their best — without daily pills, creams, or patches.',
    icon: 'Heart',
    metaTitle: 'Hormone Optimization, Anti-Aging & Longevity in Huntington Beach | Purepell Certified',
    metaDescription: 'InfinityU is a Purepell Certified Provider of BHRT in Huntington Beach. Pellet therapy for men & women, anti-aging protocols, longevity programs, IV infusions, and stem cell therapy.',
    faqs: [
      {
        question: 'What is Purepell Bioidentical Hormone Replacement Therapy (BHRT)?',
        answer:
          'Purepell is a bioidentical hormone replacement therapy program that uses precision-compounded hormone pellets to restore balanced, consistent hormone levels. InfinityU is a Purepell Certified Provider, meaning our team is specially trained in Purepell protocols for both men and women. Unlike synthetic hormones, Purepell pellets are bioidentical — structurally identical to the hormones your body naturally produces.',
      },
      {
        question: 'How do I know if hormone pellet therapy is right for me?',
        answer:
          'Lab work and a thorough health history are the starting point. If your testosterone, estrogen, or other hormones are out of balance — contributing to fatigue, low libido, brain fog, weight gain, hot flashes, or poor sleep — BHRT may be an excellent option. Our Purepell-certified providers review your results and symptoms before recommending any treatment.',
      },
      {
        question: 'How long does BHRT take to work?',
        answer:
          'Most patients notice meaningful improvements in energy, mood, and libido within 2–4 weeks of their first pellet insertion, with optimal results at 4–6 weeks as hormone levels stabilize. Purepell pellets are replaced only 3–4 times per year, so you maintain consistent levels without daily maintenance.',
      },
      {
        question: 'What are the benefits of IV infusions?',
        answer:
          'IV therapy delivers vitamins, minerals, and hydration directly to your bloodstream for 100% absorption — bypassing the digestive system. Benefits vary by formulation and can include improved energy, immune support, faster recovery, enhanced skin health, and mental clarity.',
      },
      {
        question: 'What conditions can stem cell therapy help with?',
        answer:
          'Stem cell therapy supports tissue repair, reduces inflammation, and promotes healing in joints, tendons, and soft tissue. It is particularly valuable for regenerative applications where the body\'s own healing capacity needs a boost.',
      },
      {
        question: 'Can these therapies be combined?',
        answer:
          'Absolutely. Many patients pair hormone optimization with IV infusions for enhanced energy and recovery, or complement BHRT with massage for stress reduction. We design a personalized wellness plan during your consultation.',
      },
    ],
  },
];

export const treatments: Treatment[] = [
  // Injectables & Regenerative
  {
    slug: 'botox',
    name: 'Botox (Tox)',
    category: 'injectables',
    shortDescription: 'Smooth fine lines and wrinkles with precision neuromodulator injections.',
    fullDescription: 'Botox is a trusted neuromodulator that temporarily relaxes targeted facial muscles to smooth wrinkles and prevent new lines from forming. Our experienced providers deliver natural-looking results that keep you looking refreshed, never frozen.',
    benefits: [
      'Reduces fine lines and wrinkles',
      'Prevents new wrinkle formation',
      'Quick treatment with no downtime',
      'Natural-looking, subtle results',
      'Results last 3-4 months',
    ],
    whatToExpect: [
      'Brief consultation to discuss your goals and target areas',
      'Gentle cleansing of the treatment area',
      'Precise injections using ultra-fine needles',
      'Treatment takes approximately 15-20 minutes',
      'Minimal discomfort with results visible in 3-7 days',
    ],
    duration: '15-20 minutes',
    downtime: 'None',
    faqs: [
      { question: 'How long does Botox last?', answer: 'Results typically last 3-4 months, after which you can return for a touch-up treatment.' },
      { question: 'Does Botox hurt?', answer: 'Most patients experience minimal discomfort. We use ultra-fine needles and can apply a topical numbing cream if desired.' },
      { question: 'When will I see results?', answer: 'Initial results appear within 3-5 days, with full results visible at 2 weeks.' },
    ],
  },
  {
    slug: 'prp-microneedling',
    name: 'PRP Microneedling',
    category: 'injectables',
    shortDescription: 'Rejuvenate your skin using your body\'s own growth factors combined with microneedling.',
    fullDescription: 'PRP Microneedling combines the collagen-stimulating benefits of microneedling with Platelet-Rich Plasma derived from your own blood. This powerful combination accelerates healing, improves skin texture, and delivers a radiant, youthful glow.',
    benefits: [
      'Stimulates natural collagen production',
      'Improves skin texture and tone',
      'Reduces acne scars and hyperpigmentation',
      'Minimizes pore size',
      'Uses your body\'s own healing factors',
    ],
    whatToExpect: [
      'Blood draw to prepare your PRP',
      'Topical numbing cream applied for comfort',
      'Microneedling performed across treatment areas',
      'PRP applied to enhance absorption and healing',
      'Treatment takes approximately 60-90 minutes',
    ],
    duration: '60-90 minutes',
    downtime: '2-3 days of redness',
    faqs: [
      { question: 'How many sessions do I need?', answer: 'Most patients see optimal results with 3-4 sessions spaced 4-6 weeks apart.' },
      { question: 'Is PRP Microneedling safe?', answer: 'Yes. Since PRP is derived from your own blood, there is virtually no risk of allergic reaction.' },
    ],
  },
  {
    slug: 'prp-hair-restoration',
    name: 'PRP Hair Restoration',
    category: 'injectables',
    shortDescription: 'Combat hair thinning with platelet-rich plasma therapy for natural hair regrowth.',
    fullDescription: 'PRP Hair Restoration harnesses the growth factors in your own blood to stimulate dormant hair follicles, promote new hair growth, and strengthen existing hair. This non-surgical approach is ideal for both men and women experiencing hair thinning.',
    benefits: [
      'Stimulates natural hair regrowth',
      'Strengthens existing hair follicles',
      'Non-surgical with minimal downtime',
      'Suitable for men and women',
      'Uses your body\'s own growth factors',
    ],
    whatToExpect: [
      'Consultation to assess hair loss pattern',
      'Blood draw and PRP preparation',
      'Topical numbing applied to the scalp',
      'PRP injected into targeted areas of the scalp',
      'Treatment takes approximately 45-60 minutes',
    ],
    duration: '45-60 minutes',
    downtime: 'None to minimal',
    faqs: [
      { question: 'How soon will I see results?', answer: 'Initial improvement is typically noticed around 3-6 months, with continued improvement over 12 months.' },
      { question: 'How many treatments are needed?', answer: 'An initial series of 3-4 treatments spaced 4 weeks apart, followed by maintenance sessions every 6-12 months.' },
    ],
  },
  {
    slug: 'prf-treatment',
    name: 'PRF Treatment',
    category: 'injectables',
    shortDescription: 'Next-generation platelet-rich fibrin for enhanced skin rejuvenation and volume restoration.',
    fullDescription: 'PRF (Platelet-Rich Fibrin) is the next evolution of PRP therapy. By using a slower centrifuge process, PRF retains a higher concentration of white blood cells, stem cells, and growth factors in a fibrin matrix that releases healing proteins over an extended period for superior rejuvenation results.',
    benefits: [
      'Higher concentration of growth factors than PRP',
      'Sustained release of healing proteins',
      'Natural volume restoration',
      'Improved skin texture and elasticity',
      'No additives or anticoagulants needed',
    ],
    whatToExpect: [
      'Blood draw with specialized PRF preparation',
      'Treatment area numbed for comfort',
      'PRF injected or applied to target areas',
      'Can be combined with microneedling for enhanced results',
      'Treatment takes approximately 45-60 minutes',
    ],
    duration: '45-60 minutes',
    downtime: '1-2 days',
    faqs: [
      { question: 'What is the difference between PRP and PRF?', answer: 'PRF uses a slower spin process that preserves more growth factors and creates a fibrin matrix for slower, sustained release of healing proteins.' },
      { question: 'Where can PRF be used?', answer: 'PRF can be used for facial rejuvenation, under-eye treatment, hair restoration, and skin texture improvement.' },
    ],
  },
  {
    slug: 'sculptra',
    name: 'Sculptra',
    category: 'injectables',
    shortDescription: 'Gradually restore facial volume and stimulate your body\'s own collagen production.',
    fullDescription: 'Sculptra is a unique injectable that works with your body to stimulate its own natural collagen production. Unlike traditional fillers, Sculptra provides gradual, long-lasting results that can last up to two years, restoring facial volume and improving skin quality over time.',
    benefits: [
      'Stimulates natural collagen production',
      'Gradual, natural-looking results',
      'Results last up to 2 years',
      'Restores facial volume and contours',
      'Improves overall skin quality',
    ],
    whatToExpect: [
      'Thorough consultation and facial assessment',
      'Treatment areas mapped and numbed',
      'Sculptra injected into targeted areas',
      'Post-treatment massage technique demonstrated',
      'Treatment takes approximately 30-45 minutes',
    ],
    duration: '30-45 minutes',
    downtime: 'Minimal - possible swelling for 1-2 days',
    videoUrl: '/videos/sculptra-reel.mp4',
    faqs: [
      { question: 'How is Sculptra different from fillers?', answer: 'Unlike hyaluronic acid fillers that provide immediate volume, Sculptra works gradually by stimulating your body\'s own collagen production for longer-lasting, more natural results.' },
      { question: 'How many sessions are needed?', answer: 'Most patients require 2-3 sessions spaced about 4-6 weeks apart for optimal results.' },
    ],
  },

  {
    slug: 'dermal-fillers',
    name: 'Dermal Fillers',
    category: 'injectables',
    shortDescription: 'Restore volume, smooth deep lines, and sculpt facial contours with hyaluronic acid fillers.',
    fullDescription: 'Dermal fillers use hyaluronic acid and other biocompatible materials to replace lost volume, soften deep folds, and enhance facial features. Results are immediate, natural-looking, and reversible, making fillers one of the most versatile tools in aesthetic medicine.',
    benefits: [
      'Immediate volume restoration',
      'Softens nasolabial folds and marionette lines',
      'Enhances lips, cheeks, and jawline',
      'Reversible with hyaluronidase if needed',
      'Results last 6–18 months depending on product',
    ],
    whatToExpect: [
      'Consultation to map target areas and choose the right filler',
      'Topical or injected numbing for comfort',
      'Precise placement with fine needle or cannula',
      'Immediate results with possible mild swelling',
      'Treatment takes approximately 30–45 minutes',
    ],
    duration: '30–45 minutes',
    downtime: 'Minimal — possible swelling or bruising 1–3 days',
    faqs: [
      { question: 'How long do fillers last?', answer: 'Lip fillers typically last 6–9 months; cheek and jawline fillers can last 12–18 months or longer depending on the product and your metabolism.' },
      { question: 'Can fillers be combined with Botox?', answer: 'Yes — Botox and fillers are often done in the same visit. Botox relaxes dynamic wrinkles while fillers restore volume and structure for a comprehensive result.' },
    ],
  },
  {
    slug: 'p-shot',
    name: 'P-Shot (Priapus Shot)',
    category: 'injectables',
    shortDescription: 'PRP therapy for men to enhance sexual function, sensitivity, and performance.',
    fullDescription: 'The P-Shot (Priapus Shot) uses Platelet-Rich Plasma drawn from your own blood to stimulate tissue regeneration in penile tissue. This non-surgical treatment can improve erectile function, enhance sensitivity, and support performance — with no synthetic drugs or surgery required.',
    benefits: [
      'Improves erectile function and firmness',
      'Enhances sensitivity and pleasure',
      'Stimulates natural tissue regeneration',
      'Drug-free and non-surgical',
      'Uses your own growth factors',
    ],
    whatToExpect: [
      'Private, discreet consultation to discuss goals and medical history',
      'Blood draw and PRP preparation',
      'Topical numbing applied for comfort',
      'PRP injected into targeted tissue',
      'Treatment takes approximately 45–60 minutes',
    ],
    duration: '45–60 minutes',
    downtime: 'Minimal to none',
    faqs: [
      { question: 'Is the P-Shot painful?', answer: 'Topical numbing is applied before treatment to minimize discomfort. Most men report mild pressure but no significant pain.' },
      { question: 'How soon will I notice a difference?', answer: 'Some men notice improvements within a few weeks; full results typically develop over 2–3 months as tissue regeneration takes effect.' },
    ],
  },
  {
    slug: 'o-shot',
    name: 'O-Shot (Orgasm Shot)',
    category: 'injectables',
    shortDescription: 'PRP therapy for women to enhance sexual pleasure, sensitivity, and vaginal health.',
    fullDescription: 'The O-Shot (Orgasm Shot) uses Platelet-Rich Plasma to stimulate regeneration in vaginal and clitoral tissue. This natural, non-surgical treatment can enhance sensitivity, improve lubrication, address stress urinary incontinence, and support overall sexual wellness.',
    benefits: [
      'Enhances sexual sensitivity and pleasure',
      'Improves natural lubrication',
      'May reduce stress urinary incontinence',
      'Stimulates natural tissue rejuvenation',
      'Non-surgical, drug-free treatment',
    ],
    whatToExpect: [
      'Confidential consultation to review goals and health history',
      'Blood draw and PRP preparation',
      'Topical numbing cream applied for comfort',
      'PRP injected into targeted areas',
      'Treatment takes approximately 45–60 minutes',
    ],
    duration: '45–60 minutes',
    downtime: 'Minimal to none',
    faqs: [
      { question: 'Is the O-Shot safe?', answer: 'Yes. Because PRP is derived from your own blood, there is virtually no risk of allergic reaction. The procedure is performed by experienced medical providers in a clinical setting.' },
      { question: 'When will I feel results?', answer: 'Many women notice improvements in sensitivity and comfort within 3–6 weeks, with continued improvement over 3 months.' },
    ],
  },
  {
    slug: 'prp-exosome-joint-injections',
    name: 'PRP & Exosome Joint Injections',
    category: 'injectables',
    shortDescription: 'Regenerative joint therapy using PRP and exosomes to reduce pain and promote healing.',
    fullDescription: 'PRP and Exosome joint injections deliver concentrated growth factors and cell-signaling molecules directly into affected joints, tendons, or soft tissue. This regenerative approach reduces inflammation, stimulates natural healing, and can improve pain and mobility — without surgery or steroids.',
    benefits: [
      'Reduces joint pain and inflammation',
      'Promotes natural tissue repair',
      'Improves mobility and function',
      'Non-surgical alternative to steroid injections',
      'Uses your body\'s own regenerative potential',
    ],
    whatToExpect: [
      'Assessment of the target joint and medical history review',
      'Blood draw and PRP or exosome preparation',
      'Area cleaned and numbed',
      'Injection guided to the target site',
      'Treatment takes approximately 30–60 minutes',
    ],
    duration: '30–60 minutes',
    downtime: 'Mild soreness 24–48 hours; return to light activity within a day',
    faqs: [
      { question: 'Which joints can be treated?', answer: 'Common areas include knees, hips, shoulders, ankles, and elbows. We evaluate your specific joint during consultation to confirm candidacy.' },
      { question: 'How many injections are needed?', answer: 'Many patients see meaningful improvement after 1–2 injections, with a second treatment at 4–6 weeks for enhanced results. Maintenance injections can be done annually as needed.' },
    ],
  },

  // HiFu Treatments
  {
    slug: 'hifu-full-face',
    name: 'HiFu Full Face',
    category: 'hifu',
    shortDescription: 'Complete facial lifting and tightening without surgery.',
    fullDescription: 'Full face HiFu treatment delivers focused ultrasound energy to multiple layers of facial tissue, stimulating deep collagen renewal for a comprehensive lifting and tightening effect across the entire face.',
    benefits: [
      'Non-surgical facelift alternative',
      'Stimulates deep collagen production',
      'Tightens and lifts sagging skin',
      'Improves overall facial contour',
      'Single treatment with lasting results',
    ],
    whatToExpect: [
      'Skin cleansed and ultrasound gel applied',
      'Treatment handpiece delivers precise energy pulses',
      'Mild warmth and tingling sensation during treatment',
      'Treatment takes approximately 60-90 minutes',
      'Results develop gradually over 2-3 months',
    ],
    duration: '60-90 minutes',
    downtime: 'None to minimal redness',
    targetAreas: ['Forehead', 'Cheeks', 'Jawline', 'Around eyes'],
    faqs: [
      { question: 'How long do HiFu results last?', answer: 'Results can last 12-18 months. Annual maintenance treatments are recommended.' },
      { question: 'Is HiFu painful?', answer: 'Most patients feel mild warmth and occasional tingling. Comfort measures are available to ensure a pleasant experience.' },
    ],
  },
  {
    slug: 'hifu-neck',
    name: 'HiFu Neck',
    category: 'hifu',
    shortDescription: 'Tighten and smooth the neck area for a more youthful profile.',
    fullDescription: 'Targeted HiFu treatment for the neck addresses loose skin, horizontal lines, and loss of definition. The ultrasound energy penetrates deep tissue layers to stimulate collagen remodeling and create a firmer, smoother neck appearance.',
    benefits: [
      'Tightens loose neck skin',
      'Reduces horizontal neck lines',
      'Improves neck-to-jaw definition',
      'Non-surgical with no downtime',
      'Progressive improvement over weeks',
    ],
    whatToExpect: [
      'Treatment area cleansed and prepared',
      'Focused ultrasound delivered to neck tissue',
      'Treatment takes approximately 30-45 minutes',
      'Mild warmth during the procedure',
      'Results improve over 2-3 months',
    ],
    duration: '30-45 minutes',
    downtime: 'None',
    faqs: [
      { question: 'Will HiFu help with turkey-neck or horizontal neck lines?', answer: 'Yes. The neck is one of the most responsive HiFu areas. Expect progressive tightening of loose skin and a softening of horizontal "necklace" lines over 2–3 months.' },
      { question: 'Can I combine it with a full-face treatment?', answer: 'Absolutely — most patients treat the face and neck together for seamless results from the jawline down.' },
    ],
  },
  {
    slug: 'hifu-under-chin',
    name: 'HiFu Under Chin',
    category: 'hifu',
    shortDescription: 'Define your jawline and reduce the appearance of a double chin.',
    fullDescription: 'HiFu under chin treatment specifically targets submental fullness and loose skin beneath the jawline. The focused ultrasound energy tightens tissue and stimulates collagen production for improved chin and jawline definition.',
    benefits: [
      'Reduces double chin appearance',
      'Defines the jawline',
      'Tightens submental skin',
      'Non-invasive alternative to liposuction',
      'No anesthesia required',
    ],
    whatToExpect: [
      'Submental area assessed and marked',
      'Ultrasound energy precisely delivered under the chin',
      'Treatment takes approximately 20-30 minutes',
      'Mild tingling or warmth sensation',
      'Gradual improvement visible over weeks',
    ],
    duration: '20-30 minutes',
    downtime: 'None',
    faqs: [
      { question: 'Will this actually reduce a double chin?', answer: 'HiFu tightens skin and stimulates collagen under the chin, which visibly improves the appearance of submental fullness. For pronounced fat pockets, we may recommend combining with a body-contouring treatment.' },
      { question: 'How is this different from Kybella?', answer: 'Kybella dissolves fat cells with injections. HiFu uses focused ultrasound energy to tighten skin and lift tissue. They address related but different concerns and can be combined.' },
    ],
  },
  {
    slug: 'hifu-tummy',
    name: 'HiFu Tummy',
    category: 'hifu',
    shortDescription: 'Tighten and firm abdominal skin for a smoother, more toned appearance.',
    fullDescription: 'HiFu for the tummy area addresses skin laxity and helps tighten the abdominal region. Ideal for post-weight loss or post-pregnancy skin tightening, this treatment stimulates deep collagen production to improve skin firmness and texture.',
    benefits: [
      'Tightens loose abdominal skin',
      'Stimulates collagen renewal',
      'Ideal post-weight loss or post-pregnancy',
      'Non-surgical body tightening',
      'Gradual, natural-looking improvement',
    ],
    whatToExpect: [
      'Abdominal area assessed and prepared',
      'Focused ultrasound applied across treatment zone',
      'Treatment takes approximately 45-60 minutes',
      'Warmth sensation during treatment',
      'Results develop over 2-3 months',
    ],
    duration: '45-60 minutes',
    downtime: 'None',
    faqs: [
      { question: 'Is this a good option after pregnancy or weight loss?', answer: 'Yes — HiFu is particularly effective for the laxity that often remains after pregnancy or significant weight loss, provided you\'ve reached a stable weight.' },
      { question: 'Will this get rid of belly fat?', answer: 'HiFu tightens skin and can modestly reduce superficial fat, but it is not a primary fat-reduction treatment. If fat reduction is the main goal, our body-contouring program is a better fit.' },
    ],
  },
  {
    slug: 'hifu-underarm',
    name: 'HiFu Underarm',
    category: 'hifu',
    shortDescription: 'Tighten and lift sagging underarm skin for improved arm contour.',
    fullDescription: 'HiFu underarm treatment targets the loose skin and tissue on the upper inner arms, a common concern area. The focused ultrasound energy helps tighten skin and improve overall arm contour without surgical intervention.',
    benefits: [
      'Tightens loose underarm skin',
      'Improves arm contour and definition',
      'Non-surgical alternative to brachioplasty',
      'No scarring or recovery period',
      'Stimulates long-term collagen production',
    ],
    whatToExpect: [
      'Upper arm area assessed and prepared',
      'Ultrasound energy delivered to target tissue',
      'Treatment takes approximately 30-45 minutes',
      'Mild warmth during treatment',
      'Progressive tightening over several weeks',
    ],
    duration: '30-45 minutes',
    downtime: 'None',
    faqs: [
      { question: 'Will HiFu fix "bat wings"?', answer: 'HiFu can significantly improve skin laxity on the upper arms — the classic "bat wing" concern — but it won\'t remove large volumes of fat. For best results, pair with a body-contouring treatment if fat is a primary concern.' },
      { question: 'Is HiFu safe on thin upper-arm skin?', answer: 'Yes. We calibrate energy levels specifically for the thinner skin of the inner arms to ensure a safe, comfortable treatment.' },
    ],
  },

  // Radio Frequency
  {
    slug: 'rf-full-face',
    name: 'RF Full Face',
    category: 'radio-frequency',
    shortDescription: 'Comprehensive facial skin tightening and rejuvenation using radio frequency energy.',
    fullDescription: 'Full face Radio Frequency treatment delivers controlled thermal energy across the entire face to stimulate collagen remodeling, tighten skin, and improve tone and texture. This gentle yet effective treatment is suitable for all skin types.',
    benefits: [
      'Tightens and firms facial skin',
      'Stimulates collagen remodeling',
      'Improves skin tone and texture',
      'Safe for all skin types',
      'Comfortable with warming sensation',
    ],
    whatToExpect: [
      'Face cleansed and conductive gel applied',
      'RF handpiece moved across treatment areas',
      'Comfortable warming sensation throughout',
      'Treatment takes approximately 45-60 minutes',
      'Immediate glow with progressive improvement',
    ],
    duration: '45-60 minutes',
    downtime: 'None',
    targetAreas: ['Forehead', 'Cheeks', 'Jawline', 'Perioral area'],
    faqs: [
      { question: 'How many RF sessions do I need?', answer: 'A series of 4-6 treatments spaced 1-2 weeks apart is recommended for optimal results, with maintenance sessions as needed.' },
      { question: 'Can RF be combined with other treatments?', answer: 'Yes, RF pairs well with microneedling, HiFu, and injectables for comprehensive results.' },
    ],
  },
  {
    slug: 'rf-under-chin',
    name: 'RF Under Chin',
    category: 'radio-frequency',
    shortDescription: 'Target submental laxity and define the jawline with radio frequency.',
    fullDescription: 'Radio Frequency treatment for the under chin area specifically addresses skin laxity and loss of definition in the submental region. The controlled thermal energy stimulates collagen production and tightens tissue for a more defined jawline and chin profile.',
    benefits: [
      'Defines jawline contour',
      'Tightens under-chin skin',
      'Reduces appearance of double chin',
      'Non-invasive with no downtime',
      'Cumulative improvement with each session',
    ],
    whatToExpect: [
      'Under-chin area prepared with conductive gel',
      'RF energy delivered in controlled passes',
      'Comfortable warming sensation',
      'Treatment takes approximately 20-30 minutes',
      'Results improve with each session',
    ],
    duration: '20-30 minutes',
    downtime: 'None',
    faqs: [
      { question: 'Can RF be combined with HiFu for under-chin treatment?', answer: 'Yes — many patients combine both. RF tightens more superficial tissue; HiFu reaches deeper structural layers. Together they produce more pronounced jawline definition.' },
      { question: 'How soon will I notice a tighter jawline?', answer: 'Many patients see a subtle lift after the first session, with progressive improvement over a 4–6 treatment series.' },
    ],
  },
  {
    slug: 'rf-arms',
    name: 'RF Arms',
    category: 'radio-frequency',
    shortDescription: 'Tighten and smooth upper arm skin with targeted radio frequency energy.',
    fullDescription: 'Radio Frequency treatment for the arms targets loose or crepey skin on the upper arms. The thermal energy stimulates collagen production deep within the skin, leading to improved tightness, texture, and overall arm contour over a series of treatments.',
    benefits: [
      'Tightens loose arm skin',
      'Improves skin texture and smoothness',
      'Non-surgical arm rejuvenation',
      'Comfortable treatment experience',
      'Progressive results with each session',
    ],
    whatToExpect: [
      'Upper arm areas prepared with conductive gel',
      'RF handpiece applied in systematic passes',
      'Warming sensation throughout treatment',
      'Treatment takes approximately 30-40 minutes per arm',
      'Skin feels tighter and smoother over time',
    ],
    duration: '60-80 minutes (both arms)',
    downtime: 'None',
    faqs: [
      { question: 'Will RF help with crepey skin on my upper arms?', answer: 'Yes. Crepey, lax skin is one of the most responsive concerns for arm RF. Expect gradual, cumulative smoothing across a 4–6 session series.' },
      { question: 'How often should I do maintenance?', answer: 'A single maintenance session every 3–4 months after completing your initial series helps preserve and compound results.' },
    ],
  },

  // Body Contouring
  {
    slug: 'body-contouring-treatment',
    name: 'Body Contouring',
    category: 'body-contouring',
    shortDescription: 'Sculpt and reshape your body with advanced non-invasive technology.',
    fullDescription: 'Our body contouring program uses state-of-the-art non-invasive technology to target stubborn fat deposits, tighten skin, and reshape your body. Each treatment plan is customized to your specific goals and target areas, providing a safe and effective alternative to surgical procedures.',
    benefits: [
      'Reduces stubborn fat deposits',
      'Tightens and firms skin',
      'Customized treatment plans',
      'Non-invasive with no surgery',
      'Minimal to no downtime',
      'Natural-looking, gradual results',
    ],
    whatToExpect: [
      'Comprehensive body assessment and goal discussion',
      'Customized treatment plan developed',
      'Treatment applied to target areas',
      'Comfortable experience with warming or cooling sensations',
      'Session takes approximately 45-60 minutes',
      'Results develop over several weeks',
    ],
    duration: '45-60 minutes',
    downtime: 'None to minimal',
    targetAreas: ['Abdomen', 'Flanks', 'Thighs', 'Arms', 'Back'],
    faqs: [
      { question: 'How many body contouring sessions do I need?', answer: 'Most patients achieve optimal results with 4-8 sessions, depending on treatment area and goals.' },
      { question: 'Is body contouring a weight loss solution?', answer: 'Body contouring is designed for targeted fat reduction and skin tightening, not overall weight loss. It works best for those at or near their goal weight with stubborn areas.' },
      { question: 'When will I see results?', answer: 'Initial results may be visible after 2-4 weeks, with continued improvement over 2-3 months as your body naturally processes treated fat cells.' },
    ],
  },

  // Hair Restoration
  {
    slug: 'hair-transplant',
    name: 'Hair Transplant',
    category: 'hair-restoration',
    shortDescription: 'Surgical follicle relocation for permanent, natural-looking hair restoration.',
    fullDescription: 'Hair transplantation surgically moves healthy hair follicles from a donor area (typically the back or sides of the scalp) to areas of thinning or loss. Modern techniques produce natural-looking hairlines and density with permanent results. We pair transplants with PRP or exosome therapy to optimize graft survival.',
    benefits: [
      'Permanent hair restoration',
      'Natural hairline design tailored to your face',
      'Transplanted hair behaves like natural hair',
      'Suitable for men and women',
      'Can be combined with PRP/exosomes for enhanced graft survival',
    ],
    whatToExpect: [
      'Comprehensive consultation to assess donor supply and design hairline',
      'Procedure performed under local anesthesia',
      'Follicles harvested and implanted in a single session',
      'Scalp care instructions and follow-up provided',
      'Procedure takes several hours depending on graft count',
    ],
    duration: 'Several hours (varies by graft count)',
    downtime: '5–7 days of scalp care; light activity within a week',
    faqs: [
      { question: 'What technique is used?', answer: 'We use follicular unit extraction (FUE), which harvests individual follicles without a linear scar for a more natural-looking result and faster recovery.' },
      { question: 'When will transplanted hair grow?', answer: 'Transplanted hair sheds in the first few weeks — this is normal. New growth begins around 3–4 months, with full density visible at 9–12 months.' },
    ],
  },
  {
    slug: 'exosome-hair-restoration',
    name: 'Exosome Hair Restoration',
    category: 'hair-restoration',
    shortDescription: 'Next-generation cell-signaling therapy to reawaken dormant follicles and boost hair density.',
    fullDescription: 'Exosome hair restoration delivers concentrated exosomes — nano-sized cell-signaling particles packed with growth factors and regenerative signals — directly into the scalp. Exosomes communicate with follicular cells to stimulate growth activity, improve density, and slow progression of hair loss. This is one of the most advanced non-surgical options available.',
    benefits: [
      'Highly concentrated regenerative signals',
      'Stimulates dormant hair follicles',
      'Improves hair thickness and density',
      'Non-surgical with minimal downtime',
      'Can complement or enhance hair transplant results',
    ],
    whatToExpect: [
      'Scalp assessment to identify treatment areas',
      'Topical numbing applied for comfort',
      'Exosome solution injected into targeted scalp zones',
      'Treatment takes approximately 30–45 minutes',
      'Gradual improvement over 3–6 months',
    ],
    duration: '30–45 minutes',
    downtime: 'Minimal — mild scalp tenderness 24–48 hours',
    faqs: [
      { question: 'How do exosomes compare to PRP for hair restoration?', answer: 'Exosomes contain a higher concentration of growth factors and cell-signaling molecules than PRP, making them a more potent option. They are particularly effective for patients who have had limited results with PRP alone.' },
      { question: 'How many sessions are recommended?', answer: 'Most patients start with 2–3 sessions spaced 4–6 weeks apart, followed by annual maintenance. Results continue to improve over 6–12 months.' },
    ],
  },

  // Laser Treatments
  {
    slug: 'laser-facial',
    name: 'Laser Facial',
    category: 'laser',
    shortDescription: 'Targeted laser energy to resurface skin, reduce pigmentation, and stimulate collagen renewal.',
    fullDescription: 'Laser facials use focused light energy to address pigmentation, fine lines, uneven texture, and dull skin tone. By delivering precise wavelengths to targeted skin layers, laser facials trigger controlled rejuvenation and collagen remodeling — revealing clearer, smoother, more radiant skin.',
    benefits: [
      'Reduces sun damage and hyperpigmentation',
      'Smooths fine lines and skin texture',
      'Stimulates collagen production',
      'Improves overall skin tone and clarity',
      'Minimal downtime compared to ablative lasers',
    ],
    whatToExpect: [
      'Skin assessment and treatment area mapping',
      'Protective eyewear provided',
      'Laser handpiece passed over treatment zones',
      'Mild warmth or tingling sensation during treatment',
      'Treatment takes approximately 30–45 minutes',
    ],
    duration: '30–45 minutes',
    downtime: '1–3 days of mild redness or flaking',
    faqs: [
      { question: 'How many laser facial sessions do I need?', answer: 'A series of 4–6 sessions spaced 3–4 weeks apart is typical for skin rejuvenation goals. Maintenance sessions every few months help sustain results.' },
      { question: 'Can laser facials treat acne or acne scarring?', answer: 'Yes. Certain laser wavelengths target acne-causing bacteria and stimulate collagen to soften the appearance of acne scars. We assess your specific concerns during consultation.' },
    ],
  },
  {
    slug: 'laser-hair-removal',
    name: 'Laser Hair Removal',
    category: 'laser',
    shortDescription: 'Long-lasting reduction of unwanted hair on face and body using targeted laser energy.',
    fullDescription: 'Laser hair removal uses precise wavelengths of light to target pigment in hair follicles, disabling them at the root without damaging surrounding skin. Over a series of sessions, patients achieve significant, long-lasting reduction of unwanted hair on virtually any area of the face or body.',
    benefits: [
      'Permanent hair reduction after a full series',
      'Smooth, stubble-free skin between sessions',
      'Treats face, underarms, legs, bikini, back, and more',
      'Faster and more precise than waxing or shaving',
      'Each session covers large areas quickly',
    ],
    whatToExpect: [
      'Consultation to assess hair color, skin tone, and target area',
      'Area shaved and cleaned before treatment',
      'Cooling applied to protect skin and minimize discomfort',
      'Laser delivered in quick pulses across the treatment zone',
      'Session time varies from 10 minutes (small areas) to 60+ minutes (full legs)',
    ],
    duration: 'Varies by area (10–60+ minutes)',
    downtime: 'None — possible redness for a few hours',
    faqs: [
      { question: 'How many sessions will I need?', answer: 'Most patients need 6–8 sessions spaced 4–6 weeks apart to treat hair across all growth cycles. Touch-up sessions once or twice a year handle any remaining regrowth.' },
      { question: 'Does laser hair removal work on blonde or gray hair?', answer: 'Laser targets melanin (pigment) in hair. Very light blonde, red, or gray hair contains less pigment and responds less predictably. We assess your hair and skin during consultation to set realistic expectations.' },
    ],
  },

  // Hormone Optimization
  {
    slug: 'hormone-pellet-therapy',
    name: 'Bioidentical Hormone Pellet Therapy (BHRT)',
    category: 'hormone-wellness',
    shortDescription: 'Purepell-certified BHRT pellet therapy delivering consistent, 24/7 hormone optimization for men and women — no daily pills or creams.',
    fullDescription: 'InfinityU is a Purepell Certified Provider, offering Bioidentical Hormone Replacement Therapy (BHRT) using Purepell\'s precision-compounded bioidentical hormone pellets. Each pellet is inserted just beneath the skin during a quick in-office procedure. Unlike creams, patches, or daily pills, Purepell pellets release hormones 24/7 — responding dynamically to your body\'s actual needs and delivering consistent levels without the peaks and troughs of other delivery methods. Most patients require pellet replacement only 3–4 times per year.\n\nPurepell BHRT is available for both men and women. Men commonly seek hormone optimization for low testosterone, reduced energy, low libido, and difficulty maintaining muscle mass. Women often pursue BHRT for relief from hot flashes, night sweats, mood changes, low libido, and fatigue associated with perimenopause or menopause.',
    benefits: [
      'Consistent, 24/7 bioidentical hormone delivery',
      'Reduces fatigue, brain fog, and mood changes',
      'Supports healthy libido and sexual wellness for men and women',
      'Aids weight management and muscle tone',
      'Reduces or eliminates hot flashes and night sweats',
      'No daily pills, creams, or patches',
      'Only 3–4 procedures per year',
    ],
    whatToExpect: [
      'Comprehensive lab work and health history review',
      'Custom Purepell pellet formulation based on your results',
      'Quick in-office insertion procedure (10–15 minutes)',
      'Local anesthesia for comfort; minor soreness 1–2 days',
      'Follow-up labs at 4–6 weeks to confirm optimal hormone levels',
      'Pellets replaced every 3–6 months depending on activity level',
    ],
    duration: '10–15 minutes (insertion procedure)',
    downtime: 'Minimal — mild soreness at insertion site 1–2 days',
    faqs: [
      { question: 'Is Purepell BHRT safe?', answer: 'Bioidentical hormones are structurally identical to the hormones your body naturally produces. Purepell Certified Providers follow evidence-based protocols and monitor outcomes with follow-up lab work to ensure optimal results.' },
      { question: 'Who is a good candidate for BHRT?', answer: 'Men and women experiencing symptoms of hormone imbalance — fatigue, low libido, weight gain, mood changes, poor sleep, hot flashes, or brain fog — who have labs confirming suboptimal hormone levels.' },
      { question: 'How long until I feel results from Purepell BHRT?', answer: 'Most patients notice meaningful improvements in energy, mood, and libido within 2–4 weeks of their first insertion, with optimal results at 4–6 weeks as hormone levels stabilize.' },
    ],
  },
  {
    slug: 'stem-cell-therapy',
    name: 'Stem Cell Therapy',
    category: 'hormone-wellness',
    shortDescription: 'Regenerative stem cell treatments to support healing, reduce inflammation, and restore tissue.',
    fullDescription: 'Stem cell therapy harnesses the body\'s most fundamental regenerative cells to support healing in tissues that have difficulty repairing on their own. By delivering concentrated stem cells or stem cell-derived signals to target areas, we can reduce inflammation, stimulate tissue repair, and support functional recovery in joints, skin, and other structures.',
    benefits: [
      'Promotes natural tissue regeneration',
      'Reduces chronic inflammation',
      'Supports joint and soft-tissue healing',
      'Can complement other regenerative treatments',
      'Non-surgical approach to repair',
    ],
    whatToExpect: [
      'In-depth consultation to evaluate the target area and candidacy',
      'Treatment protocol designed around your specific needs',
      'Stem cells prepared and delivered to target tissue',
      'Post-treatment care instructions provided',
      'Session time varies by treatment area',
    ],
    duration: 'Varies by protocol',
    downtime: 'Mild soreness in treated area; varies by application',
    faqs: [
      { question: 'What source are the stem cells from?', answer: 'Depending on the application, we use either autologous (from your own body) or ethically sourced allogeneic stem cell preparations. Your provider will discuss the most appropriate option during consultation.' },
      { question: 'How soon will I feel results?', answer: 'Regenerative therapies work gradually. Some patients notice improvement within a few weeks; optimal results often develop over 2–3 months as tissue remodeling occurs.' },
    ],
  },
  {
    slug: 'iv-infusions',
    name: 'IV Infusions',
    category: 'hormone-wellness',
    shortDescription: 'Customized IV vitamin and hydration therapy for energy, immunity, recovery, and wellness.',
    fullDescription: 'IV infusion therapy delivers a customized blend of vitamins, minerals, antioxidants, and hydration directly into your bloodstream — bypassing the digestive system for 100% absorption. Whether you\'re seeking an energy boost, immune support, athletic recovery, hangover relief, or skin health enhancement, we have a formulation designed for your goals.',
    benefits: [
      '100% bioavailability — far more effective than oral supplements',
      'Fast-acting energy and hydration',
      'Immune system support',
      'Improved athletic recovery',
      'Enhanced skin health and glow',
    ],
    whatToExpect: [
      'Brief health screen and goal discussion',
      'IV line placed comfortably in the arm',
      'Relaxing infusion session (30–60 minutes)',
      'Most patients feel energized immediately or within hours',
      'Can be combined with other wellness treatments on the same visit',
    ],
    duration: '30–60 minutes',
    downtime: 'None',
    faqs: [
      { question: 'How often can I get IV infusions?', answer: 'Frequency depends on your goals and formulation. Some patients come weekly for performance or recovery; others come monthly for general wellness maintenance.' },
      { question: 'Is IV therapy safe?', answer: 'Yes, when administered by qualified medical professionals. We review your health history and current medications before treatment to ensure the formulation is safe and appropriate for you.' },
    ],
  },
  {
    slug: 'anti-aging-protocol',
    name: 'Anti-Aging Protocol',
    category: 'hormone-wellness',
    shortDescription: 'A personalized, multi-modality program designed to slow cellular aging and preserve vitality from the inside out.',
    fullDescription: 'Aging is multi-factorial — it happens at the cellular, hormonal, and structural level simultaneously. Our Anti-Aging Protocol takes a whole-body approach, combining hormone optimization, regenerative therapies, and targeted IV nutrition to address the root causes of aging rather than just surface symptoms. After a comprehensive assessment, your provider designs a personalized program drawing from BHRT, stem cell therapy, IV infusions, PRP, and other modalities to match your biology, goals, and lifestyle.',
    benefits: [
      'Addresses aging at the hormonal, cellular, and structural level',
      'Personalized to your labs, symptoms, and goals',
      'Combines proven modalities for compounded results',
      'Improves energy, skin quality, mental clarity, and body composition',
      'Ongoing optimization as your body and needs evolve',
    ],
    whatToExpect: [
      'Comprehensive intake, health history review, and lab work',
      'Provider consultation to design your personalized protocol',
      'Treatments scheduled and paced to your program plan',
      'Regular follow-up assessments to track progress and refine your protocol',
      'Ongoing support from your care team throughout the program',
    ],
    duration: 'Ongoing program — initial consultation 60 minutes',
    downtime: 'Varies by treatments included in your protocol',
    faqs: [
      {
        question: 'What treatments are included in an Anti-Aging Protocol?',
        answer: 'Protocols are fully individualized. Common components include BHRT (hormone pellets), IV vitamin infusions, PRP or PRF, stem cell therapy, and aesthetic treatments. Your provider selects the combination best matched to your labs and goals.',
      },
      {
        question: 'How is this different from just booking individual treatments?',
        answer: 'The protocol approach integrates treatments strategically — sequencing and combining modalities to maximize how they work together. Your provider monitors your response and adjusts over time, producing more consistent and compounded improvements than ad-hoc treatments.',
      },
    ],
  },
  {
    slug: 'longevity-program',
    name: 'Longevity Program',
    category: 'hormone-wellness',
    shortDescription: 'Science-based wellness designed to extend healthspan — optimizing your biology for more years of peak performance.',
    fullDescription: 'Longevity medicine focuses on maintaining optimal health function for as long as possible — not just treating illness, but actively optimizing the biological systems that decline with age. Our Longevity Program begins with an in-depth assessment of key biomarkers, then builds a personalized plan combining hormone optimization, NAD+ and advanced IV therapies, regenerative treatments, and lifestyle protocols. The goal is more than a longer life — it is more years lived at your best.',
    benefits: [
      'Optimizes key longevity biomarkers (hormones, inflammation, metabolic health)',
      'Supports mitochondrial health and cellular energy production',
      'Reduces chronic inflammation — a root driver of age-related decline',
      'Improves cognitive clarity, physical performance, and resilience',
      'Personalized and data-driven with ongoing monitoring',
    ],
    whatToExpect: [
      'Comprehensive biomarker lab panel and health history intake',
      'Provider consultation to review results and design your longevity plan',
      'Structured treatment schedule combining selected modalities',
      'Periodic re-testing to track biomarker improvement',
      'Ongoing protocol refinement as results evolve',
    ],
    duration: 'Ongoing program — initial consultation 60 minutes',
    downtime: 'Varies by treatments included in your program',
    faqs: [
      {
        question: 'What biomarkers do you assess?',
        answer: 'We evaluate a comprehensive panel including hormone levels, inflammatory markers, metabolic health indicators, and nutrient status. Results guide which therapies will have the greatest impact for your specific biology.',
      },
      {
        question: 'Is this program only for older patients?',
        answer: 'No — longevity optimization is most effective when started proactively. Many patients in their 30s and 40s use the program to establish and maintain peak health rather than waiting for decline to begin.',
      },
    ],
  },
  {
    slug: 'massage-therapy',
    name: 'Massage Therapy',
    category: 'hormone-wellness',
    shortDescription: 'Therapeutic massage for relaxation, recovery, and whole-body wellness.',
    fullDescription: 'Our therapeutic massage services complement your wellness and aesthetic treatment plan. Whether you need deep tissue work for chronic tension, lymphatic drainage to support recovery after procedures, or a restorative relaxation massage, our skilled therapists tailor each session to your specific needs and goals.',
    benefits: [
      'Relieves muscle tension and chronic pain',
      'Promotes lymphatic drainage and detoxification',
      'Reduces stress and cortisol levels',
      'Supports recovery after aesthetic procedures',
      'Improves circulation and overall well-being',
    ],
    whatToExpect: [
      'Brief intake to discuss areas of focus and any contraindications',
      'Customized technique based on your needs',
      'Comfortable, private treatment room',
      'Session tailored in pressure and focus areas',
      'Sessions available in 60 or 90 minutes',
    ],
    duration: '60–90 minutes',
    downtime: 'None — possible mild soreness after deep tissue work',
    faqs: [
      { question: 'Can massage be combined with other treatments?', answer: 'Yes — massage pairs well with IV infusions, body contouring, and post-procedure recovery. Your provider can help build a same-day wellness plan.' },
      { question: 'What types of massage do you offer?', answer: 'We offer Swedish relaxation, deep tissue, lymphatic drainage, and sports massage. Discuss your goals during booking and we\'ll match you with the right technique.' },
    ],
  },
];

export function getTreatmentsByCategory(category: ServiceCategory): Treatment[] {
  return treatments.filter(t => t.category === category);
}

export function getCategoryInfo(slug: ServiceCategory): ServiceCategoryInfo | undefined {
  return serviceCategories.find(c => c.slug === slug);
}
