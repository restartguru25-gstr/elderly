'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/** Short referral link: /r/ABC123 -> /signup?ref=ABC123 */
export default function ReferralRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string | undefined;

  useEffect(() => {
    if (code) {
      router.replace(`/signup?ref=${encodeURIComponent(code)}`);
    } else {
      router.replace('/signup');
    }
  }, [code, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
