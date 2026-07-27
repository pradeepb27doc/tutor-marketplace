"use client";

import { memo } from "react";
import { MapPin } from "lucide-react";
import type { PublicTutorServiceAreaDto } from "../types";
import { SectionCard } from "./section-card";

interface ServiceAreasSectionProps {
  serviceAreas: PublicTutorServiceAreaDto[];
}

function ServiceAreasSectionInner({
  serviceAreas,
}: ServiceAreasSectionProps) {
  if (serviceAreas.length === 0) return null;

  return (
    <SectionCard eyebrow="Service Areas" title="Where this tutor teaches">
      <div className="grid gap-3 sm:grid-cols-2">
        {serviceAreas.map((area) => (
          <div
            key={area.id}
            className="flex items-start gap-3 rounded-3xl border border-border p-4 text-sm font-medium text-foreground/64"
          >
            <MapPin
              className="mt-0.5 size-4 shrink-0 text-foreground"
              aria-hidden="true"
            />
            <div>
              <p>
                {area.city}
                {area.locality ? `, ${area.locality}` : ""}
              </p>
              {area.radiusKm && (
                <p className="mt-1 text-xs text-foreground/44">
                  Within {area.radiusKm} km
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export const ServiceAreasSection = memo(ServiceAreasSectionInner);