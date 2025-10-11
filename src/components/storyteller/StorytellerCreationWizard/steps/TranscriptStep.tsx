'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, X } from 'lucide-react';
import type { StepProps, TranscriptData } from '../types';

export function TranscriptStep({ data, onUpdate, onNext, onBack }: StepProps) {
  const [transcript, setTranscript] = useState<TranscriptData>(
    data.transcriptData || {
      content: '',
      title: '',
      recordedDate: '',
      duration: undefined,
    }
  );
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof TranscriptData, string>>
  >({});

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const droppedFile = acceptedFiles[0];
    if (droppedFile) {
      setFile(droppedFile);
      // Read file content if it's a text file
      if (droppedFile.type === 'text/plain' || droppedFile.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setTranscript((prev) => ({
            ...prev,
            content,
            title: prev.title || droppedFile.name.replace(/\.[^/.]+$/, ''),
          }));
        };
        reader.readAsText(droppedFile);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleChange = (field: keyof TranscriptData, value: string | number) => {
    setTranscript((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TranscriptData, string>> = {};

    if (!transcript.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!transcript.content.trim()) {
      newErrors.content = 'Transcript content is required';
    } else if (transcript.content.trim().length < 10) {
      newErrors.content = 'Transcript must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) {
      return;
    }

    setIsUploading(true);
    try {
      // If a file was uploaded and needs processing, handle it here
      // For now, we'll just pass the data along
      onUpdate({ transcriptData: transcript });
      onNext();
    } catch (error) {
      console.error('Failed to process transcript:', error);
      alert('Failed to process transcript. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Upload or paste the transcript of the storyteller's interview or story.
        </p>
      </div>

      {/* File Upload */}
      <div className="space-y-3">
        <Label>Upload Transcript File (Optional)</Label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'hover:border-primary'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex items-center justify-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setTranscript((prev) => ({ ...prev, content: '' }));
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="py-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                {isDragActive
                  ? 'Drop the file here'
                  : 'Drag & drop a transcript file, or click to select'}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports .txt, .pdf, .docx files
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={transcript.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., Life Story Interview - June 2024"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">
          Transcript Content <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="content"
          value={transcript.content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="Paste or type the transcript content here..."
          rows={12}
          className="font-mono text-sm"
        />
        <p className={`text-sm ${transcript.content.trim().length < 10 && transcript.content.length > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
          {transcript.content.length} characters (minimum 10 required)
        </p>
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content}</p>
        )}
      </div>

      {/* Optional Metadata */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="recordedDate">Recording Date (Optional)</Label>
          <Input
            id="recordedDate"
            type="date"
            value={transcript.recordedDate}
            onChange={(e) => handleChange('recordedDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration in Minutes (Optional)</Label>
          <Input
            id="duration"
            type="number"
            value={transcript.duration || ''}
            onChange={(e) =>
              handleChange('duration', parseInt(e.target.value) || 0)
            }
            placeholder="e.g., 45"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={isUploading} size="lg">
          {isUploading ? 'Processing...' : 'Continue to Tagging'}
        </Button>
      </div>
    </div>
  );
}
