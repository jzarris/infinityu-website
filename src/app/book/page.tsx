import { redirect } from 'next/navigation';
import { BUSINESS } from '@/lib/constants';

export default function BookPage() {
  // Redirect to external booking URL if set, otherwise to contact page
  const bookingUrl = BUSINESS.bookingUrl;

  if (bookingUrl && bookingUrl !== '#') {
    redirect(bookingUrl);
  }

  redirect('/contact');
}
