'use client';

import { useState } from 'react';
import { inputClass } from '@/lib/ui';

export function PasswordInput({
  name,
  placeholder,
  minLength,
}: {
  name: string;
  placeholder?: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        name={name}
        type={visible ? 'text' : 'password'}
        required
        minLength={minLength}
        placeholder={placeholder}
        className={inputClass}
        style={{ paddingRight: 44 }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        title={visible ? 'Ocultar senha' : 'Mostrar senha'}
        style={{
          position: 'absolute',
          top: '50%',
          right: 6,
          transform: 'translateY(-50%)',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          color: '#86827A',
          padding: 8,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 8,
        }}
      >
        <i className={visible ? 'ph ph-eye-slash' : 'ph ph-eye'} style={{ fontSize: 18 }} />
      </button>
    </div>
  );
}
