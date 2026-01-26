import { PhotoRestorer } from '@/components/features/photo-restorer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MemoryLanePage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold text-foreground">Memory Lane</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Breathe new life into old memories. Upload a faded or damaged photograph, and let our AI-powered tool restore it to its former glory. A wonderful way to reconnect with the past.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>AI Photo Restoration</CardTitle>
          <CardDescription>Upload a photo to begin the restoration process.</CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoRestorer />
        </CardContent>
      </Card>
    </div>
  );
}
