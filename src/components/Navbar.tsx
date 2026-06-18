'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FileText, UserCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [activeUser, setActiveUser] = useState<{name: string, email: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const updateAuth = () => {
      const storedUserId = localStorage.getItem('mockUserId');
      const storedUserName = localStorage.getItem('mockUserName');
      const storedUserEmail = localStorage.getItem('mockUserEmail');
      
      if (storedUserId && storedUserName && storedUserEmail) {
        setActiveUser({ name: storedUserName, email: storedUserEmail });
      } else {
        setActiveUser(null);
      }
    };

    updateAuth();
    window.addEventListener('storage', updateAuth);
    return () => window.removeEventListener('storage', updateAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mockUserId');
    localStorage.removeItem('mockUserName');
    localStorage.removeItem('mockUserEmail');
    setActiveUser(null);
    window.dispatchEvent(new Event('storage'));
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-zinc-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <Link href="/" className="flex items-center gap-2 text-zinc-900 hover:opacity-80 transition-opacity">
        <div className="bg-zinc-900 text-white p-1.5 rounded-md">
          <FileText size={20} />
        </div>
        <span className="font-semibold text-lg tracking-tight">Ajaia Docs</span>
      </Link>

      {activeUser && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-zinc-600">
            <UserCircle size={18} />
            <span className="font-medium hidden sm:inline">{activeUser.name}</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-zinc-500 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}
