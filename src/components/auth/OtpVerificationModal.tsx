import React, { useState, useEffect, useRef } from 'react';
import { Mail, CheckCircle2, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../lib/auth';

interface OtpVerificationModalProps {
  email: string;
  isOpen: boolean;
  onSuccess: () => void;
  onClose?: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  email,
  isOpen,
  onSuccess,
  onClose,
}) => {
  const { verifyOtp, resendOtp } = useAuth();
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 60s cooldown timer countdown
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleanVal[cleanVal.length - 1];
    setOtpDigits(updated);

    // Auto-focus next input field
    if (index < 5 && cleanVal) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pastedData.length >= 6) {
      const digits = pastedData.slice(0, 6).split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsVerifying(true);

    try {
      const res = await verifyOtp(email, fullOtp);
      if (res.success) {
        setSuccessMsg('Email verified successfully!');
        setTimeout(() => {
          onSuccess();
        }, 800);
      } else {
        setError(res.error || 'Verification failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await resendOtp(email);
      if (res.success) {
        setSuccessMsg('A new OTP code has been sent to your email.');
        setCooldown(60);
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(res.error || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-surface-elevated border border-white/20 shadow-2xl text-white">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-xl mb-3 border border-white/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">Verify Your Email</h3>
          <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
            We have sent a 6-digit OTP code to{' '}
            <span className="font-extrabold text-emerald-300 underline">{email}</span>
          </p>

          <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-[11px] font-medium leading-normal flex items-start gap-2 text-left w-full">
            <span className="text-amber-300 font-bold shrink-0">💡 Tip:</span>
            <span>Please check your <strong>Inbox</strong>, <strong>Spam / Junk</strong>, or <strong>Promotions</strong> folder if the email does not appear immediately.</span>
          </div>
        </div>


        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-white text-xs font-bold text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6 Digit Inputs */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"

                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black text-white glass-input rounded-2xl border border-white/20 focus:border-emerald-400 focus:bg-emerald-950/30 transition-all outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isVerifying || otpDigits.join('').length !== 6}
            className="w-full py-3.5 px-6 rounded-2xl glass-btn-primary text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 shadow-lg"
          >
            {isVerifying ? (
              <span>Verifying Code...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Verify & Continue</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
          <span>Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className={`font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              cooldown > 0 || isResending
                ? 'text-white/40 cursor-not-allowed'
                : 'text-emerald-300 hover:text-emerald-200 underline'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>
              {cooldown > 0 ? `Resend in ${cooldown}s` : isResending ? 'Sending...' : 'Resend OTP'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
