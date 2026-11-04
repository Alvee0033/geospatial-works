'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertOptions {
  title?: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertModalContextType {
  showAlert: (options: AlertOptions | string, type?: AlertType) => Promise<boolean>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
}

const AlertModalContext = createContext<AlertModalContextType | null>(null);

export function useAlertModal() {
  const context = useContext(AlertModalContext);
  if (!context) {
    throw new Error('useAlertModal must be used within an AlertModalProvider');
  }
  return context;
}

// Global dispatcher for non-hook callers if needed
let globalShowAlert: ((options: AlertOptions | string, type?: AlertType) => Promise<boolean>) | null = null;
let globalShowConfirm: ((message: string, title?: string) => Promise<boolean>) | null = null;

export const CenterAlert = {
  success: (message: string, title = 'Success') => globalShowAlert ? globalShowAlert({ title, message, type: 'success' }) : Promise.resolve(true),
  error: (message: string, title = 'Error') => globalShowAlert ? globalShowAlert({ title, message, type: 'error' }) : Promise.resolve(true),
  warning: (message: string, title = 'Warning') => globalShowAlert ? globalShowAlert({ title, message, type: 'warning' }) : Promise.resolve(true),
  info: (message: string, title = 'Information') => globalShowAlert ? globalShowAlert({ title, message, type: 'info' }) : Promise.resolve(true),
  confirm: (message: string, title = 'Please Confirm') => globalShowConfirm ? globalShowConfirm(message, title) : Promise.resolve(false),
};

export function AlertModalProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
    confirmText: string;
    cancelText?: string;
    resolve?: (value: boolean) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Done',
  });

  const showAlert = useCallback((options: AlertOptions | string, fallbackType: AlertType = 'info'): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof options === 'string') {
        const title =
          fallbackType === 'success'
            ? 'Success'
            : fallbackType === 'error'
            ? 'Action Failed'
            : fallbackType === 'warning'
            ? 'Attention Required'
            : 'Notice';

        setModalState({
          isOpen: true,
          title,
          message: options,
          type: fallbackType,
          confirmText: 'Done',
          resolve,
        });
      } else {
        const type = options.type || fallbackType;
        const defaultTitle =
          type === 'success'
            ? 'Success'
            : type === 'error'
            ? 'Action Failed'
            : type === 'warning'
            ? 'Attention Required'
            : 'Notice';

        setModalState({
          isOpen: true,
          title: options.title || defaultTitle,
          message: options.message,
          type,
          confirmText: options.confirmText || 'Done',
          cancelText: options.cancelText,
          resolve,
        });
      }
    });
  }, []);

  const showConfirm = useCallback((message: string, title = 'Please Confirm'): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type: 'warning',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        resolve,
      });
    });
  }, []);

  useEffect(() => {
    globalShowAlert = showAlert;
    globalShowConfirm = showConfirm;
    return () => {
      globalShowAlert = null;
      globalShowConfirm = null;
    };
  }, [showAlert, showConfirm]);

  const handleConfirm = () => {
    modalState.resolve?.(true);
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    modalState.resolve?.(false);
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const getTheme = () => {
    switch (modalState.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="h-7 w-7 text-emerald-600" />,
          iconBg: 'bg-emerald-50 border-emerald-200 ring-4 ring-emerald-50/60',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30',
        };
      case 'error':
        return {
          icon: <XCircle className="h-7 w-7 text-rose-600" />,
          iconBg: 'bg-rose-50 border-rose-200 ring-4 ring-rose-50/60',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-7 w-7 text-amber-600" />,
          iconBg: 'bg-amber-50 border-amber-200 ring-4 ring-amber-50/60',
          confirmBtn: 'bg-[#10241E] hover:bg-slate-900 text-white shadow-sm',
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-7 w-7 text-sky-600" />,
          iconBg: 'bg-sky-50 border-sky-200 ring-4 ring-sky-50/60',
          confirmBtn: 'bg-[#10241E] hover:bg-slate-900 text-white shadow-sm',
        };
    }
  };

  const theme = getTheme();

  return (
    <AlertModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {modalState.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={modalState.cancelText ? handleCancel : handleConfirm}
          />

          {/* Centered Modal Card */}
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl transition-all border border-slate-200/90 animate-in zoom-in-95 duration-200">
            {/* Close Icon Top-Right */}
            <button
              type="button"
              onClick={handleCancel}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Centered Icon */}
            <div className="mx-auto flex items-center justify-center">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${theme.iconBg} transition-transform duration-200 scale-100`}>
                {theme.icon}
              </div>
            </div>

            {/* Title & Message */}
            <div className="mt-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {modalState.title}
              </h3>
              <div className="mt-2 text-sm text-slate-600 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap px-1">
                {modalState.message}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-center gap-3">
              {modalState.cancelText && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all focus:outline-none"
                >
                  {modalState.cancelText}
                </button>
              )}
              <button
                type="button"
                autoFocus
                onClick={handleConfirm}
                className={`flex-1 rounded-xl px-5 py-2.5 text-xs font-bold tracking-wide transition-all focus:outline-none active:scale-[0.98] ${theme.confirmBtn}`}
              >
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertModalContext.Provider>
  );
}
