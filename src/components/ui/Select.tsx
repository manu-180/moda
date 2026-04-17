'use client'

import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
  id?: string
}

export default function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar…',
  error,
  className,
  id,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(!open)
    }
  }

  return (
    <div ref={ref} className={cn('relative w-full', className)}>
      {label && (
        <span className="block text-[10px] uppercase tracking-[0.1em] text-warm-gray font-body mb-1">
          {label}
        </span>
      )}
      <button
        type="button"
        id={id}
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex w-full items-center justify-between pb-2 pt-1 font-body text-[14px]',
          'border-b transition-colors duration-300 ease-luxury',
          'focus:outline-none',
          error ? 'border-muted-red' : open ? 'border-charcoal' : 'border-pale-gray',
          selected ? 'text-charcoal' : 'text-warm-gray'
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={!!error}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <ChevronDown className="h-4 w-4 text-warm-gray" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute z-50 mt-1 w-full border border-pale-gray bg-white py-1"
            role="listbox"
          >
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange?.(option.value)
                  setOpen(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onChange?.(option.value)
                    setOpen(false)
                  }
                }}
                tabIndex={0}
                role="option"
                aria-selected={value === option.value}
                className={cn(
                  'cursor-pointer px-4 py-2.5 font-body text-[13px] transition-colors duration-200',
                  value === option.value
                    ? 'bg-cream text-charcoal'
                    : 'text-dark-gray hover:bg-ivory'
                )}
              >
                {option.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-1.5 font-body text-[12px] text-muted-red" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
