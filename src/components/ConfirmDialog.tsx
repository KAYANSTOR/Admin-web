import React, { useState, useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  requireInput?: boolean;
  inputType?: 'text' | 'number';
  inputPlaceholder?: string;
  defaultValue?: string;
  expectedInput?: string; 
  onConfirm: (inputValue: string) => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  danger = false,
  requireInput = false,
  inputType = 'text',
  inputPlaceholder = '',
  defaultValue = '',
  expectedInput,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (expectedInput && inputValue !== expectedInput) {
      return; 
    }
    onConfirm(inputValue);
  };

  const isConfirmDisabled = expectedInput ? inputValue !== expectedInput : false;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 shadow-xl">
        <h2 className={`text-[18px] font-black mb-2 ${danger ? 'text-red-600' : 'text-primary-dark'}`}>
          {title}
        </h2>
        <p className="text-[14px] text-gray-600 mb-5 leading-relaxed">{message}</p>
        
        {requireInput && (
          <input
            type={inputType}
            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl mb-5 outline-none focus:border-primary text-[14px]"
            placeholder={inputPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        )}

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`flex-1 py-3.5 rounded-xl font-bold text-[15px] text-white disabled:opacity-50 transition-colors ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl font-bold text-[15px] bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
