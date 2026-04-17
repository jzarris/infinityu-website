import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="font-heading text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="font-heading text-2xl mb-4">Page Not Found</h2>
        <p className="text-text-muted mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
