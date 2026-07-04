import { useRef, useState, type FormEvent } from 'react'

/**
 * Book a Private Viewing — an invitation, not a form.
 *
 * Underline inputs, quiet gold error states, simulated async submit
 * (disabled -> 900ms -> concierge confirmation replacing the form).
 */

type FieldId = 'name' | 'email' | 'phone' | 'city'
type Values = Record<FieldId, string>
type Errors = Partial<Record<FieldId, string>>
type Status = 'idle' | 'submitting' | 'success'

const FIELDS: {
  id: FieldId
  label: string
  type: string
  autoComplete: string
  inputMode?: 'tel' | 'email'
}[] = [
  { id: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
  { id: 'email', label: 'Email', type: 'email', autoComplete: 'email', inputMode: 'email' },
  { id: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', inputMode: 'tel' },
  { id: 'city', label: 'City', type: 'text', autoComplete: 'address-level2' },
]

const EMPTY: Values = { name: '', email: '', phone: '', city: '' }

function validate(values: Values): Errors {
  const errors: Errors = {}
  if (values.name.trim().length < 2) {
    errors.name = 'May we have your name?'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'A valid email, so we may write to you.'
  }
  if (!/^\+?[\d\s().-]{7,}$/.test(values.phone.trim())) {
    errors.phone = 'A number our concierge can reach.'
  }
  if (values.city.trim().length < 2) {
    errors.city = 'Where shall we meet you?'
  }
  return errors
}

export default function BookViewingSection() {
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const timerRef = useRef<number | null>(null)

  const handleChange = (id: FieldId, value: string) => {
    setValues((v) => ({ ...v, [id]: value }))
    // Errors dissolve as soon as the guest starts correcting them.
    if (errors[id]) setErrors((e) => ({ ...e, [id]: undefined }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status !== 'idle') return

    const nextErrors = validate(values)
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors)
      return
    }

    setStatus('submitting')
    // TODO: POST to serverless endpoint (Vercel Function + Resend)
    timerRef.current = window.setTimeout(() => setStatus('success'), 900)
  }

  return (
    <section
      id="viewing"
      className="relative border-t hairline px-6 py-32 md:px-[8vw] md:py-48"
      aria-label="Book a private viewing"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="label-luxe mb-8">By appointment only</p>
        <h2 className="font-display text-5xl font-light leading-[1.05] text-ivory md:text-6xl">
          Book a <span className="italic text-gold">Private Viewing</span>
        </h2>
        <p className="mx-auto mt-8 max-w-md text-sm font-light leading-7 text-ivory/50">
          The ONE is shown in person, in silence, to a few. Leave your
          details and our concierge will reach out.
        </p>

        <div aria-live="polite" className="mt-16 min-h-[22rem]">
          {status === 'success' ? (
            <div className="flex min-h-[22rem] flex-col items-center justify-center">
              <div className="mb-10 h-px w-16 bg-gold/60" />
              <p className="font-display text-2xl font-light italic leading-relaxed text-ivory md:text-3xl">
                Your request has been received.
              </p>
              <p className="mt-4 max-w-sm text-sm font-light leading-7 text-ivory/55">
                Our concierge will contact you.
              </p>
              <p className="label-luxe mt-12 !text-ivory/50">
                Vantera concierge desk
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="grid grid-cols-1 gap-10 text-left sm:grid-cols-2"
            >
              {FIELDS.map((field) => {
                const error = errors[field.id]
                return (
                  <div key={field.id} className="flex flex-col gap-3">
                    <label
                      htmlFor={field.id}
                      className="text-[0.62rem] uppercase tracking-[0.35em] text-ivory/55"
                    >
                      {field.label}
                    </label>
                    <input
                      id={field.id}
                      name={field.id}
                      type={field.type}
                      inputMode={field.inputMode}
                      autoComplete={field.autoComplete}
                      value={values[field.id]}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      disabled={status === 'submitting'}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? `${field.id}-error` : undefined}
                      className={`border-b bg-transparent pb-3 text-base font-light text-ivory outline-none transition-colors duration-700 disabled:opacity-40 ${
                        error
                          ? 'border-gold/80'
                          : 'hairline focus:border-gold/70'
                      }`}
                    />
                    <p
                      id={`${field.id}-error`}
                      role={error ? 'alert' : undefined}
                      className={`min-h-4 text-[0.68rem] font-light italic tracking-wide text-gold/80 transition-opacity duration-500 ${
                        error ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {error ?? ' '}
                    </p>
                  </div>
                )
              })}
              <div className="mt-4 sm:col-span-2 sm:text-center">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="cursor-pointer border border-gold/50 px-14 py-4 text-[0.68rem] uppercase tracking-[0.4em] text-gold transition-colors duration-700 hover:border-gold hover:bg-gold/10 disabled:cursor-wait disabled:border-gold/25 disabled:text-gold/40 disabled:hover:bg-transparent"
                >
                  {status === 'submitting'
                    ? 'Submitting…'
                    : 'Request an invitation'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
