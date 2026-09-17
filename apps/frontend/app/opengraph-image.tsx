import { ImageResponse } from 'next/og';

export const alt = 'Anvara — Sponsorship Marketplace';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Default Open Graph / Twitter share card for Anvara. */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#fbfbfa',
        padding: '64px 72px',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          color: '#3959FF',
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: '-0.02em',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: '#3959FF',
          }}
        />
        Anvara
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 650,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#141414',
          }}
        >
          Sponsorship marketplace for sponsors & publishers
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.4, color: '#5c5c5c', maxWidth: 780 }}>
          Browse transparent ad inventory, set campaign budgets, and fill placements in one
          marketplace.
        </div>
      </div>

      <div style={{ display: 'flex', color: '#8a8a8a', fontSize: 22 }}>
        Book placements · List inventory · One marketplace
      </div>
    </div>,
    { ...size }
  );
}
