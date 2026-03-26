'use client';

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '@/core/api/client';
import { 
    FiUpload, FiFile, FiTrash2, FiDownload, FiEye, 
    FiFileText, FiImage, FiX, FiCheck, FiLoader, FiAlertCircle 
} from 'react-icons/fi';

interface Document {
    _id: string;
    name: string;
    fileUrl: string;
    fileType: string;
    size: number;
    createdAt: string;
    uploadedBy: {
        name: string;
    };
}

interface DocumentManagerProps {
    relatedTo: 'Customer' | 'Deal' | 'Contract';
    relatedId: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ relatedTo, relatedId }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/documents/${relatedId}`);
            setDocuments(response.data);
        } catch (err) {
            console.error('Failed to fetch documents', err);
            setError('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (relatedId) fetchDocuments();
    }, [relatedId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('File size exceeds 5MB limit');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('relatedTo', relatedTo);
        formData.append('relatedId', relatedId);
        formData.append('name', file.name);

        try {
            setUploading(true);
            setError('');
            await apiClient.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchDocuments();
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await apiClient.delete(`/documents/${id}`);
            setDocuments(prev => prev.filter(doc => doc._id !== id));
        } catch (err) {
            setError('Failed to delete document');
        }
    };

    const getFileIcon = (type: string) => {
        const t = type.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(t)) return <FiImage className="text-blue-500" />;
        if (t === 'pdf') return <FiFileText className="text-red-500" />;
        return <FiFile className="text-gray-500" />;
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handlePreview = (doc: Document) => {
        const fullUrl = `http://localhost:5001${doc.fileUrl}`;
        setPreviewUrl(fullUrl);
        setPreviewType(doc.fileType.toLowerCase());
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full font-sans">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <FiFileText className="text-brand-primary" />
                    Documents
                </h3>
                <div className="flex items-center gap-3">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-brand-primary text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
                    >
                        {uploading ? <FiLoader className="animate-spin" /> : <FiUpload />}
                        Upload
                    </button>
                </div>
            </div>

            {error && (
                <div className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold flex items-center gap-2">
                    <FiAlertCircle /> {error}
                    <button onClick={() => setError('')} className="ml-auto"><FiX /></button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                {loading ? (
                    <div className="flex justify-center items-center h-32 text-gray-400 text-sm">Loading documents...</div>
                ) : documents.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-32 text-gray-400 text-sm italic">
                        <FiFile size={32} className="mb-2 opacity-20" />
                        No documents uploaded yet
                    </div>
                ) : (
                    documents.map(doc => (
                        <div key={doc._id} className="group p-3 border border-gray-100 rounded-xl hover:border-brand-primary/30 hover:bg-brand-primary-light/5 transition-all flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xl">
                                {getFileIcon(doc.fileType)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-800 text-sm truncate">{doc.name}</h4>
                                <p className="text-[10px] text-gray-400 font-medium">
                                    {formatSize(doc.size)} • {new Date(doc.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handlePreview(doc)}
                                    className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-primary-light/10 rounded-lg transition-colors"
                                    title="Preview"
                                >
                                    <FiEye />
                                </button>
                                <a 
                                    href={`http://localhost:5001${doc.fileUrl}`} 
                                    download 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Download"
                                >
                                    <FiDownload />
                                </a>
                                <button 
                                    onClick={() => handleDelete(doc._id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-10">
                    <div className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
                        <button 
                            onClick={() => {setPreviewUrl(null); setPreviewType(null);}}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                        
                        <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
                            {['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(previewType || '') ? (
                                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded shadow-lg" />
                            ) : previewType === 'pdf' ? (
                                <iframe src={previewUrl} className="w-full h-full border-none" title="PDF Preview" />
                            ) : (
                                <div className="text-center">
                                    <FiFile size={64} className="mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-700">Preview not available</h3>
                                    <p className="text-gray-500">Please download the file to view it.</p>
                                    <a 
                                        href={previewUrl} 
                                        download 
                                        className="mt-4 inline-block bg-brand-primary text-white px-6 py-2 rounded-lg font-bold"
                                    >
                                        Download Now
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentManager;
