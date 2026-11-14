import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  invalido?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, Props>(({ invalido, ...props }, ref) => {
  const [ver, setVer] = useState(false);
  return (
    <div className="position-relative">
      <input
        ref={ref}
        type={ver ? 'text' : 'password'}
        className={`form-control pe-5 ${invalido ? 'is-invalid' : ''}`}
        {...props}
      />
      <button
        type="button"
        className="vs-eye"
        onClick={() => setVer(!ver)}
        aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        <i className={`bi ${ver ? 'bi-eye-slash' : 'bi-eye'}`} />
      </button>
    </div>
  );
});

export default PasswordInput;