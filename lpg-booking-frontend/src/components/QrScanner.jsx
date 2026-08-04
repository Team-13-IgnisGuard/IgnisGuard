import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

// Reusable QR input with three modes: live camera, upload a photo of the QR,
// or paste the token text directly. Camera scanning off a screen (phone/monitor)
// is inherently unreliable — glare, motion, refresh-rate flicker — so the upload
// and paste options exist as reliable fallbacks for a live demo.
const QrScanner = ({ onScan, onError, active = true }) => {
  const containerId = 'qr-scanner-region';
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('camera'); // camera, upload, paste
  const [pastedToken, setPastedToken] = useState('');
  const [uploadBusy, setUploadBusy] = useState(false);

  useEffect(() => {
    if (!active || mode !== 'camera') return;

    let cancelled = false;
    const scanner = new Html5Qrcode(containerId);

    const startPromise = scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      (decodedText) => {
        if (!cancelled) onScan(decodedText);
      },
      () => {
        // fired continuously while no QR is in frame — ignore, not a real error
      }
    ).catch((err) => {
      if (!cancelled && onError) onError('Could not access camera: ' + err);
    });

    return () => {
      cancelled = true;
      // Wait for start() to actually settle before stopping — in React
      // StrictMode (dev only) this effect runs twice in quick succession;
      // stopping too early (before the camera has finished initializing)
      // leaves the first camera instance orphaned and running, which is
      // what causes a second/duplicate video feed to appear on remount.
      startPromise
        .then(() => scanner.stop())
        .catch(() => {})
        .then(() => scanner.clear())
        .catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, mode]);

  if (!active) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadBusy(true);
    try {
      const scanner = new Html5Qrcode(containerId);
      const decodedText = await scanner.scanFile(file, false);
      onScan(decodedText);
    } catch (err) {
      if (onError) onError("Couldn't read a QR code from that image — try a clearer photo, or use Paste instead.");
    } finally {
      setUploadBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasteSubmit = (e) => {
    e.preventDefault();
    if (pastedToken.trim()) onScan(pastedToken.trim());
  };

  return (
    <div>
      <div className="d-flex gap-2 mb-2">
        <button type="button" className={`btn btn-sm rounded-pill px-3 ${mode === 'camera' ? 'btn-gradient-primary' : 'btn-outline-secondary'}`} onClick={() => setMode('camera')}>
          <i className="bi bi-camera-fill me-1"></i>Camera
        </button>
        <button type="button" className={`btn btn-sm rounded-pill px-3 ${mode === 'upload' ? 'btn-gradient-primary' : 'btn-outline-secondary'}`} onClick={() => setMode('upload')}>
          <i className="bi bi-upload me-1"></i>Upload image
        </button>
        <button type="button" className={`btn btn-sm rounded-pill px-3 ${mode === 'paste' ? 'btn-gradient-primary' : 'btn-outline-secondary'}`} onClick={() => setMode('paste')}>
          <i className="bi bi-clipboard me-1"></i>Paste
        </button>
      </div>

      {mode === 'camera' && (
        <>
          <div id={containerId} style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }} />
          <p className="text-secondary small text-center mt-2 mb-0">
            Point the camera at the cylinder's QR code
          </p>
        </>
      )}

      {mode === 'upload' && (
        <div className="text-center py-3">
          <div id={containerId} style={{ display: 'none' }} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={uploadBusy}
          />
          <button
            type="button"
            className="btn btn-gradient-secondary btn-sm rounded-pill px-4"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadBusy}
          >
            {uploadBusy ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-file-earmark-image me-1"></i>Choose an image</>}
          </button>
          <p className="text-secondary small mt-2 mb-0">
            {uploadBusy ? 'Reading QR code…' : "Upload a screenshot or photo of the cylinder's QR"}
          </p>
        </div>
      )}

      {mode === 'paste' && (
        <form onSubmit={handlePasteSubmit} className="py-2">
          <input
            type="text"
            className="form-control form-control-custom text-white"
            placeholder="Paste the QR token here"
            value={pastedToken}
            onChange={(e) => setPastedToken(e.target.value)}
          />
          <button type="submit" className="btn btn-gradient-primary btn-sm rounded-pill w-100 mt-2" disabled={!pastedToken.trim()}>
            Use this token
          </button>
        </form>
      )}
    </div>
  );
};

export default QrScanner;
