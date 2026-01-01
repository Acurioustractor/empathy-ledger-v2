'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, User, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import type { StepProps } from '../types';

export function PhotoUploadStep({ data, onUpdate, onNext, onBack }: StepProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCoverDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const avatarDropzone = useDropzone({
    onDrop: handleAvatarDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    multiple: false,
  });

  const coverDropzone = useDropzone({
    onDrop: handleCoverDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    multiple: false,
  });

  const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'profile');

    const response = await fetch('/api/media', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return result.mediaId;
  };

  const handleNext = async () => {
    setIsUploading(true);
    try {
      let avatarMediaId: string | undefined;
      let coverMediaId: string | undefined;

      if (avatarFile) {
        avatarMediaId = await uploadPhoto(avatarFile);
      }

      if (coverFile) {
        coverMediaId = await uploadPhoto(coverFile);
      }

      onUpdate({ avatarMediaId, coverMediaId });
      onNext();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Avatar Upload */}
      <div className="space-y-3">
        <Label>Profile Photo</Label>
        <div
          {...avatarDropzone.getRootProps()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <input {...avatarDropzone.getInputProps()} />
          {avatarPreview ? (
            <div className="relative inline-block">
              <Image
                src={avatarPreview}
                alt="Avatar preview"
                width={200}
                height={200}
                className="rounded-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 rounded-full h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="py-8">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop a profile photo, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Recommended: Square image, at least 400x400px
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cover Photo Upload */}
      <div className="space-y-3">
        <Label>Cover Photo (Optional)</Label>
        <div
          {...coverDropzone.getRootProps()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <input {...coverDropzone.getInputProps()} />
          {coverPreview ? (
            <div className="relative inline-block w-full max-w-2xl">
              <Image
                src={coverPreview}
                alt="Cover preview"
                width={800}
                height={300}
                className="rounded-lg object-cover w-full"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 rounded-full h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setCoverFile(null);
                  setCoverPreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="py-8">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop a cover photo, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Recommended: Wide image, at least 1600x600px
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button
            onClick={handleNext}
            disabled={isUploading || (!avatarFile && !coverFile)}
            size="lg"
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Continue to Locations'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
