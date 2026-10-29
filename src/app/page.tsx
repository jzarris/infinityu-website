import { HeroSection } from '@/components/home/HeroSection';
import { ServicesOverview } from '@/components/home/ServicesOverview';
import { DoctorsPreview } from '@/components/home/DoctorsPreview';
import { WhyUs } from '@/components/home/WhyUs';
import { TestimonialsCarousel } from '@/components/home/TestimonialsCarousel';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';
import { CTABand } from '@/components/home/CTABand';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesOverview />
      <TestimonialsCarousel />
      <DoctorsPreview />
      <WhyUs />
      <NewsletterSignup />
      <CTABand />
    </>
  );
}
