import { useState } from 'react';
import { z } from 'zod';

interface ValidatedInputProps {
    type: 'text' | 'email' | 'tel' | 'url' | 'number';
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    validation?: z.ZodSchema;
    label?: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
    maxLength?: number;
    min?: number;
    max?: number;
    step?: number;
}

export function ValidatedInput({
    type,
    value,
    onChange,
    onBlur,
    validation,
    label,
    placeholder,
    required = false,
    className = '',
    maxLength,
    min,
    max,
    step,
}: ValidatedInputProps) {
    const [error, setError] = useState('');
    const [touched, setTouched] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        // Clear error on change if previously had error
        if (error && touched) {
            validateValue(newValue);
        }
    };

    const validateValue = (val: string) => {
        if (!validation) {
            setError('');
            return true;
        }

        // Skip validation if field is optional and empty
        if (!required && !val) {
            setError('');
            return true;
        }

        const result = validation.safeParse(val);
        if (!result.success) {
            const errorMessage = result.error.issues[0]?.message || 'Invalid input';
            setError(errorMessage);
            return false;
        }

        setError('');
        return true;
    };

    const handleBlur = () => {
        setTouched(true);
        validateValue(value);
        if (onBlur) {
            onBlur();
        }
    };

    const baseInputClasses = `w-full px-3 py-2 border-2 focus:outline-none focus:ring-2 font-medium transition-colors ${className}`;

    const stateClasses = error && touched
        ? 'border-red-500 focus:border-red-500'
        : '';

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--main-text)' }}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={`${baseInputClasses} ${stateClasses}`}
                maxLength={maxLength}
                min={min}
                max={max}
                step={step}
            />
            {error && touched && (
                <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                    <span>!</span>
                    <span>{error}</span>
                </p>
            )}
        </div>
    );
}
