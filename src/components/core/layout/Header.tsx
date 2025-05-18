
import { Music2Icon } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Music2Icon size={36} strokeWidth={2.5} />
          <h1 className="text-3xl font-bold tracking-tight">SwaraML</h1>
        </Link>
        {/* Navigation links can be added here if needed */}
      </div>
    </header>
  );
}
