'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type Tag = 'transplant' | 'prp' | 'exosome' | 'eyebrow' | 'men' | 'women';

interface Result {
  src: string;
  alt: string;
  title: string;
  detail: string;
  tags: Tag[];
  badgeLabel: string;
  badgeClass: string;
  genderLabel?: string;
  genderClass?: string;
}

const RESULTS: Result[] = [
  // ── Hair Transplant — Men (Gemini AI-illustrated) ──────────────────
  {
    src: '/images/hair-results/81db1074-4ae5-44d5-80ba-2c85a4931f2c.jpg',
    alt: 'Hairline and crown restoration before and after',
    title: 'Hairline & Crown Restoration',
    detail: 'FUE technique · Androgenetic alopecia',
    tags: ['transplant', 'men'],
    badgeLabel: '✂️ Hair Transplant', badgeClass: 'bg-amber-100 text-amber-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  {
    src: '/images/hair-results/06652965-7867-4e8b-8247-6511adc0a397.jpg',
    alt: 'Crown density restoration before and after',
    title: 'Crown Density Restoration',
    detail: 'Before and after · Androgenetic alopecia',
    tags: ['transplant', 'men'],
    badgeLabel: '✂️ Hair Transplant', badgeClass: 'bg-amber-100 text-amber-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  {
    src: '/images/hair-results/b1c3d5c4-d009-4e26-8abf-06a1b03a4d98.jpg',
    alt: 'Hairline reconstruction before and after',
    title: 'Hairline Reconstruction',
    detail: 'Before and after · Natural hairline design',
    tags: ['transplant', 'men'],
    badgeLabel: '✂️ Hair Transplant', badgeClass: 'bg-amber-100 text-amber-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  {
    src: '/images/hair-results/715e41d3-9c82-4048-825b-7823970370cf.jpg',
    alt: 'Full crown coverage before and after',
    title: 'Full Crown Coverage',
    detail: 'FUSS strip technique · Significant hairline and crown restoration',
    tags: ['transplant', 'men'],
    badgeLabel: '✂️ Hair Transplant', badgeClass: 'bg-amber-100 text-amber-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  {
    src: '/images/hair-results/3720011c-8117-4bee-9c6f-71b2072780d2.jpg',
    alt: 'Hairline density and coverage before and after',
    title: 'Hairline Density & Coverage',
    detail: 'Before and after · FUE technique',
    tags: ['transplant', 'men'],
    badgeLabel: '✂️ Hair Transplant', badgeClass: 'bg-amber-100 text-amber-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  {
    src: '/images/hair-results/13a44fac-d3a0-4804-b4ae-9725b3c97adc.jpg',
    alt: 'Temple and hairline restoration before and after',
    title: 'Temple & Hairline Restoration',
    detail: 'Temple point and hairline density · FUE technique',
    tags: ['transplant', 'men'],
    badgeLabel: '✂️ Hair Transplant', badgeClass: 'bg-amber-100 text-amber-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  // ── Hair Transplant — Women ────────────────────────────────────────
  {
    src: '/images/hair-results/2a2e7d2a-eefc-45d7-8471-dc5c8fbd57a6.png',
    alt: "Women's hair transplant before and after",
    title: "Women's Hair Transplant",
    detail: 'FUE · Frontal density and part-line restoration',
    tags: ['transplant', 'women'],
    badgeLabel: '✂️ Hair Transplant', badgeClass: 'bg-amber-100 text-amber-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  {
    src: '/images/hair-results/24f91932-f193-4ecb-99fb-efcffe78589d.png',
    alt: "Women's hair transplant multi-angle before and after",
    title: "Women's Hair Transplant — Multi-Angle",
    detail: 'FUE · Top-down and face-forward views',
    tags: ['transplant', 'women'],
    badgeLabel: '✂️ Hair Transplant', badgeClass: 'bg-amber-100 text-amber-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  {
    src: '/images/hair-results/ae455df2-1539-4cd5-b919-17c02de26c59.png',
    alt: "Women's hair transplant curly hair before and after",
    title: "Women's Hair Transplant — Curly Hair",
    detail: 'FUE · Crown and part-line density',
    tags: ['transplant', 'women'],
    badgeLabel: '✂️ Hair Transplant', badgeClass: 'bg-amber-100 text-amber-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  {
    src: '/images/hair-results/4f546f2b-86d9-4055-9642-cd5dbca487a8.png',
    alt: "Women's hair transplant fine hair before and after",
    title: "Women's Hair Transplant — Fine Hair",
    detail: 'FUE · Hairline and density restoration',
    tags: ['transplant', 'women'],
    badgeLabel: '✂️ Hair Transplant', badgeClass: 'bg-amber-100 text-amber-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  // ── Exosome Therapy ───────────────────────────────────────────────
  {
    src: '/images/hair-results/7b3535e2-6386-4d1e-9252-0453c01644c7.jpg',
    alt: 'Exosome therapy hair restoration before and after',
    title: 'Exosome Therapy — Hair Restoration',
    detail: 'Diffuse thinning · Scalp density and hair caliber improvement',
    tags: ['exosome', 'men'],
    badgeLabel: '⚡ Exosome Therapy', badgeClass: 'bg-violet-100 text-violet-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  // ── PRP — Men ────────────────────────────────────────────────────
  {
    src: '/images/hair-results/a4c097a3-2703-4191-b572-b1e23b035cfe.png',
    alt: 'PRP hair restoration men crown thinning before and after',
    title: 'Crown Thinning — PRP Series',
    detail: 'Crown density restoration',
    tags: ['prp', 'men'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  {
    src: '/images/hair-results/59be3f88-79a1-4205-b2ab-12a4027198b1.png',
    alt: 'PRP hair restoration men salt and pepper before and after',
    title: 'Crown Thinning — PRP (Mature Hair)',
    detail: 'Crown density restoration · Salt & pepper hair',
    tags: ['prp', 'men'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  {
    src: '/images/hair-results/4e4de939-74fa-44eb-b85c-840404033df7.png',
    alt: 'Male hair thinning PRP scalp treatment before and after',
    title: 'Male Hair Thinning — PRP Scalp Treatment',
    detail: 'Crown and vertex thinning · Density restoration',
    tags: ['prp', 'men'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  {
    src: '/images/hair-results/c6ef712d-f4d6-4e71-b9a1-973b6bdbe67e.png',
    alt: 'Crown thinning PRP men salt pepper back view',
    title: 'Crown Thinning — PRP (Back View)',
    detail: 'Crown density · Mature hair',
    tags: ['prp', 'men'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  {
    src: '/images/hair-results/b8e1d7cb-cdc9-4175-8748-95d0463a536d.png',
    alt: 'Crown thinning PRP men dark hair back view',
    title: 'Crown Thinning — PRP (Dark Hair)',
    detail: 'Crown density restoration · Back view',
    tags: ['prp', 'men'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  {
    src: '/images/hair-results/1c8f5dfd-66ea-4366-a661-e92e0cbbde7c.png',
    alt: 'Crown thinning PRP men brown hair back view',
    title: 'Crown Thinning — PRP (Brown Hair)',
    detail: 'Crown density restoration · Back view',
    tags: ['prp', 'men'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  // ── PRP — Women ──────────────────────────────────────────────────
  {
    src: '/images/hair-results/cde6799d-a09c-4376-8608-0bfb69cd4a21.png',
    alt: 'PRP hair restoration women part thinning before and after',
    title: 'Part Thinning — PRP Series',
    detail: 'Center part density restoration',
    tags: ['prp', 'women'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  {
    src: '/images/hair-results/cda6a8dc-3269-4798-90e3-f33504cb2c43.png',
    alt: 'PRP hair restoration women brunette before and after',
    title: 'Part Thinning — PRP (Brunette)',
    detail: 'Center part density restoration',
    tags: ['prp', 'women'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  {
    src: '/images/hair-results/78c13766-5e0f-4e42-9686-3ce9d8ae1455.png',
    alt: 'PRP hair restoration women blonde before and after',
    title: 'Part Thinning — PRP (Blonde)',
    detail: 'Center part density restoration',
    tags: ['prp', 'women'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  {
    src: '/images/hair-results/3d71e9e0-d9df-406f-b983-282ba7b6374f.png',
    alt: 'Crown thinning PRP women brunette back view',
    title: 'Crown Thinning — PRP Women (Brunette)',
    detail: 'Crown density restoration · Back view',
    tags: ['prp', 'women'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  {
    src: '/images/hair-results/46418ddd-3e3a-4006-b773-966910d41ce4.png',
    alt: 'Crown thinning PRP women dark hair back view',
    title: 'Crown Thinning — PRP Women (Dark Hair)',
    detail: 'Crown density restoration · Back view',
    tags: ['prp', 'women'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  {
    src: '/images/hair-results/59cc82c4-50c0-4df1-8ee8-0a2083955f03.png',
    alt: 'Crown thinning PRP women blonde back view',
    title: 'Crown Thinning — PRP Women (Blonde)',
    detail: 'Crown density restoration · Back view',
    tags: ['prp', 'women'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  // ── Postpartum ───────────────────────────────────────────────────
  {
    src: '/images/hair-results/8c62359e-2646-498c-8713-15f02392ddcc.png',
    alt: 'Postpartum hair loss PRP treatment before and after',
    title: 'Post-Partum Hair Loss',
    detail: 'Telogen effluvium following pregnancy',
    tags: ['prp', 'women'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  {
    src: '/images/hair-results/fda6ad0f-7682-4f6c-9828-fae365f1b820.png',
    alt: 'Postpartum hair loss PRP Asian women before and after',
    title: 'Post-Partum Hair Loss (Asian Hair)',
    detail: 'Telogen effluvium following pregnancy',
    tags: ['prp', 'women'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  {
    src: '/images/hair-results/7eb3839b-b774-404b-8b9a-560a581bf903.png',
    alt: 'Postpartum hair loss PRP curly hair before and after',
    title: 'Post-Partum Hair Loss (Curly Hair)',
    detail: 'Telogen effluvium following pregnancy',
    tags: ['prp', 'women'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  {
    src: '/images/hair-results/170289dd-b9da-4d80-ac65-5210c779e965.png',
    alt: 'Postpartum hair loss PRP straight hair before and after',
    title: 'Post-Partum Hair Loss (Straight Hair)',
    detail: 'Telogen effluvium following pregnancy',
    tags: ['prp', 'women'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  {
    src: '/images/hair-results/a1319393-488b-4955-94f5-50ee60270a01.png',
    alt: 'Postpartum hair loss PRP blonde before and after',
    title: 'Post-Partum Hair Loss (Blonde)',
    detail: 'Telogen effluvium following pregnancy',
    tags: ['prp', 'women'],
    badgeLabel: '💧 PRP Therapy', badgeClass: 'bg-emerald-100 text-emerald-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  // ── Eyebrow Transplant ───────────────────────────────────────────
  {
    src: '/images/hair-results/dde2ebc8-9526-4d3b-94ba-138f43bb8d0b.png',
    alt: 'Eyebrow transplant male before and after',
    title: 'Eyebrow Restoration — Male',
    detail: 'FUE · Natural brow density and shape',
    tags: ['eyebrow', 'men'],
    badgeLabel: '✂️ Eyebrow Transplant', badgeClass: 'bg-yellow-100 text-yellow-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  {
    src: '/images/hair-results/8526da81-aa12-4f5d-9231-7178d25cce19.png',
    alt: 'Eyebrow transplant dark hair male before and after',
    title: 'Eyebrow Restoration — Male (Dark Hair)',
    detail: 'FUE · Natural brow density and fullness',
    tags: ['eyebrow', 'men'],
    badgeLabel: '✂️ Eyebrow Transplant', badgeClass: 'bg-yellow-100 text-yellow-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  {
    src: '/images/hair-results/26ab9502-9a43-4205-8f87-ad2a87ad952b.png',
    alt: 'Eyebrow transplant Asian male before and after',
    title: 'Eyebrow Restoration — Male (Asian Hair)',
    detail: 'FUE · Brow density and shape',
    tags: ['eyebrow', 'men'],
    badgeLabel: '✂️ Eyebrow Transplant', badgeClass: 'bg-yellow-100 text-yellow-700',
    genderLabel: 'Male', genderClass: 'bg-gray-100 text-gray-700',
  },
  {
    src: '/images/hair-results/af1a008e-b037-4dd8-920e-1e4225106ba1.png',
    alt: 'Eyebrow transplant female before and after',
    title: 'Eyebrow Restoration — Female',
    detail: 'FUE · Brow density and arch definition',
    tags: ['eyebrow', 'women'],
    badgeLabel: '✂️ Eyebrow Transplant', badgeClass: 'bg-yellow-100 text-yellow-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  {
    src: '/images/hair-results/df703b8e-69ae-4a0b-9863-8aec09cd617d.png',
    alt: 'Eyebrow transplant dark hair female before and after',
    title: 'Eyebrow Restoration — Female (Dark Hair)',
    detail: 'FUE · Full brow shape restoration',
    tags: ['eyebrow', 'women'],
    badgeLabel: '✂️ Eyebrow Transplant', badgeClass: 'bg-yellow-100 text-yellow-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
  {
    src: '/images/hair-results/1ed26656-4a43-41dc-96b8-1350403000ab.png',
    alt: 'Eyebrow transplant Asian female before and after',
    title: 'Eyebrow Restoration — Female (Asian Hair)',
    detail: 'FUE · Brow density and definition',
    tags: ['eyebrow', 'women'],
    badgeLabel: '✂️ Eyebrow Transplant', badgeClass: 'bg-yellow-100 text-yellow-700',
    genderLabel: 'Female', genderClass: 'bg-pink-100 text-pink-700',
  },
];

const FILTERS = [
  { label: 'All Results', value: 'all' },
  { label: 'Hair Transplant', value: 'transplant' },
  { label: 'PRP Therapy', value: 'prp' },
  { label: 'Exosome Therapy', value: 'exosome' },
  { label: 'Eyebrow Transplant', value: 'eyebrow' },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
] as const;

export function HairResultsGallery() {
  const [active, setActive] = useState<string>('all');

  const visible =
    active === 'all'
      ? RESULTS
      : RESULTS.filter((r) => r.tags.includes(active as Tag));

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              active === f.value
                ? 'bg-accent text-white'
                : 'bg-surface-alt text-text-muted hover:bg-accent/10 hover:text-accent border border-border'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((result) => (
          <div
            key={result.src}
            className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm"
          >
            <div className="relative aspect-square">
              <Image
                src={result.src}
                alt={result.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span
                  className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-full',
                    result.badgeClass
                  )}
                >
                  {result.badgeLabel}
                </span>
                {result.genderLabel && (
                  <span
                    className={cn(
                      'text-xs font-semibold px-2.5 py-1 rounded-full',
                      result.genderClass
                    )}
                  >
                    {result.genderLabel}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-primary text-sm mb-0.5">
                {result.title}
              </h3>
              <p className="text-text-muted text-xs">{result.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
