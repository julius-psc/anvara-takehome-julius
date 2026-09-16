import type { BadgeTone } from '@/app/components/badge';

// Badge tone per campaign status. Kept here so the card, row, form and filter
// all render statuses identically.
export const CAMPAIGN_STATUS_TONE: Record<string, BadgeTone> = {
  DRAFT: 'neutral',
  PENDING_REVIEW: 'warning',
  APPROVED: 'info',
  ACTIVE: 'success',
  PAUSED: 'warning',
  COMPLETED: 'info',
  CANCELLED: 'danger',
};

// "PENDING_REVIEW" -> "Pending review"
export function formatStatusLabel(status: string): string {
  const words = status.toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
