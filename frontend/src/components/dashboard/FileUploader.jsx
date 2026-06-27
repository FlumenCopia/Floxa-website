// src/components/dashboard/FileUploader.tsx
// Handles drag-and-drop file uploads to Cloudinary via signed URL
'use client';
import { useState } from 'react';
import { uploadService } from '@/services/uploadService';
export function FileUploader({ folder, onUpload, accept = 'image/*', maxSizeMB = 20, label = 'Upload file', multiple = false, }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    async function uploadFile(file) {
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File too large. Max size: ${maxSizeMB}MB`);
            return;
        }
        setUploading(true);
        setError('');
        setProgress(0);
        try {
            const uploadData = await uploadService.upload(file, folder, setProgress);
            if (!uploadData.success || !uploadData.data) {
                throw new Error(uploadData.error ?? 'Upload failed');
            }
            onUpload({
                url: uploadData.data.url,
                publicId: uploadData.data.publicId ?? '',
                size: uploadData.data.fileSize ?? file.size,
                format: uploadData.data.fileFormat ?? file.type,
            });
            setProgress(100);
        }
        catch (err) {
            setError(err.message ?? 'Upload failed');
        }
        finally {
            setUploading(false);
        }
    }
    const handleFiles = async (files) => {
        if (!files?.length)
            return;
        if (multiple) {
            for (const file of Array.from(files)) {
                await uploadFile(file);
            }
        }
        else {
            await uploadFile(files[0]);
        }
    };
    return (<div>
      <label onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '28px',
            borderRadius: '14px',
            border: `2px dashed ${dragOver ? 'rgba(77,255,160,0.5)' : 'rgba(137,172,160,0.2)'}`,
            background: dragOver ? 'rgba(77,255,160,0.04)' : 'rgba(10,25,18,0.3)',
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all .25s',
        }}>
        <input type="file" accept={accept} multiple={multiple} style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} disabled={uploading}/>
        <div style={{ fontSize: '28px' }}>{uploading ? '⏳' : '📎'}</div>
        <div style={{ fontSize: '13px', color: '#89ACA0', textAlign: 'center' }}>
          {uploading ? `Uploading... ${progress}%` : (<>{label} <br /><span style={{ fontSize: '11px', color: 'rgba(137,172,160,0.5)' }}>Drag & drop or click to browse · Max {maxSizeMB}MB</span></>)}
        </div>
      </label>

      {error && (<div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF8080', fontSize: '12px' }}>
          {error}
        </div>)}

      {progress === 100 && !uploading && (<div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(77,255,160,0.08)', border: '1px solid rgba(77,255,160,0.2)', color: '#4DFFA0', fontSize: '12px' }}>
          Upload complete ✓
        </div>)}
    </div>);
}
