'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, MapPin, Users, ArrowRight, Star, Award, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'singing', name: 'Singing & Music', icon: '🎤' },
  { id: 'dancing', name: 'Dancing', icon: '💃' },
  { id: 'painting', name: 'Painting & Art', icon: '🎨' },
  { id: 'cooking', name: 'Cooking', icon: '👨‍🍳' },
  { id: 'writing', name: 'Writing & Poetry', icon: '✍️' },
  { id: 'photography', name: 'Photography', icon: '📷' },
  { id: 'yoga', name: 'Yoga & Fitness', icon: '🧘' },
  { id: 'crafts', name: 'Arts & Crafts', icon: '🪡' },
];

export default function FiftyAboveFiftyPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="border-2 overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5">
        <CardContent className="p-8 sm:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <div className="rounded-2xl bg-gradient-primary p-3">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <Badge className="bg-primary text-white text-base px-4 py-2">
                  ₹ 1 Cr. Prize Pool
                </Badge>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                Showcase your talent & win
                <br />
                <span className="text-gradient-primary">₹ 1 Cr. Prize Pool</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                India&apos;s biggest talent hunt for seniors above 50. Nominate yourself in 50 unique categories.
                Submit your entries online or offline. Nationwide live auditions.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Button size="lg" variant="gradient" className="text-lg px-8">
                  Nominate Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 border-2">
                  View Categories
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="rounded-2xl bg-gradient-primary p-8 text-white text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">2 Day</div>
                  <div className="text-xl mb-4">Mega Event</div>
                  <div className="text-lg font-semibold mb-2">Grand Award Show</div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>NESCO, Mumbai</span>
                  </div>
                  <div className="mt-4 text-sm">15 November 2025</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">50 Unique Categories</h2>
          <p className="text-muted-foreground">
            Choose your talent category and submit your entry
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="border-2 hover:border-primary hover:shadow-warm transition-all duration-300 cursor-pointer group"
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="font-semibold">{category.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Nominate Yourself',
                description: 'Submit your entries online or offline in any of the 50 categories',
              },
              {
                step: '2',
                title: 'Nationwide Auditions',
                description: 'Participate in live auditions across India',
              },
              {
                step: '3',
                title: 'Grand Award Show',
                description: 'Winners announced at the 2-day mega event in Mumbai',
              },
            ].map((item) => (
              <div key={item.step} className="text-center p-6 rounded-xl border-2 bg-secondary/20">
                <div className="rounded-full bg-gradient-primary w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="border-2 bg-gradient-to-br from-accent/5 to-primary/5">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Why Participate?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Showcase your unique talents',
              'Win from ₹ 1 Cr. prize pool',
              'Get recognized nationwide',
              'Connect with like-minded seniors',
              'FREE entry for ElderLink members',
              'Chance to perform at grand event',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                <Star className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-2 bg-gradient-primary text-white">
        <CardContent className="p-8 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to Showcase Your Talent?</h2>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            Join thousands of seniors who are already participating. Nominate yourself today!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Nominate Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
