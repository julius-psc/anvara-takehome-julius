import {
  IconLayoutGrid,
  IconVideo,
  IconArticle,
  IconMail,
  IconMicrophone,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';
import type { BadgeTone } from '@/app/components/badge';

// Presentation metadata for each ad-slot type: a human label (so we never show
// raw enum caps like "PODCAST"), a Tabler icon, and a badge tone. Structural
// icon type keeps this decoupled from Tabler's own type exports.
type IconComponent = ComponentType<{ size?: number; stroke?: number; className?: string }>;

export const AD_SLOT_TYPE_META: Record<
  string,
  { label: string; icon: IconComponent; tone: BadgeTone }
> = {
  DISPLAY: { label: 'Display', icon: IconLayoutGrid, tone: 'info' },
  VIDEO: { label: 'Video', icon: IconVideo, tone: 'danger' },
  NATIVE: { label: 'Native', icon: IconArticle, tone: 'neutral' },
  NEWSLETTER: { label: 'Newsletter', icon: IconMail, tone: 'warning' },
  PODCAST: { label: 'Podcast', icon: IconMicrophone, tone: 'success' },
};
