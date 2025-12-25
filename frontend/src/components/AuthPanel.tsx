import { useEffect, useMemo, useState } from 'react'
import './AuthPanel.scss'

export type AuthFormMode = 'login' | 'register'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  fullName: string
}

export interface AuthResult {
  success: boolean
  message?: string
}

interface AuthPanelProps {
  mode: AuthFormMode
  onModeChange: (mode: AuthFormMode) => void
  onLogin: (payload: LoginPayload) => AuthResult | Promise<AuthResult>
  onRegister: (payload: RegisterPayload) => AuthResult | Promise<AuthResult>
}

const initialFormState = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function AuthPanel({ mode, onModeChange, onLogin, onRegister }: AuthPanelProps) {
  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)

  useEffect(() => {
    setForm(initialFormState)
    setErrors({})
    setSubmitError(null)
  }, [mode])

  const validators = useMemo(
    () => ({
      fullName: (value: string) => {
        if (mode === 'login') return ''
        if (!value.trim()) return 'Укажите имя'
        if (value.trim().length < 2) return 'Имя должно быть не короче 2 символов'
        return ''
      },
      email: (value: string) => {
        if (!value.trim()) return 'Укажите email'
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(value.trim().toLowerCase())) return 'Некорректный email'
        return ''
      },
      password: (value: string) => {
        if (!value) return 'Введите пароль'
        if (value.length < 6) return 'Пароль должен быть не короче 6 символов'
        return ''
      },
      confirmPassword: (value: string) => {
        if (mode === 'login') return ''
        if (!value) return 'Повторите пароль'
        if (value !== form.password) return 'Пароли не совпадают'
        return ''
      },
    }),
    [mode, form.password]
  )

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    Object.entries(validators).forEach(([field, validator]) => {
      const message = validator(form[field as keyof typeof form])
      if (message) {
        nextErrors[field] = message
      }
    })
    setErrors(nextErrors)
    return nextErrors
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.values(nextErrors).some(Boolean)) return

    setSubmitting(true)
    setSubmitError(null)

    const payload =
      mode === 'login'
        ? { email: form.email.trim(), password: form.password }
        : {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            password: form.password,
          }

    const result =
      mode === 'login'
        ? await onLogin(payload as LoginPayload)
        : await onRegister(payload as RegisterPayload)

    if (!result.success) {
      setSubmitError(result.message ?? 'Не удалось выполнить действие')
    }

    setSubmitting(false)
  }

  return (
    <section className="auth-panel">
      <header className="auth-panel__header">
        <div>
          <h1 className="auth-panel__title">TaskFlow</h1>
          <p className="auth-panel__subtitle">
            {mode === 'login' ? 'Войдите, чтобы продолжить работу' : 'Создайте аккаунт за минуту'}
          </p>
        </div>
        <div className="auth-panel__switch">
          <span>{mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}</span>
          <button
            type="button"
            className="auth-panel__switch-btn"
            onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </header>

      <form className="auth-panel__form" onSubmit={handleSubmit} noValidate>
        {mode === 'register' && (
          <div className="auth-panel__field">
            <label htmlFor="fullName">Имя</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Например, Анна Смирнова"
              aria-invalid={Boolean(errors.fullName)}
            />
            {errors.fullName && <span className="auth-panel__error">{errors.fullName}</span>}
          </div>
        )}

        <div className="auth-panel__field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="name@email.ru"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <span className="auth-panel__error">{errors.email}</span>}
        </div>

        <div className="auth-panel__field">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Минимум 6 символов"
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && <span className="auth-panel__error">{errors.password}</span>}
        </div>

        {mode === 'register' && (
          <div className="auth-panel__field">
            <label htmlFor="confirmPassword">Подтверждение пароля</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Повторите пароль"
              aria-invalid={Boolean(errors.confirmPassword)}
            />
            {errors.confirmPassword && (
              <span className="auth-panel__error">{errors.confirmPassword}</span>
            )}
          </div>
        )}

        {submitError && <div className="auth-panel__submit-error">{submitError}</div>}

        <button type="submit" className="auth-panel__submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Обработка...'
            : mode === 'login'
              ? 'Войти в TaskFlow'
              : 'Создать аккаунт'}
        </button>
      </form>
    </section>
  )
}
