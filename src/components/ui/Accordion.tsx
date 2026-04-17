'use client';

import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn('divide-y divide-border', className)}>
      {items.map((item, index) => (
        <div key={index}>
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between py-5 text-left"
          >
            <span className="font-medium text-primary pr-4">{item.question}</span>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-text-muted shrink-0 transition-transform duration-200',
                openIndex === index && 'rotate-180'
              )}
            />
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              openIndex === index ? 'max-h-96 pb-5' : 'max-h-0'
            )}
          >
            <p className="text-text-muted leading-relaxed">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
