import { useCallback, useEffect, useRef, useState } from 'react';
import { useRuntimeEnvironment } from './useRuntimeEnvironment';

type ScannerError =
  | 'permission-denied'
  | 'no-camera'
  | 'scanner-unavailable'
  | null;

interface UseBarcodeScanner {
  isScanning: boolean;
  lastResult: string | null;
  error: ScannerError;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  startScan: () => void;
  stopScan: () => void;
}

async function detectWithNativeAPI(
  video: HTMLVideoElement,
): Promise<string | null> {
  if (!('BarcodeDetector' in window)) return null;
  const BarcodeDetectorClass = (
    window as unknown as {
      BarcodeDetector: new (opts: {
        formats: string[];
      }) => {
        detect: (
          source: HTMLVideoElement,
        ) => Promise<{ rawValue: string }[]>;
      };
    }
  ).BarcodeDetector;
  const detector = new BarcodeDetectorClass({
    formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
  });
  const results = await detector.detect(video);
  if (results.length > 0) {
    const value = results[0].rawValue;
    return value;
  }
  return null;
}

async function detectWithZxing(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
): Promise<string | null> {
  const { readBarcodes } = await import('zxing-wasm/reader');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const results = await readBarcodes(imageData);
  if (results.length > 0) {
    const value = results[0].text;
    return value;
  }
  return null;
}

export function useBarcodeScanner(): UseBarcodeScanner {
  const { isMobileWebView } = useRuntimeEnvironment();

  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [error, setError] = useState<ScannerError>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stoppedRef = useRef(false);
  const messageListenerRef = useRef<((event: MessageEvent) => void) | null>(null);

  const cleanup = useCallback(() => {
    stoppedRef.current = true;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (messageListenerRef.current) {
      window.removeEventListener('message', messageListenerRef.current);
      messageListenerRef.current = null;
    }
  }, []);

  const startWebScan = useCallback(async () => {
    setError(null);
    setLastResult(null);
    stoppedRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      setIsScanning(true);

      const hasNativeAPI = 'BarcodeDetector' in window;

      const scanFrame = async () => {
        if (stoppedRef.current) return;

        const video = videoRef.current;
        if (!video || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(() => void scanFrame());
          return;
        }

        let result: string | null = null;

        if (hasNativeAPI) {
          result = await detectWithNativeAPI(video);
        }

        if (result == null && canvasRef.current) {
          try {
            result = await detectWithZxing(video, canvasRef.current);
          } catch {
            // zxing-wasm failed — continue scanning
          }
        }

        if (result != null && !stoppedRef.current) {
          setLastResult(result);
          setIsScanning(false);
          cleanup();
          return;
        }

        if (!stoppedRef.current) {
          rafRef.current = requestAnimationFrame(() => void scanFrame());
        }
      };

      rafRef.current = requestAnimationFrame(() => void scanFrame());
    } catch {
      setError('permission-denied');
      setIsScanning(false);
    }
  }, [cleanup]);

  const startMobileScan = useCallback(() => {
    setError(null);
    setLastResult(null);
    setIsScanning(true);

    const webView = (
      window as unknown as { ReactNativeWebView?: { postMessage: (msg: string) => void } }
    ).ReactNativeWebView;

    if (webView) {
      webView.postMessage(JSON.stringify({ type: 'scan-barcode' }));
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        const data =
          typeof event.data === 'string'
            ? (JSON.parse(event.data) as { type?: string; barcode?: string })
            : (event.data as { type?: string; barcode?: string });

        if (data.type === 'barcode-result' && data.barcode) {
          setLastResult(data.barcode);
          setIsScanning(false);
          window.removeEventListener('message', handleMessage);
          messageListenerRef.current = null;
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    messageListenerRef.current = handleMessage;
    window.addEventListener('message', handleMessage);
  }, []);

  const startScan = useCallback(() => {
    if (isMobileWebView) {
      startMobileScan();
    } else {
      void startWebScan();
    }
  }, [isMobileWebView, startMobileScan, startWebScan]);

  const stopScan = useCallback(() => {
    cleanup();
    setIsScanning(false);
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return { isScanning, lastResult, error, videoRef, startScan, stopScan };
}
