import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Video,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { SAMPLE_IMAGES } from '../../data/mockData';
import { EvidenceItem } from '../../types';
import { requestBrowserGeolocation } from '../../services/locationService';
import { geocodingService } from '../../services/geocodingService';
import { CameraService } from '../../services/cameraService';
import { GeotagImageService } from '../../services/geotagImageService';
import { MediaStorageService } from '../../services/mediaStorageService';

type CameraStatus = 'idle' | 'requesting' | 'initializing' | 'ready' | 'error';
type PreviewMode = 'original' | 'geotagged';

export const Step1CaptureEvidence: React.FC = () => {
  const { reportDraft, updateDraft, setWizardStep, setActiveView, currentUser } = useCivic();

  // Camera & Stream State
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Captured Photo State
  const [capturedOriginalUrl, setCapturedOriginalUrl] = useState<string | null>(
    reportDraft.evidence[0]?.url || null
  );
  const [capturedGeotaggedUrl, setCapturedGeotaggedUrl] = useState<string | null>(
    reportDraft.evidence[0]?.geotaggedUrl || null
  );
  const [previewMode, setPreviewMode] = useState<PreviewMode>(
    reportDraft.evidence[0]?.geotaggedUrl ? 'geotagged' : 'original'
  );
  const [capturedSize, setCapturedSize] = useState<string>(
    reportDraft.evidence[0]?.size || '1.8 MB'
  );
  const [captureDate, setCaptureDate] = useState<Date>(new Date());
  const [isSampleCapture, setIsSampleCapture] = useState<boolean>(
    reportDraft.evidence[0]?.isSample || false
  );
  const [hideIdentity, setHideIdentity] = useState<boolean>(
    reportDraft.evidence[0]?.hideIdentityOnOverlay || false
  );

  // Location Permission & Acquisition
  const [locationPermissionAllowed, setLocationPermissionAllowed] = useState(
    reportDraft.locationPermissionGranted
  );
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Safely stop stream on component unmount
  useEffect(() => {
    return () => {
      CameraService.stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  // Callback ref for HTMLVideoElement to ensure stream is attached reliably
  const attachVideoRef = useCallback((videoElement: HTMLVideoElement | null) => {
    videoRef.current = videoElement;
    if (videoElement && streamRef.current) {
      if (videoElement.srcObject !== streamRef.current) {
        videoElement.srcObject = streamRef.current;
        videoElement
          .play()
          .then(() => {
            setIsVideoPlaying(true);
          })
          .catch((err) => {
            console.warn('Video auto-playback caught:', err);
          });
      }
    }
  }, []);

  /**
   * Re-generate geotag overlay when location or privacy toggle changes
   */
  const updateGeotagVariant = useCallback(
    async (originalUrl: string, hideId: boolean) => {
      try {
        const result = await GeotagImageService.generateGeotaggedImage({
          imageUrl: originalUrl,
          reporterName: currentUser.name,
          hideIdentity: hideId,
          location: reportDraft.location,
          captureDate,
          customLandmark: reportDraft.location?.landmark,
        });
        setCapturedGeotaggedUrl(result.dataUrl);
      } catch (e) {
        console.warn('Failed to update geotagged overlay:', e);
      }
    },
    [currentUser.name, reportDraft.location, captureDate]
  );

  // Whenever hideIdentity changes and we have a photo, re-generate overlay
  const handleToggleHideIdentity = (hide: boolean) => {
    setHideIdentity(hide);
    if (capturedOriginalUrl) {
      updateGeotagVariant(capturedOriginalUrl, hide);
    }
  };

  /**
   * Start live camera with rear camera preference and robust error handling
   */
  const startLiveCamera = async () => {
    setCameraError(null);
    setCameraStatus('requesting');
    setIsVideoPlaying(false);

    try {
      // 1. Request actual media stream
      const stream = await CameraService.requestCameraStream('environment');
      streamRef.current = stream;
      setCameraStatus('initializing');

      // 2. Attach to video element if already rendered
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
          setIsVideoPlaying(true);
        } catch (playErr) {
          console.warn('Initial video.play() deferred:', playErr);
        }
      }

      setCameraStatus('ready');
    } catch (err: any) {
      console.error('Camera initialization failed:', err);
      setCameraError(err.message || 'Camera could not be started.');
      setCameraStatus('error');
      CameraService.stopStream(streamRef.current);
      streamRef.current = null;
    }
  };

  /**
   * Stop live camera stream and return to idle state
   */
  const cancelLiveCamera = () => {
    CameraService.stopStream(streamRef.current);
    streamRef.current = null;
    setCameraStatus('idle');
    setCameraError(null);
    setIsVideoPlaying(false);
  };

  /**
   * Capture authentic frame from the active video stream
   */
  const capturePhoto = async () => {
    if (!videoRef.current) return;

    try {
      const result = await CameraService.captureVideoFrame(videoRef.current);
      const now = new Date();
      setCaptureDate(now);
      setCapturedOriginalUrl(result.dataUrl);
      setCapturedSize(result.formattedSize);
      setIsSampleCapture(false);

      // Stop camera stream after capture
      CameraService.stopStream(streamRef.current);
      streamRef.current = null;
      setCameraStatus('idle');
      setIsVideoPlaying(false);

      // Generate geotagged variant
      const geotagged = await GeotagImageService.generateGeotaggedImage({
        imageUrl: result.dataUrl,
        reporterName: currentUser.name,
        hideIdentity,
        location: reportDraft.location,
        captureDate: now,
        customLandmark: reportDraft.location?.landmark,
      });

      setCapturedGeotaggedUrl(geotagged.dataUrl);
      setPreviewMode('geotagged');
    } catch (err: any) {
      console.error('Capture frame error:', err);
      alert(err.message || 'Failed to capture photo frame from camera.');
    }
  };

  /**
   * Retake photo: clear current photo and re-open live camera
   */
  const retakePhoto = () => {
    setCapturedOriginalUrl(null);
    setCapturedGeotaggedUrl(null);
    startLiveCamera();
  };

  /**
   * Use demo sample photo when deliberately requested for walkthrough testing
   */
  const loadDemoPhoto = async () => {
    const demoUrl = SAMPLE_IMAGES.pothole;
    const now = new Date();
    setCaptureDate(now);
    setCapturedOriginalUrl(demoUrl);
    setCapturedSize('2.8 MB');
    setIsSampleCapture(true);
    setCameraStatus('idle');

    // Generate geotagged variant for sample image
    const geotagged = await GeotagImageService.generateGeotaggedImage({
      imageUrl: demoUrl,
      reporterName: currentUser.name,
      hideIdentity,
      location: reportDraft.location || {
        name: 'Bull Temple Road, Basavanagudi',
        lat: 12.9416,
        lng: 77.5655,
        landmark: 'Opposite BMSCE gate',
        locality: 'Basavanagudi',
        city: 'Bengaluru',
        accuracy: '±15m · Sample GPS',
        source: 'sample',
      },
      captureDate: now,
    });

    setCapturedGeotaggedUrl(geotagged.dataUrl);
    setPreviewMode('geotagged');
  };

  /**
   * Finalize and attach captured photo to report draft and IndexedDB
   */
  const usePhoto = async () => {
    if (!capturedOriginalUrl) return;

    const evidenceId = `ev-${Date.now()}`;
    const formattedTimestamp = GeotagImageService.formatTimestamp(captureDate);

    const newEvidence: EvidenceItem = {
      id: evidenceId,
      url: capturedOriginalUrl,
      geotaggedUrl: capturedGeotaggedUrl || undefined,
      name: `CAPTURE_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}.jpg`,
      size: capturedSize,
      type: 'image/jpeg',
      contributorName: currentUser.name,
      contributorAvatar: currentUser.avatar,
      timestamp: formattedTimestamp,
      isSample: isSampleCapture,
      isLiveCaptured: !isSampleCapture,
      locationConfirmed: Boolean(reportDraft.location?.isConfirmed),
      locationData: reportDraft.location,
      hideIdentityOnOverlay: hideIdentity,
    };

    // Persist full-res media safely to IndexedDB
    await MediaStorageService.saveEvidenceMedia({
      evidenceId,
      originalDataUrl: capturedOriginalUrl,
      geotaggedDataUrl: capturedGeotaggedUrl || undefined,
      sizeFormatted: capturedSize,
      mimeType: 'image/jpeg',
      createdAt: captureDate.toISOString(),
    });

    updateDraft({ evidence: [newEvidence] });

    // Stop camera stream if still running
    if (streamRef.current) {
      CameraService.stopStream(streamRef.current);
      streamRef.current = null;
      setCameraStatus('idle');
    }
  };

  /**
   * Handle user uploading a photo file from gallery
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, HEIC)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      const now = new Date();
      setCaptureDate(now);
      setCapturedOriginalUrl(result);
      setIsSampleCapture(false);
      const sizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      setCapturedSize(sizeFormatted);

      // Stop camera if open
      CameraService.stopStream(streamRef.current);
      streamRef.current = null;
      setCameraStatus('idle');

      // Generate geotagged variant for upload
      try {
        const geotagged = await GeotagImageService.generateGeotaggedImage({
          imageUrl: result,
          reporterName: currentUser.name,
          hideIdentity,
          location: reportDraft.location,
          captureDate: now,
          customLandmark: reportDraft.location?.landmark,
        });
        setCapturedGeotaggedUrl(geotagged.dataUrl);
        setPreviewMode('geotagged');
      } catch (err) {
        console.warn('Could not generate geotagged variant for upload:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  /**
   * Request real device GPS and reverse geocode
   */
  const handleAllowLocation = async () => {
    setIsLocationLoading(true);
    try {
      const geo = await requestBrowserGeolocation();
      const resolved = await geocodingService.reverseGeocode(geo.lat, geo.lng, 'device');

      const updatedLoc = {
        name: resolved.name,
        lat: geo.lat,
        lng: geo.lng,
        landmark: resolved.name,
        locality: resolved.locality,
        city: resolved.city,
        accuracy: `±${geo.accuracy} metres · Device GPS`,
        source: 'device' as const,
        isConfirmed: false,
      };

      setLocationPermissionAllowed(true);
      updateDraft({
        locationPermissionGranted: true,
        location: updatedLoc,
      });

      // If photo is already captured, refresh the geotag overlay with the new location!
      if (capturedOriginalUrl) {
        try {
          const geotagged = await GeotagImageService.generateGeotaggedImage({
            imageUrl: capturedOriginalUrl,
            reporterName: currentUser.name,
            hideIdentity,
            location: updatedLoc,
            captureDate,
            customLandmark: updatedLoc.landmark,
          });
          setCapturedGeotaggedUrl(geotagged.dataUrl);
        } catch (e) {
          console.warn('Geotag refresh warning:', e);
        }
      }
    } catch (err: any) {
      console.warn('Geolocation not acquired:', err);
      alert(err.message || 'Unable to retrieve location coordinates. You can enter location manually in step 2.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleContinue = () => {
    if (reportDraft.evidence.length === 0) {
      // If user captured but didn't click "Use Photo", auto-use it
      if (capturedOriginalUrl) {
        usePhoto();
      } else {
        alert('Please capture or upload at least one photographic evidence item to continue.');
        return;
      }
    }
    setWizardStep(2);
  };

  return (
    <div className="wizard-container">
      {/* Top Header */}
      <div className="wizard-top-header">
        <div className="wizard-breadcrumb">REPORT A CIVIC ISSUE / STEP 1 OF 4</div>
        <div className="wizard-title-row">
          <h1 className="wizard-main-title">Make an issue visible.</h1>
          <button
            className="wizard-save-draft"
            onClick={() => alert('Draft automatically saved to local browser storage!')}
          >
            Save Draft
          </button>
        </div>
        <div className="wizard-subtitle">
          Start with an original photo. We’ll help you add a clear location and the details that matter.
        </div>
      </div>

      {/* 4-Step Stepper Header */}
      <div className="wizard-stepper">
        <div className="step-indicator-item active">
          <div className="step-number-circle">1</div>
          <span>Capture evidence</span>
        </div>
        <div className="step-indicator-item">
          <div className="step-number-circle">2</div>
          <span>Confirm location</span>
        </div>
        <div className="step-indicator-item">
          <div className="step-number-circle">3</div>
          <span>Add details</span>
        </div>
        <div className="step-indicator-item">
          <div className="step-number-circle">4</div>
          <span>Review & publish</span>
        </div>
      </div>

      {/* Permission Area (Exact Figma PDF) */}
      <div className="permission-box">
        <div className="permission-title">
          <Info size={16} color="#0284c7" />
          <span>Before capture: location permission</span>
        </div>
        <div style={{ fontWeight: 600, fontSize: '13px', color: '#b45309', marginBottom: '4px' }}>
          {locationPermissionAllowed ? '✓ Location access granted' : 'Location needs confirmation'}
        </div>
        <div className="permission-desc">
          Allow CivicSignal to request your device location for this report? It helps place the incident,
          and you’ll review the pin before publishing. You can enter it manually instead.
        </div>
        <div className="permission-actions">
          <button
            className="btn-permission-allow"
            onClick={handleAllowLocation}
            disabled={isLocationLoading}
            style={{
              backgroundColor: locationPermissionAllowed ? '#15803d' : '#1d70b8',
              opacity: isLocationLoading ? 0.7 : 1,
            }}
          >
            {isLocationLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Loader2 size={14} className="spin" /> Acquiring GPS…
              </span>
            ) : locationPermissionAllowed ? (
              'Location Enabled ✓'
            ) : (
              'Allow once · GPS'
            )}
          </button>
          <button
            className="btn-permission-manual"
            onClick={() => {
              setLocationPermissionAllowed(false);
              updateDraft({ locationPermissionGranted: false });
            }}
          >
            Not now · enter manually
          </button>
        </div>
        <div className="permission-disclaimer">
          Permission request preview · no operating system permission is being requested without your action.
        </div>
      </div>

      {/* Capture Section Heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Capture what you see</h2>
        <div style={{ fontSize: '12px' }}>
          {cameraStatus === 'ready' && (
            <span style={{ color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="camera-in-use-dot active" /> Live camera ready
            </span>
          )}
          {cameraStatus === 'requesting' && (
            <span style={{ color: '#b45309', fontWeight: 600 }}>Requesting camera access…</span>
          )}
          {cameraStatus === 'initializing' && (
            <span style={{ color: '#0284c7', fontWeight: 600 }}>Starting camera…</span>
          )}
          {cameraStatus === 'error' && (
            <span style={{ color: '#dc2626', fontWeight: 600 }}>Camera could not be started</span>
          )}
          {cameraStatus === 'idle' && !capturedOriginalUrl && (
            <span style={{ color: '#64748b' }}>Camera not started</span>
          )}
          {capturedOriginalUrl && (
            <span style={{ color: '#0284c7', fontWeight: 600 }}>
              {isSampleCapture ? 'Demo photo loaded' : 'Photo captured ✓'}
            </span>
          )}
        </div>
      </div>

      {/* Camera Preview Box */}
      <div className="camera-view-container">
        <div className="camera-header-bar">
          <div className="camera-in-use-indicator">
            <span
              className={`camera-in-use-dot ${
                cameraStatus === 'ready'
                  ? 'active'
                  : cameraStatus === 'requesting' || cameraStatus === 'initializing'
                  ? 'requesting'
                  : cameraStatus === 'error'
                  ? 'error'
                  : ''
              }`}
            />
            <span>
              {cameraStatus === 'ready'
                ? 'Camera active · Live device video'
                : cameraStatus === 'requesting'
                ? 'Requesting browser camera permission…'
                : cameraStatus === 'initializing'
                ? 'Initializing video stream…'
                : cameraStatus === 'error'
                ? 'Camera unavailable'
                : capturedOriginalUrl
                ? 'Captured evidence preview'
                : 'Camera standby · No active stream'}
            </span>
          </div>

          {/* Segmented Control when photo is captured */}
          {capturedOriginalUrl ? (
            <div className="preview-segmented-control">
              <button
                type="button"
                className={`preview-segmented-btn ${previewMode === 'original' ? 'active' : ''}`}
                onClick={() => setPreviewMode('original')}
              >
                Original Photo
              </button>
              <button
                type="button"
                className={`preview-segmented-btn ${previewMode === 'geotagged' ? 'active' : ''}`}
                onClick={() => setPreviewMode('geotagged')}
              >
                Geotagged Photo
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {cameraStatus === 'ready'
                ? 'PHOTO · Live camera stream'
                : 'PHOTO · Standby mode'}
            </div>
          )}
        </div>

        {/* Viewport */}
        <div className="camera-viewport">
          {capturedOriginalUrl ? (
            // Captured Photo Preview (Original or Geotagged)
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src={previewMode === 'geotagged' && capturedGeotaggedUrl ? capturedGeotaggedUrl : capturedOriginalUrl}
                alt="Captured Evidence"
                className="camera-sample-img"
              />
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(4px)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {previewMode === 'geotagged' ? '🏷️ Geotagged Evidence Variant' : '📷 Original Raw Capture'}
              </div>

              {isSampleCapture && (
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(217, 119, 6, 0.9)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                >
                  DEMO SAMPLE
                </div>
              )}
            </div>
          ) : cameraStatus === 'ready' || cameraStatus === 'initializing' ? (
            // Live Video Element
            <video
              ref={attachVideoRef}
              autoPlay
              playsInline
              muted
              className="camera-video-element"
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.play().catch((err) => console.warn('Video play caught:', err));
                }
              }}
              onCanPlay={() => setIsVideoPlaying(true)}
            />
          ) : cameraStatus === 'requesting' ? (
            // Requesting Permission State
            <div style={{ textAlign: 'center', color: '#cbd5e1', padding: '24px' }}>
              <Loader2 size={36} color="#38bdf8" className="spin" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                Requesting Camera Permission
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '300px', margin: '0 auto' }}>
                Please allow camera access in your browser prompt to view the live camera feed.
              </div>
            </div>
          ) : cameraStatus === 'error' ? (
            // Error State
            <div style={{ textAlign: 'center', color: '#f8fafc', padding: '24px', maxWidth: '360px' }}>
              <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#fca5a5', marginBottom: '6px' }}>
                Camera Could Not Be Started
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '16px', lineHeight: 1.5 }}>
                {cameraError || 'Ensure you are connected via localhost or HTTPS, and camera permissions are allowed.'}
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-cam-action btn-cam-primary"
                  onClick={startLiveCamera}
                >
                  Try Again
                </button>
                <button
                  type="button"
                  className="btn-cam-action btn-cam-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload File
                </button>
              </div>
            </div>
          ) : (
            // Idle State: Clean Viewfinder Placeholder
            <div style={{ textAlign: 'center', color: '#cbd5e1', padding: '32px 16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <Camera size={28} color="#94a3b8" />
              </div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#f8fafc', marginBottom: '4px' }}>
                Camera Ready to Start
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '320px', margin: '0 auto 16px', lineHeight: 1.4 }}>
                Click below to open your device camera for real geotagged evidence capture.
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-cam-action btn-cam-primary"
                  onClick={startLiveCamera}
                >
                  Open Camera
                </button>
                <button
                  type="button"
                  className="btn-cam-action btn-cam-secondary"
                  onClick={loadDemoPhoto}
                  title="Test reporting with sample photo if camera is unavailable"
                >
                  Demo Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Camera Controls Bar (Exact Figma PDF) */}
        <div className="camera-controls-bar">
          {cameraStatus === 'idle' && !capturedOriginalUrl && (
            <button className="btn-cam-action btn-cam-primary" onClick={startLiveCamera}>
              Open Camera
            </button>
          )}

          {cameraStatus === 'ready' && !capturedOriginalUrl && (
            <>
              <button
                className="btn-cam-action btn-cam-primary"
                onClick={capturePhoto}
              >
                Capture Photo
              </button>
              <button className="btn-cam-action btn-cam-secondary" onClick={cancelLiveCamera}>
                Cancel
              </button>
            </>
          )}

          {(cameraStatus === 'requesting' || cameraStatus === 'initializing') && (
            <button className="btn-cam-action btn-cam-secondary" onClick={cancelLiveCamera}>
              Cancel
            </button>
          )}

          {capturedOriginalUrl && (
            <>
              <button className="btn-cam-action btn-cam-secondary" onClick={retakePhoto}>
                Retake
              </button>
              <button className="btn-cam-action btn-cam-primary" onClick={usePhoto}>
                Use Photo
              </button>
              <button
                className="btn-cam-action btn-cam-secondary"
                onClick={() => {
                  setCapturedOriginalUrl(null);
                  setCapturedGeotaggedUrl(null);
                  updateDraft({ evidence: [] });
                }}
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>

      {/* Geotag Privacy & Landmark Review Panel (Shown when captured or available) */}
      {capturedOriginalUrl && (
        <div
          style={{
            marginTop: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>Geotag Overlay Options</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Captured: {GeotagImageService.formatTimestamp(captureDate)}
            </span>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: '#334155',
              fontSize: '12px',
            }}
          >
            <input
              type="checkbox"
              checked={hideIdentity}
              onChange={(e) => handleToggleHideIdentity(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#ff4500' }}
            />
            <span>
              <strong>Privacy protection:</strong> Hide my name from the public image overlay (attribute to 'Community Contributor')
            </span>
          </label>

          <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
            {reportDraft.location?.lat && reportDraft.location?.lng ? (
              <span>
                Coordinates: <strong>{GeotagImageService.formatCoordinates(reportDraft.location.lat, reportDraft.location.lng)}</strong> · {reportDraft.location.source === 'device' ? 'GPS Source' : 'Manual Source'}
              </span>
            ) : (
              <span>Location coordinates will be confirmed in Step 2. The geotag overlay will update automatically.</span>
            )}
          </div>
        </div>
      )}

      {/* Alternative Upload Buttons */}
      <div className="upload-buttons-row" style={{ marginTop: '14px' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <button
          className="btn-upload-gallery"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} />
          <span>Upload from Gallery</span>
        </button>

        <button
          className="btn-upload-gallery"
          onClick={() => alert('Video upload: Short MP4 clips up to 60 seconds supported for water flow and traffic observations.')}
        >
          <Video size={16} />
          <span>Add video (optional)</span>
        </button>
      </div>

      <div className="upload-file-guideline">
        JPG, PNG or HEIC · up to 20 MB per photo. Optional MP4 video up to 60 seconds. Never step into
        traffic to capture evidence.
      </div>

      {/* Safety Notice Callout */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#92400e',
          marginTop: '16px',
          marginBottom: '20px',
        }}
      >
        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Safety Guidance:</strong> Capture evidence from a safe distance. Never step into active
          traffic or approach dangerous electrical equipment to take a photograph.
        </span>
      </div>

      {/* Selected Evidence Preview (Exact Figma PDF) */}
      {reportDraft.evidence.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            Selected evidence · {reportDraft.evidence[0].isSample ? 'Sample reference' : 'Original capture retained'}
          </div>
          <div className="selected-evidence-card">
            <img
              src={reportDraft.evidence[0].geotaggedUrl || reportDraft.evidence[0].url}
              alt="Selected"
              className="evidence-thumb-mini"
            />
            <div className="evidence-details-text">
              <div className="evidence-filename">{reportDraft.evidence[0].name}</div>
              <div className="evidence-meta-sub">
                {reportDraft.evidence[0].size} · Original retained ·{' '}
                {locationPermissionAllowed ? 'Location coordinates recorded' : 'Location unconfirmed'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => fileInputRef.current?.click()}
              >
                Replace
              </button>
              <button
                style={{ fontSize: '13px', fontWeight: 600, color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => {
                  setCapturedOriginalUrl(null);
                  setCapturedGeotaggedUrl(null);
                  updateDraft({ evidence: [] });
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="wizard-footer-nav">
        <button
          className="btn-wizard-back"
          onClick={() => setActiveView('explore')}
        >
          Cancel
        </button>
        <button
          className="btn-wizard-continue"
          onClick={handleContinue}
        >
          Continue to location
        </button>
      </div>
    </div>
  );
};
