'use client';

import { useState } from 'react';
import { Treatment } from '@/data/services';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Accordion } from '@/components/ui/Accordion';
import { BUSINESS } from '@/lib/constants';
import { Clock, ArrowDownCircle, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TreatmentCardProps {
  treatment: Treatment;
}

export function TreatmentCard({ treatment }: TreatmentCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div>
          <h3 className="font-heading text-xl font-semibold mb-2">{treatment.name}</h3>
          <p className="text-text-muted text-sm">{treatment.shortDescription}</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Badge variant="outline">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {treatment.duration}
          </Badge>
          <Badge variant="outline">
            <ArrowDownCircle className="h-3.5 w-3.5 mr-1" />
            {treatment.downtime} downtime
          </Badge>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-accent text-sm font-medium mb-4"
      >
        {expanded ? 'Hide details' : 'View details'}
        <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="space-y-6 animate-fade-in">
          <p className="text-text-muted">{treatment.fullDescription}</p>

          {treatment.targetAreas && treatment.targetAreas.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Target Areas</h4>
              <div className="flex flex-wrap gap-2">
                {treatment.targetAreas.map((area) => (
                  <Badge key={area} variant="accent">{area}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-sm mb-3">Benefits</h4>
              <ul className="space-y-2">
                {treatment.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-text-muted">
                    <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">What to Expect</h4>
              <ol className="space-y-2">
                {treatment.whatToExpect.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center shrink-0 mt-0.5 font-semibold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {treatment.videoUrl && (
            <div>
              <h4 className="font-semibold text-sm mb-3">See It in Action</h4>
              <div className="max-w-sm mx-auto">
                <video
                  src={treatment.videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          )}

          {treatment.faqs.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Frequently Asked Questions</h4>
              <Accordion items={treatment.faqs} />
            </div>
          )}

          {BUSINESS.bookingUrl && (
            <Button href={BUSINESS.bookingUrl} variant="accent" size="sm">
              Book {treatment.name}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
