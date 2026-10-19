/**
 * CivicSignal Camera Service
 * Robust, production-grade management for browser MediaDevices and live camera capture.
 */

export interface CameraSupportStatus {
  supported: boolean;
  isSecure: boolean;
  reason?: string;
}

export interface CapturedFrameResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
  formattedSize: string;
}

export class CameraService {
  /**
   * Verify browser environment capabilities and secure context
   */
  static checkSupport(): CameraSupportStatus {
    const isSecure = typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false;
    const hasMediaDevices =
      typeof navigator !== 'undefined' &&
      Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    if (!isSecure) {
      return {
        supported: false,
        isSecure: false,
        reason:
          'Camera access requires a secure browser context (HTTPS or localhost). Please load via localhost or an HTTPS connection, or use the file upload fallback.',
      };
    }

    if (!hasMediaDevices) {
      return {
        supported: false,
        isSecure: true,
        reason:
          'MediaDevices API is not supported in this browser environment. Please update your browser or use the file upload fallback.',
      };
    }

    return {
      supported: true,
      isSecure: true,
    };
  }

  /**
   * Request media stream preferring rear/environment camera on mobile
   */
  static async requestCameraStream(
    preferFacingMode: 'environment' | 'user' = 'environment'
  ): Promise<MediaStream> {
    const support = this.checkSupport();
    if (!support.supported) {
      throw new Error(support.reason || 'Camera is not supported in this browser.');
    }

    // Try high-resolution with desired facingMode first
    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: preferFacingMode },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
      };
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (firstErr: any) {
      console.warn('Primary camera constraints failed, attempting fallback constraints:', firstErr);

      // Fallback 1: basic video without strict width/height
      try {
        return await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: preferFacingMode,
          },
        });
      } catch (secondErr: any) {
        console.warn('Secondary camera constraints failed, attempting generic video:', secondErr);

        // Fallback 2: any available video device
        try {
          return await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true,
          });
        } catch (finalErr: any) {
          throw this.translateCameraError(finalErr);
        }
      }
    }
  }

  /**
   * Map standard DOMExceptions to clear, actionable user messages
   */
  static translateCameraError(err: any): Error {
    const name = err?.name || '';
    const message = err?.message || '';

    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return new Error(
        'Camera permission was denied. Please grant camera permission in your browser address bar settings or use Gallery Upload.'
      );
    }

    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return new Error(
        'No camera hardware detected on this device. You can upload photo evidence from your gallery.'
      );
    }

    if (name === 'NotReadableError' || name === 'TrackStartError') {
      return new Error(
        'Camera is already in use by another tab or application. Please close other camera apps and try again.'
      );
    }

    if (name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') {
      return new Error(
        'The requested camera resolution or facing mode is not available on this device.'
      );
    }

    if (name === 'SecurityError') {
      return new Error(
        'Camera access blocked due to security restrictions. Ensure you are on HTTPS or localhost.'
      );
    }

    if (name === 'AbortError') {
      return new Error('Camera initialization was aborted. Please try again.');
    }

    return new Error(message || 'Unable to start camera stream. You can upload photo evidence from your gallery.');
  }

  /**
   * Safely stop all tracks on a MediaStream to prevent hardware in-use leaks
   */
  static stopStream(stream: MediaStream | null): void {
    if (!stream) return;
    try {
      const tracks = stream.getTracks();
      tracks.forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping media track:', e);
        }
      });
    } catch (e) {
      console.warn('Error accessing stream tracks for cleanup:', e);
    }
  }

  /**
   * Capture current frame from live HTMLVideoElement at intrinsic dimensions
   */
  static async captureVideoFrame(video: HTMLVideoElement): Promise<CapturedFrameResult> {
    if (!video) {
      throw new Error('Video element reference is missing.');
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height || width <= 0 || height <= 0) {
      throw new Error(
        'Video stream is not ready or frame dimensions are invalid. Please wait a moment for the preview to stabilize.'
      );
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Could not obtain canvas 2D rendering context for capture.');
    }

    // Draw full resolution frame
    ctx.drawImage(video, 0, 0, width, height);

    // High quality JPEG capture
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to generate image Blob from video canvas.'));
        },
        'image/jpeg',
        0.92
      );
    });

    const sizeBytes = blob.size;
    const formattedSize =
      sizeBytes > 1024 * 1024
        ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(sizeBytes / 1024)} KB`;

    return {
      dataUrl,
      blob,
      width,
      height,
      sizeBytes,
      formattedSize,
    };
  }
}
