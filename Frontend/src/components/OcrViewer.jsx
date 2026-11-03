import React, { useState } from 'react';

export default function OcrViewer({ siteId }) {
    const [file, setFile] = useState(null);
    const [language, setLanguage] = useState('hindi');
    const [loading, setLoading] = useState(false);
    const [ocrResult, setOcrResult] = useState(null);
    const [editableText, setEditableText] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUploadAndExtract = async () => {
        if (!file) {
            setError('Please select an image or document file.');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('document', file);
        formData.append('language', language);
        if (siteId) formData.append('site_id', siteId);

        try {
            const response = await fetch('http://localhost:5000/api/v1/ai/ocr', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setOcrResult(result.data);
                setEditableText(result.data.ocr_text);
            } else {
                setError(result.message || 'Failed to process document OCR.');
            }
        } catch (err) {
            setError('Server error connecting to backend OCR API.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(editableText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: '#fff', borderRadius: '8px' }}>
            <h2>Digital Heritage Manuscript OCR Processor</h2>
            
            {/* Control Panel */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.pdf,.docx,.txt" 
                    onChange={handleFileChange}
                    style={{ color: '#fff' }}
                />

                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ padding: '8px', background: '#333', color: '#fff', border: '1px solid #555' }}
                >
                    <option value="hindi">Hindi (Devanagari)</option>
                    <option value="sanskrit">Sanskrit</option>
                    <option value="marathi">Marathi</option>
                    <option value="gujarati">Gujarati</option>
                    <option value="bengali">Bengali</option>
                    <option value="english">English</option>
                </select>

                <button 
                    onClick={handleUploadAndExtract} 
                    disabled={loading}
                    style={{ padding: '8px 16px', background: '#e0a96d', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {loading ? 'Preprocessing & Extracting...' : 'Extract Text'}
                </button>
            </div>

            {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}

            {/* Split Screen View */}
            {ocrResult && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                    {/* Left: Original Document Preview */}
                    <div style={{ border: '1px solid #444', padding: '10px', borderRadius: '4px' }}>
                        <h3>Original Archival Document</h3>
                        {ocrResult.file_type.includes('image') ? (
                            <img 
                                src={ocrResult.file_path} 
                                alt="Document preview" 
                                style={{ width: '100%', maxHeight: '450px', objectFit: 'contain' }} 
                            />
                        ) : (
                            <iframe 
                                src={ocrResult.file_path} 
                                title="Document PDF Preview" 
                                style={{ width: '100%', height: '450px', border: 'none' }}
                            />
                        )}
                        <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#aaa' }}>
                            <p>Engine: <strong>{ocrResult.ocr_engine}</strong></p>
                            <p>Confidence Score: <strong>{(ocrResult.confidence_score * 100).toFixed(1)}%</strong></p>
                        </div>
                    </div>

                    {/* Right: Editable Extracted Text */}
                    <div style={{ border: '1px solid #444', padding: '10px', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Extracted Text ({ocrResult.language})</h3>
                            <button onClick={handleCopy} style={{ padding: '4px 8px', background: '#444', color: '#fff', border: 'none', cursor: 'pointer' }}>
                                {copied ? 'Copied!' : 'Copy Text'}
                            </button>
                        </div>
                        <textarea 
                            value={editableText} 
                            onChange={(e) => setEditableText(e.target.value)}
                            rows={18}
                            style={{ width: '100%', background: '#222', color: '#4af626', padding: '10px', fontFamily: 'monospace', border: '1px solid #555' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}