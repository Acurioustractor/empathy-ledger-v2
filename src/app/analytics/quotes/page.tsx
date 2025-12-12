'use client'

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import QuoteAnalysis from '@/components/analytics/QuoteAnalysis';

export default function QuotesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Wisdom Quote Analysis</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Discover profound wisdom and teachings preserved within community stories. 
          Our AI-powered analysis identifies and ranks significant quotes while maintaining 
          cultural protocols and elder approval processes.
        </p>
      </div>

      {/* Cultural Protocol Notice */}
      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <Shield className="w-4 h-4" />
        <AlertDescription>
          Elder wisdom quotes are sacred knowledge requiring cultural review and approval. 
          Only community-approved quotes are displayed to respect Indigenous knowledge protocols.
        </AlertDescription>
      </Alert>
      
      <QuoteAnalysis />
    </div>
  );
}