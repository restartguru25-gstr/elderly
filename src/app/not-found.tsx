import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-warm px-4">
      <Logo href="/" className="absolute left-4 top-4" />
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary">404</h1>
        <p className="mt-2 text-xl text-muted-foreground">Page not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
