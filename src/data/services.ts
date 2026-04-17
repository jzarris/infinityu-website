export type ServiceCategory = 'injectables' | 'hifu' | 'radio-frequency' | 'body-contouring';

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
    faqs: [
      { question: 'How is Sculptra different from fillers?', answer: 'Unlike hyaluronic acid fillers that provide immediate volume, Sculptra works gradually by stimulating your body\'s own collagen production for longer-lasting, more natural results.' },
      { question: 'How many sessions are needed?', answer: 'Most patients require 2-3 sessions spaced about 4-6 weeks apart for optimal results.' },
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
];

export function getTreatmentsByCategory(category: ServiceCategory): Treatment[] {
  return treatments.filter(t => t.category === category);
}

export function getCategoryInfo(slug: ServiceCategory): ServiceCategoryInfo | undefined {
  return serviceCategories.find(c => c.slug === slug);
}
