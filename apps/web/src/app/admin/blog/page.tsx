"use client";

import React, { useState, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  X, 
  Check, 
  Image as ImageIcon
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  status: 'published' | 'draft';
}

const initialPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Sub-Centimeter Surveying & SOB Geodetic Network Integration in Bangladesh',
    category: 'Surveying',
    excerpt: 'How RTK GNSS and Total Station networks deliver high-precision boundary demarcation for mega infrastructure projects.',
    content: 'Full article content describing SOB network tie-in procedures, total station setup, and RTK GNSS base station corrections...',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    author: 'Chief Surveyor',
    date: 'Aug 02, 2026',
    status: 'published'
  },
  {
    id: 'post-2',
    title: '1cm/Pixel UAV Drone Mapping: Best Practices for High-Rise & Highway Planning',
    category: 'UAV Drone',
    excerpt: 'Utilizing specialized drones to generate orthomosaic maps, 3D point clouds, and contour surfaces.',
    content: 'Detailed technical guide covering drone flight planning, ground control points (GCPs), and ASPRS accuracy standards...',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800',
    author: 'Drone Specialist',
    date: 'Jul 24, 2026',
    status: 'published'
  },
  {
    id: 'post-3',
    title: 'Mouza Sheet Digitizing: Converting CS, SA, RS & BS Maps into Vector Geodatabases',
    category: 'GIS & Mapping',
    excerpt: 'Superimposing historical land Mouza records over modern satellite orthomosaics for legal land verification.',
    content: 'Step-by-step methodology for digitizing historical Mouza sheets, geo-referencing, and boundary vector alignment...',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
    author: 'GIS Architect',
    date: 'Jul 15, 2026',
    status: 'draft'
  }
];

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);

  const blogImageInputRef = useRef<HTMLInputElement>(null);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleBlogImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingPost) {
      setEditingPost({ ...editingPost, image: URL.createObjectURL(file) });
    }
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    if (isNewPost) {
      setPosts([editingPost, ...posts]);
    } else {
      setPosts(posts.map(p => p.id === editingPost.id ? editingPost : p));
    }

    setEditingPost(null);
  };

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, status: p.status === 'published' ? 'draft' : 'published' } : p));
  };

  const handleOpenCreateModal = () => {
    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      title: '',
      category: 'Surveying',
      excerpt: '',
      content: '',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
      author: 'Admin Team',
      date: 'Today',
      status: 'published'
    };
    setIsNewPost(true);
    setEditingPost(newPost);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Blog & Articles Manager</h1>
          <p className="text-xs text-gray-500 mt-1">Publish news, technical guides, and case studies for clients.</p>
        </div>

        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-1.5 px-4.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
        >
          <Plus size={15} />
          <span>Create New Post</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title or category..." 
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-xs w-full font-medium"
          />
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-gray-900 text-white shadow-xs' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'published' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            Published
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'draft' ? 'bg-gray-700 text-white shadow-xs' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            Drafts
          </button>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-full aspect-[16/9] rounded-xl overflow-hidden relative bg-gray-100 border border-gray-200/60">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${post.status === 'published' ? 'bg-emerald-700 text-white' : 'bg-gray-800 text-gray-200'}`}>
                  {post.status}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-1">{post.category}</span>
                <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{post.title}</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{post.excerpt}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-gray-400 font-medium">{post.date}</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleToggleStatus(post.id)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold rounded-lg transition-colors"
                >
                  {post.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => { setIsNewPost(false); setEditingPost(post); }}
                  className="p-1.5 text-gray-400 hover:text-emerald-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Article Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSavePost} className="bg-white w-full max-w-xl rounded-2xl p-6 border border-gray-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">{isNewPost ? 'Create New Post' : 'Edit Article'}</h3>
              <button type="button" onClick={() => setEditingPost(null)} className="p-1 text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  placeholder="Article title..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold outline-none focus:border-emerald-600"
                />
              </div>

              {/* Cover Image Upload Input */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Cover Image File Upload</label>
                <input
                  type="file"
                  ref={blogImageInputRef}
                  onChange={handleBlogImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center space-x-3">
                  <img src={editingPost.image} alt="Cover Preview" className="w-16 h-10 rounded-lg object-cover border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => blogImageInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl border border-gray-200 transition-colors flex items-center space-x-1.5"
                  >
                    <Upload size={13} />
                    <span>Upload Image File</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Category</label>
                  <select
                    value={editingPost.category}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-emerald-600"
                  >
                    <option value="Surveying">Surveying</option>
                    <option value="UAV Drone">UAV Drone</option>
                    <option value="GIS & Mapping">GIS & Mapping</option>
                    <option value="Valuation">Valuation</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Status</label>
                  <select
                    value={editingPost.status}
                    onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as 'published' | 'draft' })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-emerald-600"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Summary / Excerpt</label>
                <textarea
                  rows={2}
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-emerald-600 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Full Article Text</label>
                <textarea
                  rows={5}
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-emerald-600 resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end space-x-2">
              <button type="button" onClick={() => setEditingPost(null)} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl">Save Article</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
