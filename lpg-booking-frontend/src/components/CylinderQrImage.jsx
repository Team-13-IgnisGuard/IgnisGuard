import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

// Renders a cylinder's qrToken as an actual scannable QR code image.
// This is what you'd print on a label and stick on the cylinder in real life;
// for the demo, point QrScanner's camera at this on another screen/printout.
const CylinderQrImage = ({ token, size = 180 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && token) {
      QRCode.toCanvas(canvasRef.current, token, { width: size, margin: 1 }, (err) => {
        if (err) console.error('QR render error:', err);
      });
    }
  }, [token, size]);

  if (!token) return null;

  return (
    <div className="d-inline-block p-2 bg-white rounded-3">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CylinderQrImage;
