import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

// Renders a cylinder's qrToken as an actual scannable QR code image.
// This is what you'd print on a label and stick on the cylinder in real life;
// for the demo, point QrScanner's camera at this on another screen/printout.
const CylinderQrImage = ({ token, size = 180, showDownload = false, fileName = 'cylinder-qr' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && token) {
      QRCode.toCanvas(canvasRef.current, token, { width: size, margin: 1 }, (err) => {
        if (err) console.error('QR render error:', err);
      });
    }
  }, [token, size]);

  if (!token) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="d-inline-block text-center">
      <div className="d-inline-block p-2 bg-white rounded-3">
        <canvas ref={canvasRef} />
      </div>
      {showDownload && (
        <div className="mt-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill"
            onClick={handleDownload}
          >
            <i className="bi bi-download me-1"></i>
            Download QR
          </button>
        </div>
      )}
    </div>
  );
};

export default CylinderQrImage;
