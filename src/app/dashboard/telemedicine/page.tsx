import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { doctors } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Search } from 'lucide-react';

export default function TelemedicinePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Telemedicine Services</h1>
        <p className="max-w-2xl text-muted-foreground">
          Book online, clinic, or home visit appointments with verified and trusted healthcare professionals.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search by doctor name or specialty..." className="w-full max-w-lg pl-10" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {doctors.map((doctor) => {
          const image = PlaceHolderImages.find((p) => p.id === doctor.imageId);
          return (
            <Card key={doctor.id} className="flex flex-col">
              <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  {image && <AvatarImage src={image.imageUrl} alt={doctor.name} data-ai-hint={image.imageHint} />}
                  <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle>{doctor.name}</CardTitle>
                <CardDescription>{doctor.specialty}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-end justify-center">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Book Appointment</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
