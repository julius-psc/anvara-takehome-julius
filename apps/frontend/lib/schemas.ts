import { z } from 'zod';

// Shared validation schemas.
//
// Each schema is the SINGLE source of truth for a resource's shape, used by both:
//  - the client form (react-hook-form via zodResolver) for instant UX feedback
//  - the Server Action, which re-validates on the server so we never trust the
//    client (client validation is UX; server validation is the real gate).

// ── Campaigns ──────────────────────────────────────────────────────────────
export const CAMPAIGN_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
] as const;

export const campaignSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    description: z.string().trim().optional(),
    // The form registers this with { valueAsNumber: true }, so it's already a number.
    // The `error` message covers the empty-field case (which arrives as NaN).
    budget: z.number({ error: 'Budget is required' }).positive('Budget must be a positive number'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    status: z.enum(CAMPAIGN_STATUSES).optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  });

export type CampaignInput = z.infer<typeof campaignSchema>;

// ── Ad slots ───────────────────────────────────────────────────────────────
export const AD_SLOT_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'] as const;

export const adSlotSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
  type: z.enum(AD_SLOT_TYPES),
  basePrice: z
    .number({ error: 'Base price is required' })
    .positive('Base price must be a positive number'),
  isAvailable: z.boolean().optional(),
});

export type AdSlotInput = z.infer<typeof adSlotSchema>;
