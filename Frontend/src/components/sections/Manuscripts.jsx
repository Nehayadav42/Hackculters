
import OcrViewer from '../OcrViewer.jsx';

export default function Manuscripts() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f5f6', padding: '40px', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '30px' }}>
                    <p style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#bf6548', fontWeight: 'bold' }}>
                        DIGITAL HERITAGE WORKSPACE
                    </p>
                    <h1 style={{ fontFamily: 'serif', fontSize: '2.5rem', color: '#1a2c3b', marginTop: '5px' }}>
                        Manuscript OCR & Translation Hub
                    </h1>
                    <p style={{ color: '#66727d', marginTop: '10px', fontSize: '1rem' }}>
                        Upload historical archives, images, or documents. Our local AI pipeline extracts text via PaddleOCR, translates via deep-translator, and provides Roman transliteration.
                    </p>
                </div>

                {/* This mounts your real AI processing pipeline */}
                <OcrViewer />
            </div>
        </div>
    );
}