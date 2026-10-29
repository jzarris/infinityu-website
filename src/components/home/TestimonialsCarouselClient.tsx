'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export interface TestimonialItem {
  id: string;
  name: string;
  rating: number;
  date: string;
  treatment: string;
  text: string;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

function Initials({ name }: { name: string }) {
  const letters = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-11 h-11 rounded-full bg-[#F7E7EF] flex items-center justify-center shrink-0">
      <span className="text-sm font-semibold text-[#A32463]">{letters}</span>
    </div>
  );
}

export function TestimonialsCarouselClient({ reviews }: { reviews: TestimonialItem[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = reviews.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused || total === 0) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused, total]);

  if (total === 0) return null;

  const t = reviews[current];

  return (
    <>
      {/* Carousel */}
      <div
        className="relative max-w-3xl mx-auto"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="bg-white rounded-2xl border border-[#EFD5E2] shadow-sm p-8 md:p-10 min-h-[280px] flex flex-col justify-between">
          <div>
            <StarRow rating={t.rating} />
            <blockquote className="mt-4 text-[#3A1B30] text-lg leading-relaxed font-light">
              &ldquo;{t.text}&rdquo;
            </blockquote>
          </div>

          <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Initials name={t.name} />
              <div>
                <p className="font-semibold text-[#3A1B30] text-sm">{t.name}</p>
                <p className="text-[#67506A] text-xs">{t.date}</p>
              </div>
            </div>
            <span className="text-xs font-medium bg-[#F7E7EF] text-[#A32463] px-3 py-1 rounded-full">
              {t.treatment}
            </span>
          </div>
        </div>

        {/* Prev / Next */}
        <button
          onClick={prev}
          aria-label="Previous review"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-10 h-10 rounded-full bg-white border border-[#EFD5E2] shadow-sm flex items-center justify-center text-[#3A1B30] hover:border-[#A32463] hover:text-[#A32463] transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          aria-label="Next review"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-10 h-10 rounded-full bg-white border border-[#EFD5E2] shadow-sm flex items-center justify-center text-[#3A1B30] hover:border-[#A32463] hover:text-[#A32463] transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setPaused(true); }}
            aria-label={`Go to review ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 h-2 bg-[#A32463]'
                : 'w-2 h-2 bg-[#EFD5E2] hover:bg-[#C2A2C0]'
            }`}
          />
        ))}
      </div>
    </>
  );
}
