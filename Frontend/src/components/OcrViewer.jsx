
import React, { useState } from 'react';

export default function OcrViewer({ siteId }) {
    const [file, setFile] = useState(null);
    const [language, setLanguage] = useState('hindi');
    const [docType, setDocType] = useState('auto');
    const [targetLang, setTargetLang] = useState('en');

    const [loading, setLoading] = useState(false);
    const [ocrResult, setOcrResult] = useState(null);
    const [editableText, setEditableText] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            setFile(selectedFile);
            setOcrResult(null);
            setEditableText('');
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

        // Source language
        formData.append('language', language);
        formData.append('source_language', language);

        // Translation language
        formData.append('output_language', targetLang);

        // Document type
        formData.append('document_type', docType);

        if (siteId) {
            formData.append('site_id', siteId);
        }

        try {
            const response = await fetch(
                'http://localhost:5000/api/v1/ai/ocr',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Failed to process document.'
                );
            }

            if (result.success) {
                setOcrResult(result.data);
                setEditableText(result.data.ocr_text || '');
            } else {
                setError(
                    result.message || 'Failed to process document OCR.'
                );
            }
        } catch (err) {
            console.error('OCR Error:', err);

            setError(
                err.message || 'Server error connecting to backend OCR API.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(editableText);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            setError('Unable to copy text. Please copy it manually.');
        }
    };

    return (
        <div
            style={{
                padding: '20px',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                borderRadius: '8px',
            }}
        >
            <h2>Digital Heritage Manuscript OCR Processor</h2>

            {/* Control Panel */}
            <div
                style={{
                    display: 'flex',
                    gap: '15px',
                    marginBottom: '20px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}
            >
                {/* File Upload */}
                <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.docx,.txt"
                    onChange={handleFileChange}
                    style={{ color: '#fff' }}
                />

                {/* Source Language */}
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                        padding: '8px',
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #555',
                    }}
                >
                    <option value="hindi">Hindi (Devanagari)</option>
                    <option value="sanskrit">Sanskrit</option>
                    <option value="marathi">Marathi</option>
                    <option value="gujarati">Gujarati</option>
                    <option value="bengali">Bengali</option>
                    <option value="english">English</option>
                </select>

                {/* Document Type */}
                <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    style={{
                        padding: '8px',
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #555',
                    }}
                >
                    <option value="auto">Auto-Detect / Printed</option>
                    <option value="handwritten">
                        Handwritten (Google Vision)
                    </option>
                </select>

                {/* Output / Translation Language */}
                <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    style={{
                        padding: '8px',
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #555',
                    }}
                >
                    <option value="en">Translate to English</option>
                    <option value="hi">Translate to Hindi</option>
                    <option value="mr">Translate to Marathi</option>
                </select>

                {/* Extract Button */}
                <button
                    onClick={handleUploadAndExtract}
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        background: '#e0a96d',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading
                        ? 'Preprocessing & Extracting...'
                        : 'Extract Text'}
                </button>
            </div>

            {file && (
                <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                    Selected file: {file.name}
                </p>
            )}

            {error && (
                <p style={{ color: '#ff6b6b' }}>{error}</p>
            )}

            {/* OCR Results */}
            {ocrResult && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '20px',
                        marginTop: '20px',
                    }}
                >
                    {/* Original Document Preview */}
                    <div
                        style={{
                            border: '1px solid #444',
                            padding: '10px',
                            borderRadius: '4px',
                        }}
                    >
                        <h3>Original Archival Document</h3>

                        {ocrResult.file_type?.includes('image') ? (
                            <img
                                src={ocrResult.file_path}
                                alt="Document preview"
                                style={{
                                    width: '100%',
                                    maxHeight: '450px',
                                    objectFit: 'contain',
                                }}
                            />
                        ) : (
                            <iframe
                                src={ocrResult.file_path}
                                title="Document Preview"
                                style={{
                                    width: '100%',
                                    height: '450px',
                                    border: 'none',
                                }}
                            />
                        )}

                        <div
                            style={{
                                marginTop: '10px',
                                fontSize: '0.85rem',
                                color: '#aaa',
                            }}
                        >
                            <p>
                                Engine:{' '}
                                <strong>{ocrResult.ocr_engine || 'N/A'}</strong>
                            </p>

                            <p>
                                Confidence Score:{' '}
                                <strong>
                                    {typeof ocrResult.confidence_score === 'number'
                                        ? `${(ocrResult.confidence_score * 100).toFixed(1)}%`
                                        : 'N/A'}
                                </strong>
                            </p>
                        </div>
                    </div>

                    {/* Extracted Text */}
                    <div
                        style={{
                            border: '1px solid #444',
                            padding: '10px',
                            borderRadius: '4px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            <h3>
                                Extracted Text ({ocrResult.language || language})
                            </h3>

                            <button
                                onClick={handleCopy}
                                style={{
                                    padding: '4px 8px',
                                    background: '#444',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                {copied ? 'Copied!' : 'Copy Text'}
                            </button>
                        </div>

                        <textarea
                            value={editableText}
                            onChange={(e) =>
                                setEditableText(e.target.value)
                            }
                            rows={18}
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                background: '#222',
                                color: '#4af626',
                                padding: '10px',
                                fontFamily: 'monospace',
                                border: '1px solid #555',
                            }}
                        />

                        {/* Translated Text */}
                        {ocrResult.translated_text && (
                            <>
                                <h3>
                                    Translated Text ({targetLang})
                                </h3>

                                <textarea
                                    value={ocrResult.translated_text}
                                    readOnly
                                    rows={10}
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        background: '#222',
                                        color: '#fff',
                                        padding: '10px',
                                        fontFamily: 'monospace',
                                        border: '1px solid #555',
                                    }}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
