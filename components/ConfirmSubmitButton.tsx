'use client';

import { useTransition } from 'react';

export function ConfirmSubmitButton({
  action,
  confirmMessage,
  children,
  className,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={className}
      disabled={isPending}
      onClick={() => {
        if (confirm(confirmMessage)) {
          startTransition(() => {
            action();
          });
        }
      }}
    >
      {isPending ? '...' : children}
    </button>
  );
}
