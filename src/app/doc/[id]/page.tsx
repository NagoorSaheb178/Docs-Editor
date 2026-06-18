'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@/components/Editor';
import { ArrowLeft, Save, Share2, Check, AlertCircle, Cloud, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
import toast from 'react-hot-toast';

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Share dialog state
  const [showShare, setShowShare] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareStatus, setShareStatus] = useState('');

  const fetchDoc = useCallback(async () => {
    const userId = localStorage.getItem('mockUserId');
    if (!userId) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`/api/docs/${unwrappedParams.id}`, {
        headers: { 'x-mock-user-id': userId },
      });
      
      if (res.ok) {
        const data = await res.json();
        setDoc(data);
        setTitle(data.title);
        setContent(data.content);
      } else {
        toast.error('Document not found or access denied');
        router.push('/');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load document');
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [unwrappedParams.id, router]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  // Debounced auto-save could go here, but for simplicity, we'll implement a manual save button 
  // and a simple hook that saves every few seconds if there are changes.
  useEffect(() => {
    if (!doc || (title === doc.title && content === doc.content)) return;

    const timer = setTimeout(() => {
      saveDoc();
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content, doc]);

  const saveDoc = async () => {
    setSaving(true);
    setSaveStatus('saving');
    const userId = localStorage.getItem('mockUserId');
    
    try {
      const res = await fetch(`/api/docs/${unwrappedParams.id}`, {
        method: 'PUT',
        headers: {
          'x-mock-user-id': userId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });
      
      if (res.ok) {
        setSaveStatus('saved');
        setDoc((prev: any) => ({ ...prev, title, content }));
      } else {
        setSaveStatus('error');
        toast.error('Failed to save document');
      }
    } catch (e) {
      setSaveStatus('error');
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('mockUserId');
    
    try {
      const res = await fetch(`/api/docs/${unwrappedParams.id}/share`, {
        method: 'POST',
        headers: {
          'x-mock-user-id': userId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: shareEmail }),
      });
      
      if (res.ok) {
        setShowShare(false);
        setShareEmail('');
        fetchDoc(); // refresh
        toast.success(`Shared with ${shareEmail}`);
      } else {
        const err = await res.json();
        toast.error(`Failed to share: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to share document');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    const userId = localStorage.getItem('mockUserId');
    
    try {
      const res = await fetch(`/api/docs/${unwrappedParams.id}`, {
        method: 'DELETE',
        headers: { 'x-mock-user-id': userId || '' },
      });
      
      if (res.ok) {
        toast.success('Document deleted');
        router.push('/');
      } else {
        toast.error('Failed to delete document');
      }
    } catch (e) {
      toast.error('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doc) return null;

  const isOwner = doc.ownerId._id === localStorage.getItem('mockUserId');

  return (
    <div className="flex flex-col h-full bg-zinc-50 relative">
      <header className="bg-white border-b border-zinc-200 px-3 sm:px-4 py-3 flex items-center justify-between sticky top-[60px] z-10 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Link href="/" className="text-zinc-500 hover:text-zinc-900 transition-colors p-2 hover:bg-zinc-100 rounded-full shrink-0">
            <ArrowLeft size={20} />
          </Link>
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg sm:text-xl font-semibold text-zinc-800 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-100 rounded-md px-1 sm:px-2 py-1 w-full max-w-lg transition-shadow truncate"
            placeholder="Document Title"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center">
            {saveStatus === 'saving' && (
              <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all">
                <Loader2 size={14} className="animate-spin" /> Saving
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all">
                <Cloud size={14} /> Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all">
                <AlertCircle size={14} /> Error saving
              </span>
            )}
          </div>
          
          <button
            onClick={saveDoc}
            className="p-2 text-zinc-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors sm:hidden"
            title="Save"
          >
            <Save size={20} />
          </button>

          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                title="Delete Document"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8">
        <Editor 
          content={content} 
          onChange={(newContent) => setContent(newContent)} 
        />
      </main>

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h2 className="text-lg font-semibold text-zinc-900">Share "{title}"</h2>
            </div>
            <form onSubmit={handleShare} className="p-6">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                User Email to Share With
              </label>
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="e.g. bob@example.com"
                className="w-full border border-zinc-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {shareStatus && (
                <p className={`mt-2 text-sm ${shareStatus.includes('Error') ? 'text-red-600' : 'text-emerald-600'}`}>
                  {shareStatus}
                </p>
              )}
              
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowShare(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Share Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
