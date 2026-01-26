'use client';

import { restoreOldPhoto } from '@/ai/flows/restore-old-photos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, ChangeEvent, DragEvent } from 'react';

const placeholder = PlaceHolderImages.find(p => p.id === 'old-photo-placeholder');

export function PhotoRestorer() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setRestoredImage(null);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please upload a valid image file.',
        variant: 'destructive',
      });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files ? e.target.files[0] : null);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files ? e.dataTransfer.files[0] : null);
  };

  const onDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const onDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleRestore = async () => {
    if (!originalImage) return;

    setIsLoading(true);
    try {
      const result = await restoreOldPhoto({ photoDataUri: originalImage });
      setRestoredImage(result.restoredPhotoDataUri);
      toast({
        title: 'Success!',
        description: 'Your photo has been beautifully restored.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Restoration Failed',
        description: 'We could not restore the photo. Please try another image.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!originalImage && (
        <label
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          className={cn(
            "relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/20 p-12 sm:p-16 text-center transition-all duration-200 hover:border-primary hover:bg-primary/5",
            isDragging && "border-primary bg-primary/10"
          )}
        >
          <Upload className="mx-auto h-14 w-14 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Drag & drop or click to upload
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            PNG, JPG, or WEBP. Old photos work best.
          </p>
          <Input id="photo-upload" type="file" className="sr-only" onChange={onFileChange} accept="image/png, image/jpeg, image/webp" />
        </label>
      )}

      {originalImage && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-center font-semibold text-muted-foreground">Original</h3>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 bg-secondary/20">
              <Image 
                src={originalImage} 
                alt="Original photo" 
                fill 
                style={{ objectFit: 'contain' }}
                loading="eager"
                quality={90}
              />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-center font-semibold text-muted-foreground">Restored</h3>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 bg-secondary/20">
              {isLoading ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="font-medium">Restoring your photo...</p>
                </div>
              ) : restoredImage ? (
                <Image 
                  src={restoredImage} 
                  alt="Restored photo" 
                  fill 
                  style={{ objectFit: 'contain' }}
                  loading="eager"
                  quality={90}
                />
              ) : placeholder ? (
                <Image 
                  src={placeholder.imageUrl} 
                  alt="Photo placeholder" 
                  fill 
                  style={{ objectFit: 'contain' }} 
                  data-ai-hint={placeholder.imageHint}
                  loading="lazy"
                />
              ) : null}
            </div>
          </div>
        </div>
      )}

      {originalImage && (
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setOriginalImage(null);
              setRestoredImage(null);
            }}
          >
            Upload Another
          </Button>
          <Button variant="gradient" onClick={handleRestore} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Restoring...' : 'Restore Photo'}
          </Button>
        </div>
      )}
    </div>
  );
}
