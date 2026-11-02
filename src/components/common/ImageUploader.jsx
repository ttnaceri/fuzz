import { useState } from 'react';
import { api } from '../services/api.js';
import { config } from '../config/config.js';
import useToast from '../hooks/useToast.js';

export default function ImageUploader({ value, onChange, label = "Rasm yuklash" }) {
  const [uploading, setUploading] = useState(false);
  const { error: toastError, success } = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      return toastError("Rasm hajmi 1MB dan oshmasligi kerak!");
    }

    setUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        const base64String = reader.result.split(',')[1];
        const res = await api.post('/api/upload', {
          base64: base64String,
          mimeType: file.type
        });
        
        const fullUrl = `${config.apiBaseUrl}${res.url}`;
        onChange(fullUrl);
        success("Rasm muvaffaqiyatli yuklandi!");
      } catch (err) {
        toastError("Rasm yuklashda xatolik: " + (err.message || "Server xatosi"));
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>{label}</label>
      
      {value && (
        <div style={{ marginBottom: '0.5rem', position: 'relative', display: 'inline-block' }}>
          <img src={value} alt="Preview" style={{ height: '80px', borderRadius: '4px', border: '1px solid #48201a' }} />
          <button onClick={() => onChange('')} style={{ position: 'absolute', top: -5, right: -5, background: '#ed5555', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}>✖</button>
        </div>
      )}

      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} style={{ display: 'block', color: '#b9a6a2', fontSize: '0.9rem' }} />
      
      {uploading && <span style={{ color: '#f0b44d', fontSize: '0.8rem', marginLeft: '0.5rem' }}>Yuklanmoqda...</span>}
    </div>
  );
}