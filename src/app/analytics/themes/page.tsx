'use client'

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import ThematicAnalysis from '@/components/analytics/ThematicAnalysis';

export default function ThemesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Cultural Theme Analysis</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Explore the rich tapestry of cultural themes woven throughout our community stories. 
          Discover patterns, sentiments, and the evolution of cultural narratives with respect for Indigenous knowledge.
        </p>
      </div>

      {/* Cultural Protocol Notice */}
      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <Shield className="w-4 h-4" />
        <AlertDescription>
          Theme analysis is conducted with cultural sensitivity and elder oversight. 
          Sacred or sensitive themes are protected according to community protocols.
        </AlertDescription>
      </Alert>
      
      <ThematicAnalysis />
    </div>
  );
}