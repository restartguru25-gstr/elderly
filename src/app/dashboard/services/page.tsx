'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Wrench, Heart } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { ServiceProvider } from '@/lib/service-providers-actions';
import { Skeleton } from '@/components/ui/skeleton';

const IMAGE_IDS = ['doctor-avatar-1', 'community-yoga', 'skill-tutoring', 'skill-cooking', 'community-gardening'];

export default function ServicesPage() {
  const firestore = useFirestore();
  const providersQuery = useMemoFirebase(
    () => query(collection(firestore, 'serviceProviders'), orderBy('createdAt', 'desc'), limit(50)),
    [firestore]
  );
  const { data: providers, isLoading } = useCollection<ServiceProvider>(providersQuery);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold">
          ElderLink <span className="text-gradient-primary">Services</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Home nursing, physiotherapy, and other care services. Connect with verified providers.
        </p>
      </div>

      <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 grid-mobile-fix w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-full bg-gradient-primary p-2 shrink-0">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm">Verified service providers</span>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-full bg-gradient-primary p-2 shrink-0">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm">Senior-friendly care</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-6">Available services</h2>
        {isLoading && providers === null ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 grid-mobile-fix w-full">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : !providers || providers.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12 text-center text-muted-foreground">
              No service providers listed yet. Check back later.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 grid-mobile-fix w-full">
            {providers.map((p) => {
              const image = p.imageId
                ? PlaceHolderImages.find((i) => i.id === p.imageId)
                : null;
              return (
                <Card key={p.id} className="overflow-hidden border-2 transition-all hover:border-primary hover:shadow-warm">
                  {image && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={image.imageUrl}
                        alt={p.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <Badge className="absolute top-3 right-3 bg-primary text-white">{p.type}</Badge>
                    </div>
                  )}
                  {!image && (
                    <div className="h-24 bg-muted flex items-center justify-center">
                      <Wrench className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{p.name}</CardTitle>
                    <CardDescription>{p.type}</CardDescription>
                    {p.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {p.contact && (
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {p.contact.includes('@') ? (
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <a href={`mailto:${p.contact}`}>
                              <Mail className="h-4 w-4" />
                              Email
                            </a>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <a href={p.contact.startsWith('http') ? p.contact : `tel:${p.contact}`}>
                              <Phone className="h-4 w-4" />
                              Contact
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
