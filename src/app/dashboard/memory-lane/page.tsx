'use client';

import { PhotoRestorer } from '@/components/features/photo-restorer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageIcon, Sparkles, Share2, Heart, BookOpen } from 'lucide-react';

export default function MemoryLanePage() {
  return (
    <div className="space-y-8">
      {/* Story-style header */}
      <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 sm:p-10">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-xl bg-gradient-primary p-2">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-primary">AI-Powered</span>
          </div>
          <h1 className="mb-3 text-4xl font-bold text-foreground">
            Memory Lane
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground mb-6">
            Breathe new life into old memories. Upload a faded or damaged photograph,
            and let our AI restore it. A wonderful way to reconnect with the past.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-background/80 px-3 py-2 border">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm">One-click restore</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-background/80 px-3 py-2 border">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm">Preserve forever</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-background/80 px-3 py-2 border">
              <Share2 className="h-4 w-4 text-primary" />
              <span className="text-sm">Share with family</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery-style restore card */}
      <Card className="border-2 shadow-soft-lg overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                AI Photo Restoration
              </CardTitle>
              <CardDescription>
                Upload a photo to begin. We&apos;ll enhance faded or damaged images.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PhotoRestorer />
        </CardContent>
      </Card>

      {/* Story format - tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="bordered" className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="rounded-xl bg-primary/10 w-fit p-3 mb-4">
              <span className="text-2xl">📷</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Old photos work best</h3>
            <p className="text-sm text-muted-foreground">
              Faded, scratched, or discolored images see the most dramatic improvements.
            </p>
          </CardContent>
        </Card>
        <Card variant="bordered" className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="rounded-xl bg-primary/10 w-fit p-3 mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Instant results</h3>
            <p className="text-sm text-muted-foreground">
              Our AI typically restores your photo in seconds. No waiting required.
            </p>
          </CardContent>
        </Card>
        <Card variant="bordered" className="hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="rounded-xl bg-primary/10 w-fit p-3 mb-4">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Share with loved ones</h3>
            <p className="text-sm text-muted-foreground">
              Download and share restored memories with family and friends.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
