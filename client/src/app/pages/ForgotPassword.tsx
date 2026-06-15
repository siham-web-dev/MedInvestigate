import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { FlaskConical, ArrowLeft, ArrowRight, Mail, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  forgotPassword as forgotPasswordThunk,
  verifyResetCode as verifyResetCodeThunk,
  resetPassword as resetPasswordThunk,
} from '../../store/authSlice';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading: isLoading } = useAppSelector((state) => state.auth);
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      const result = await dispatch(forgotPasswordThunk(email));
      if (forgotPasswordThunk.fulfilled.match(result)) {
        setStep('verify');
        setSuccess('Reset code sent to your email');
      } else if (forgotPasswordThunk.rejected.match(result)) {
        setError(result.payload as string);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset code';
      setError(errorMessage);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    try {
      const result = await dispatch(verifyResetCodeThunk({ email, code }));
      if (verifyResetCodeThunk.fulfilled.match(result)) {
        setStep('reset');
        setSuccess('');
      } else if (verifyResetCodeThunk.rejected.match(result)) {
        setError(result.payload as string);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid verification code';
      setError(errorMessage);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      const result = await dispatch(resetPasswordThunk({ email, code, newPassword: password }));
      if (resetPasswordThunk.fulfilled.match(result)) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } else if (resetPasswordThunk.rejected.match(result)) {
        setError(result.payload as string);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:grid sm:grid-cols-2 bg-background">
      {/* Left side - Branding */}
      <div className="hidden sm:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-6">
            <FlaskConical size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">MedInvestigate</h1>
          <p className="text-blue-100 text-lg">AI-Powered Medical Device Incident Investigation</p>
          <div className="mt-12 p-6 bg-blue-500/20 border border-blue-400/30 rounded-lg">
            <p className="text-blue-50 leading-relaxed">
              We'll help you regain access to your account. Follow the simple steps to reset your password securely.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Password Reset Form */}
      <div className="flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="sm:hidden mb-8 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FlaskConical size={24} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1">Get back into your account</p>
          </div>

          <div className="mb-8 hidden sm:block">
            <h2 className="text-2xl font-bold text-foreground mb-1">Reset your password</h2>
            <p className="text-sm text-muted-foreground">We'll guide you through the process</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs ${
              step === 'email' || step === 'verify' || step === 'reset'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {(step === 'verify' || step === 'reset') ? <Check size={16} /> : '1'}
            </div>
            <div className={`h-1 flex-1 ${(step === 'verify' || step === 'reset') ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs ${
              step === 'verify' || step === 'reset'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {step === 'reset' ? <Check size={16} /> : '2'}
            </div>
            <div className={`h-1 flex-1 ${step === 'reset' ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs ${
              step === 'reset'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}>
              3
            </div>
          </div>

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <Mail className="text-blue-600 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-900">Enter your email</p>
                  <p className="text-xs text-blue-700 mt-0.5">We'll send you a code to verify your identity</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@clinic.org"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    Send Reset Code
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {step === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Verification code sent</p>
                <p className="text-xs text-blue-700 mt-0.5">Check your email for the 6-digit code</p>
                <p className="text-xs text-blue-700 mt-2">Email: <span className="font-mono font-medium">{email}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1.5">Didn't receive the code?{' '}
                  <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">Resend</button>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 py-2.5 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                  <Check size={16} />
                  {success}
                </div>
              )}

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900">Identity verified</p>
                <p className="text-xs text-green-700 mt-0.5">Now create a new password for your account</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1.5">Min. 8 characters, mix of upper/lowercase and numbers</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex-1 py-2.5 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
