'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Plus, Upload, MoreVertical, Users, Search } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface DocSummary {
  _id: string;
  title: string;
  updatedAt: string;
  ownerId?: { name: string };
}

export default function Dashboard() {
  const [ownedDocs, setOwnedDocs] = useState<DocSummary[]>([]);
  const [sharedDocs, setSharedDocs] = useState<DocSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    setLoading(true);
    const userId = localStorage.getItem('mockUserId');
    if (!userId) return;

    try {
      const res = await fetch('/api/docs', {
        headers: { 'x-mock-user-id': userId },
      });
      if (res.ok) {
        const data = await res.json();
        setOwnedDocs(data.owned);
        setSharedDocs(data.shared);
      } else {
        toast.error('Failed to fetch documents');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('mockUserId');
    if (!userId) {
      router.push('/login');
      return;
    }
    fetchDocs();
  }, [router]);

  const handleCreateNew = async () => {
    const userId = localStorage.getItem('mockUserId');
    if (!userId) return;

    try {
      const res = await fetch('/api/docs', {
        method: 'POST',
        headers: {
          'x-mock-user-id': userId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Untitled Document', content: '<p></p>' }),
      });
      
      if (res.ok) {
        const data = await res.json();
        router.push(`/doc/${data._id}`);
      } else {
        toast.error('Failed to create document');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to create document');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userId = localStorage.getItem('mockUserId');
    if (!userId) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-mock-user-id': userId,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/doc/${data.docId}`);
        toast.success('Document uploaded successfully');
      } else {
        const err = await res.json();
        toast.error(`Upload failed: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Upload failed');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const DocCard = ({ doc, isShared }: { doc: DocSummary, isShared?: boolean }) => (
    <Link href={`/doc/${doc._id}`} className="group block bg-white border border-zinc-200 rounded-lg p-4 hover:shadow-md transition-shadow hover:border-zinc-300">
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-zinc-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
              {doc.title || 'Untitled Document'}
            </h3>
          </div>
          {isShared && doc.ownerId && (
            <p className="text-xs text-zinc-500 mt-1.5 flex items-center gap-1">
              <Users size={12} />
              Shared by {doc.ownerId.name}
            </p>
          )}
        </div>
        <p className="text-xs text-zinc-400 mt-4">
          Opened {format(new Date(doc.updatedAt), 'MMM d, yyyy')}
        </p>
      </div>
    </Link>
  );

  const filteredOwned = ownedDocs.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredShared = sharedDocs.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto w-full p-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Start a new document</h1>
          <p className="text-zinc-500 mt-1">Create a blank document or upload a file.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus size={18} />
            Blank Document
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-700 px-4 py-2 rounded-md font-medium transition-colors shadow-sm w-full sm:w-auto"
          >
            <Upload size={18} />
            Upload (.txt, .md)
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.docx"
            className="hidden"
          />
        </div>
      </header>

      <div className="mb-8 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-zinc-400" />
        </div>
        <input
          type="text"
          placeholder="Search documents by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow bg-white text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-200 pb-2">
              <h2 className="text-lg font-semibold text-zinc-800">My Documents</h2>
              {searchQuery && <span className="bg-zinc-100 text-zinc-600 text-xs font-medium px-2 py-0.5 rounded-full">{filteredOwned.length}</span>}
            </div>
            {filteredOwned.length === 0 ? (
              <p className="text-zinc-500 italic py-4">{searchQuery ? 'No documents match your search.' : 'No documents yet. Create one to get started.'}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredOwned.map((doc) => (
                  <DocCard key={doc._id} doc={doc} />
                ))}
              </div>
            )}
          </section>

          {filteredShared.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 border-b border-zinc-200 pb-2">
                <Users size={20} className="text-zinc-500" />
                <h2 className="text-lg font-semibold text-zinc-800">Shared with me</h2>
                {searchQuery && <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">{filteredShared.length}</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredShared.map((doc) => (
                  <DocCard key={doc._id} doc={doc} isShared />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
