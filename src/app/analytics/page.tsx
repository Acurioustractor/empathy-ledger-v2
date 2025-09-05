import { Metadata } from 'next';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Community Impact Analytics | Empathy Ledger',
  description: 'Comprehensive analytics dashboard showing community impact, cultural insights, and storyteller connections with Indigenous data sovereignty.',
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Community Impact Analytics</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Discover powerful insights from our community stories while respecting Indigenous data sovereignty 
          and cultural protocols. Our analytics transform 550+ stories into meaningful community impact measures.
        </p>
      </div>
      
      <AnalyticsDashboard />
    </div>
  );
}