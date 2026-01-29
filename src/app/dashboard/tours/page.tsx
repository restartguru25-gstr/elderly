'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, ArrowRight, Plane, Train, Bus, Star } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Tour } from '@/lib/tours-actions';
import { Skeleton } from '@/components/ui/skeleton';

const TRANSPORT_MAP: Record<string, typeof Plane> = { Plane, Train, Bus };

const fallbackTours: Tour[] = [
  {
    id: '1',
    title: 'Golden Triangle Tour',
    location: 'Delhi, Agra, Jaipur',
    duration: '5 Days / 4 Nights',
    price: 25000,
    originalPrice: 30000,
    imageId: 'travel-golden-triangle',
    transport: 'Bus',
    rating: 4.8,
    reviews: 125,
    features: ['Comfortable A/C coach', 'Senior-friendly itinerary', 'Trained team assistance'],
  },
  {
    id: '2',
    title: 'Kerala Backwaters',
    location: 'Kochi, Alleppey, Munnar',
    duration: '6 Days / 5 Nights',
    price: 32000,
    originalPrice: 38000,
    imageId: 'travel-kerala',
    transport: 'Train',
    rating: 4.9,
    reviews: 98,
    features: ['Scenic train journey', 'Houseboat stay', 'Gentle pace'],
  },
  {
    id: '3',
    title: 'Himalayan Retreat',
    location: 'Shimla, Manali',
    duration: '7 Days / 6 Nights',
    price: 28000,
    originalPrice: 35000,
    imageId: 'travel-himalayas',
    transport: 'Bus',
    rating: 4.7,
    reviews: 87,
    features: ['Mountain views', 'Cool climate', 'Relaxing pace'],
  },
];

export default function ToursPage() {
  const firestore = useFirestore();
  const toursQuery = useMemoFirebase(
    () => query(collection(firestore, 'tours'), orderBy('createdAt', 'desc'), limit(50)),
    [firestore]
  );
  const { data: toursFromDb, isLoading } = useCollection<Tour>(toursQuery);
  const tours = (toursFromDb && toursFromDb.length > 0) ? toursFromDb : fallbackTours;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold">
          Explore the world with <span className="text-gradient-primary">ElderLink Tours</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Unforgettable domestic and international senior-friendly tours. Travel with comfort, care, and companionship.
        </p>
      </div>

      {/* Why Travel Section */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="text-2xl">Your Comfort is our Priority</CardTitle>
          <CardDescription>Why Travel with ElderLink?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Comfortable Travel',
                description: 'A/C coach travel with timely breaks',
                icon: Bus,
              },
              {
                title: 'Senior-Friendly',
                description: 'Itineraries designed for your pace',
                icon: Users,
              },
              {
                title: 'Trained Team',
                description: 'Dedicated assistance throughout',
                icon: Star,
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-4 rounded-xl bg-background/50 border-2">
                  <div className="rounded-full bg-gradient-primary p-3 w-fit mx-auto mb-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tours Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Available Tours</h2>
          <Badge variant="outline" className="text-sm">
            Special discounts for members
          </Badge>
        </div>
        {isLoading && toursFromDb === null ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour, index) => {
            const image =
              PlaceHolderImages.find((p) => p.id === tour.imageId) ||
              PlaceHolderImages.find((p) => p.id === 'travel-golden-triangle') ||
              PlaceHolderImages[0];
            const TransportIcon = TRANSPORT_MAP[tour.transport] || Bus;
            const isFirst = index === 0;

            return (
              <Card
                key={tour.id}
                className="overflow-hidden border-2 transition-all duration-300 hover:border-primary hover:shadow-warm group"
              >
                {image && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={image.imageUrl}
                      alt={tour.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-300 group-hover:scale-105"
                      priority={isFirst}
                      loading={isFirst ? undefined : 'lazy'}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-primary text-white">
                      Save ₹{(tour.originalPrice - tour.price).toLocaleString()}
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{tour.title}</CardTitle>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-semibold">{tour.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{tour.location}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{tour.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TransportIcon className="h-4 w-4" />
                      <span>Transport</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {tour.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="text-2xl font-bold">₹{tour.price.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground line-through">
                        ₹{tour.originalPrice.toLocaleString()}
                      </div>
                    </div>
                    <Button variant="gradient" size="lg">
                      Book Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
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
