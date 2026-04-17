import { Search } from 'lucide-react';

export default function SeoPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Search className="h-6 w-6 text-[#2E2865]" />
        <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
        <p>SEO settings coming soon.</p>
      </div>
    </div>
  );
}
