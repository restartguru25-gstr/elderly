import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { skills } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function SkillsMarketplacePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Skills Marketplace</h1>
        <p className="max-w-2xl text-muted-foreground">
          Empower yourself by sharing your lifelong skills. Offer tutoring, consulting, or craft lessons to the community.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {skills.map((skill) => {
          const image = PlaceHolderImages.find((p) => p.id === skill.imageId);
          return (
            <Card key={skill.id} className="overflow-hidden flex flex-col">
              {image && (
                <div className="relative h-40 w-full">
                  <Image src={image.imageUrl} alt={skill.title} layout="fill" objectFit="cover" data-ai-hint={image.imageHint} />
                </div>
              )}
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">{skill.category}</Badge>
                <CardTitle className="text-lg">{skill.title}</CardTitle>
                <CardDescription>by {skill.author}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow" />
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Connect
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
