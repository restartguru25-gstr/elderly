'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useUser, useMemoFirebase, useStorage } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, FileText, Download } from 'lucide-react';
import { collection, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { WithId } from '@/firebase/firestore/use-collection';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadMedicalDocument } from '@/lib/medical-records-actions';
import Link from 'next/link';

type MedicalDocument = {
  fileName: string;
  fileType: string;
  fileUrl: string;
  userId: string;
  createdAt: any;
};

export default function MedicalRecordsPage() {
  const firestore = useFirestore();
  const storage = useStorage();
  const { user } = useUser();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const medicalDocsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, `users/${user.uid}/medical_docs`), orderBy('createdAt', 'desc')) : null,
    [firestore, user]
  );
  const { data: medicalDocs, isLoading } = useCollection<MedicalDocument>(medicalDocsQuery);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!user || !selectedFile) {
        toast({
            variant: 'destructive',
            title: 'Upload failed',
            description: 'Please select a file to upload.',
        });
        return;
    }
    setIsUploading(true);

    try {
        await uploadMedicalDocument(firestore, storage, user.uid, selectedFile);
        toast({
            title: 'Upload Successful',
            description: `${selectedFile.name} has been securely stored.`,
        });
        setSelectedFile(null);
        // Clear the file input visually
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: error.message || 'There was a problem uploading your file.',
        });
    } finally {
        setIsUploading(false);
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Medical Records</h1>
        <p className="max-w-2xl text-muted-foreground">
          Securely upload, store, and manage your medical documents like reports, prescriptions, and test results.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Document</CardTitle>
          <CardDescription>
            Choose a file to upload to your secure document vault.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Input id="file-upload" type="file" onChange={handleFileChange} className="max-w-xs" />
          <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
            {isUploading ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
            Upload Document
          </Button>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText /> Your Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : medicalDocs && medicalDocs.length > 0 ? (
                  medicalDocs.map((doc: WithId<MedicalDocument>) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium truncate max-w-sm">{doc.fileName}</TableCell>
                      <TableCell className="text-muted-foreground">{doc.fileType}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {doc.createdAt ? format(doc.createdAt.toDate(), 'PP') : '...'}
                      </TableCell>
                       <TableCell className="text-right">
                        <Button asChild variant="ghost" size="icon">
                            <Link href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Download />
                            </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                            No medical documents uploaded yet.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
