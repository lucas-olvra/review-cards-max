'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({
  children,
  pendingText,
  className,
  style,
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className} style={style}>
      {pending ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <i className="ph-bold ph-spinner rcp-spin" style={{ fontSize: 15 }} />
          {pendingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
