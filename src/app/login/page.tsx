'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, ArrowRight, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('mockUserId', data.user._id);
        localStorage.setItem('mockUserName', data.user.name);
        localStorage.setItem('mockUserEmail', data.user.email);
        
        // Dispatch storage event to update Navbar
        window.dispatchEvent(new Event('storage'));
        
        toast.success(`Welcome back, ${data.user.name}!`);
        router.push('/');
      } else {
        const err = await res.json();
        toast.error(`Login failed: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
        <div className="flex flex-col items-center">
          <div className="bg-zinc-900 text-white p-3 rounded-lg mb-4">
            <FileText size={32} />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-zinc-900">
            Sign in to Ajaia Docs
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600">
            Use seeded accounts: <br />
            <span className="font-semibold">alice@example.com</span> or <span className="font-semibold">bob@example.com</span>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-zinc-300 placeholder-zinc-500 text-zinc-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
