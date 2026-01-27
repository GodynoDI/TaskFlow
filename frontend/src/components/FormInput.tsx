import type { InputHTMLAttributes } from 'react'

type FormInputSize = 'default' | 'compact'

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  size?: FormInputSize
}

export function FormInput({ size = 'default', className, ...props }: FormInputProps) {
  const classes = [
    'form-input',
    size !== 'default' ? `form-input_size_${size}` : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return <input {...props} className={classes} />
}

