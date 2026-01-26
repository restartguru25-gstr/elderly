import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { communityGroups } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Users } from 'lucide-react';
import Image from 'next/image';

export default function CommunityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Community Forums</h1>
        <p className="max-w-2xl text-muted-foreground">
          Connect with like-minded individuals, share your hobbies, and make new friends in our interest-based community groups.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {communityGroups.map((group) => {
          const image = PlaceHolderImages.find((p) => p.id === group.imageId);
          return (
            <Card key={group.id} className="overflow-hidden flex flex-col">
              {image && (
                <div className="relative h-48 w-full">
                  <Image src={image.imageUrl} alt={group.name} layout="fill" objectFit="cover" data-ai-hint={image.imageHint} />
                </div>
              )}
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow" />
              <CardFooter className="flex justify-between items-center bg-secondary/40 py-3 px-6">
                 <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {group.members} members
                 </div>
                <Button>Join Group</Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
