import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { NotepadText } from 'lucide-react';
import { Textarea } from '../ui/textarea';

interface TextAreaInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: boolean;
  maxLines?: number;
  maxLength?: number;
}

export const useTextAreaInput = (
  initialValue: string = '',
) => {
  const [textArea, setTextArea] = useState(initialValue);

  const handleTextAreaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextArea(e.target.value);
    },
    [],
  );

  const resetTextArea = useCallback(() => {
    setTextArea('');
  }, []);

  return {
    textArea,
    setTextArea,
    handleTextAreaChange,
    resetTextArea,
  };
};

export const TextAreaInput: React.FC<
  TextAreaInputProps
> = ({
  id = 'textArea',
  name = 'textArea',
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
  label,
  error = false,
  maxLines = 5,
  maxLength = 100,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setTextArea } = useTextAreaInput(value);
  const lineHeight = 24;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let input = e.target.value;

      // Limita ao máximo de caracteres
      if (input.length > maxLength) {
        input = input.slice(0, maxLength);
      }

      // Limita ao máximo de linhas
      const lines = input.split('\n');
      if (lines.length > maxLines) {
        input = lines.slice(0, maxLines).join('\n');
      }

      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: input,
        },
      };

      onChange(syntheticEvent);
      setTextArea(input);
    },
    [onChange, setTextArea, maxLines, maxLength],
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = lineHeight * maxLines;

      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [value, maxLines]);

  const shouldLabelBeOnTop = value.length > 0 || isFocused;

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full">
        <Textarea
          ref={textareaRef}
          id={id}
          name={name}
          placeholder={
            shouldLabelBeOnTop ? placeholder : ''
          }
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          rows={1}
          maxLength={maxLength}
          className={`peer min-h-10 w-full resize-none overflow-y-auto rounded-md bg-transparent py-3 pr-4 pl-11 transition-colors duration-200 focus:ring-0 focus:outline-none focus-visible:ring-gray-300 focus-visible:ring-offset-0 dark:bg-none ${
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-300 focus-visible:border-gray-300 focus-visible:ring-gray-200'
          } ${disabled && 'cursor-not-allowed'} ${className}`}
        />

        <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
          <NotepadText className="h-5 w-5 text-gray-400" />
        </div>

        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-10 cursor-text transition-all duration-200 ${
            shouldLabelBeOnTop
              ? '-top-2 z-10 bg-slate-900 px-1 text-xs'
              : 'top-1/2 -translate-y-1/2 text-sm'
          } ${
            error && shouldLabelBeOnTop
              ? 'text-red-500'
              : shouldLabelBeOnTop
                ? 'text-gray-500'
                : 'text-gray-600'
          }`}
        >
          {label}
        </label>
      </div>
    </div>
  );
};
