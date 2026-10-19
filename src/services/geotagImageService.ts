/**
 * CivicSignal Geotag Image Overlay Service
 * Creates professionally formatted, high-contrast geotag overlays on evidence photos.
 */

import { LocationData, LocationSource } from '../types';

export interface GeotagOverlayOptions {
  imageUrl: string;
  reporterName?: string;
  hideIdentity?: boolean;
  location?: LocationData | null;
  captureDate?: Date;
  customLandmark?: string;
}

export interface GeotaggedResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

export class GeotagImageService {
  /**
   * Format latitude and longitude into standard degree-direction format
   */
  static formatCoordinates(lat: number, lng: number): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  }

  /**
   * Format timestamp in human readable local time
   */
  static formatTimestamp(date: Date = new Date()): string {
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzAbbr = timeZone.includes('Calcutta') || timeZone.includes('Kolkata') ? 'IST' : 'Local';

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm} ${tzAbbr}`;
  }

  /**
   * Human-readable source descriptor
   */
  static getSourceLabel(source?: LocationSource): string {
    switch (source) {
      case 'device':
        return 'Device GPS';
      case 'map_pin':
        return 'Manually Placed Map Pin';
      case 'manual':
        return 'Manual Address Entry';
      case 'geocoded':
        return 'Geocoded Address';
      case 'sample':
        return 'Sample Reference';
      default:
        return 'Reported Location';
    }
  }

  /**
   * Load HTMLImageElement safely from URL / Data URL
   */
  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error('Failed to load base image for geotag overlay generation.'));
      img.src = url;
    });
  }

  /**
   * Render professional geotag overlay onto image
   */
  static async generateGeotaggedImage(options: GeotagOverlayOptions): Promise<GeotaggedResult> {
    const {
      imageUrl,
      reporterName = 'Community Witness',
      hideIdentity = false,
      location,
      captureDate = new Date(),
      customLandmark,
    } = options;

    const img = await this.loadImage(imageUrl);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width || 1280;
    canvas.height = img.naturalHeight || img.height || 720;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Canvas 2D context unavailable for geotag rendering.');
    }

    // 1. Draw original photograph unaltered
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Proportional scale factor based on 1000px standard baseline
    const scale = Math.max(0.65, Math.min(2.0, w / 1000));

    // Dynamic overlay height (approx 20-25% of image height max)
    const overlayHeight = Math.max(140 * scale, Math.min(h * 0.32, 220 * scale));
    const overlayY = h - overlayHeight;

    // 2. Draw subtle dark gradient transition
    const gradient = ctx.createLinearGradient(0, overlayY - 30 * scale, 0, h);
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
    gradient.addColorStop(0.25, 'rgba(15, 23, 42, 0.88)');
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0.96)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, overlayY - 30 * scale, w, overlayHeight + 30 * scale);

    // Accent line separator (CivicSignal Orange brand accent)
    ctx.fillStyle = '#ff4500';
    ctx.fillRect(24 * scale, overlayY - 2 * scale, 60 * scale, 3 * scale);

    const padX = 24 * scale;
    const contentW = w - padX * 2;

    // Typography styling
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // ROW 1: Header (Brand + Reporter Name + Capture Timestamp)
    let currentY = overlayY + 12 * scale;

    // Brand tag
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(15 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('CivicSignal · Geotagged Evidence', padX, currentY);

    // Right-aligned Timestamp
    const formattedTime = this.formatTimestamp(captureDate);
    ctx.textAlign = 'right';
    ctx.font = `${Math.round(12 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(formattedTime, w - padX, currentY);

    // Reset alignment
    ctx.textAlign = 'left';
    currentY += 24 * scale;

    // Divider line inside overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, currentY);
    ctx.lineTo(w - padX, currentY);
    ctx.stroke();

    currentY += 10 * scale;

    // ROW 2: Location details & Landmark
    const resolvedLocality = location
      ? `${location.name || location.locality || 'Confirmed Location'}`
      : 'Location to be confirmed';

    const landmarkText = customLandmark || location?.landmark;
    const hasLandmark = landmarkText && landmarkText.trim().length > 0 && landmarkText !== resolvedLocality;

    ctx.font = `600 ${Math.round(14 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = '#f8fafc';

    // Truncate location if too long
    const maxLocWidth = contentW * 0.65;
    let displayLoc = resolvedLocality;
    if (ctx.measureText(displayLoc).width > maxLocWidth) {
      while (displayLoc.length > 10 && ctx.measureText(displayLoc + '...').width > maxLocWidth) {
        displayLoc = displayLoc.slice(0, -1);
      }
      displayLoc += '...';
    }

    ctx.fillText(`📍 ${displayLoc}`, padX, currentY);

    // Right side: Coordinates
    ctx.textAlign = 'right';
    ctx.font = `bold ${Math.round(13 * scale)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.fillStyle = '#38bdf8'; // Sky cyan for crisp high-contrast coordinates

    if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
      const coordText = this.formatCoordinates(location.lat, location.lng);
      ctx.fillText(coordText, w - padX, currentY);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Coordinates pending', w - padX, currentY);
    }

    // Reset alignment
    ctx.textAlign = 'left';
    currentY += 22 * scale;

    // ROW 3: Landmark (if available) + Reporter Identity attribution
    if (hasLandmark) {
      ctx.font = `italic ${Math.round(12 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = '#94a3b8';

      let lmText = `Near: ${landmarkText}`;
      if (ctx.measureText(lmText).width > maxLocWidth) {
        while (lmText.length > 10 && ctx.measureText(lmText + '...').width > maxLocWidth) {
          lmText = lmText.slice(0, -1);
        }
        lmText += '...';
      }
      ctx.fillText(`🏛️ ${lmText}`, padX, currentY);
    }

    // Right side: Reporter Name (if not hidden for privacy)
    ctx.textAlign = 'right';
    ctx.font = `${Math.round(12 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = '#cbd5e1';

    if (!hideIdentity && reporterName) {
      ctx.fillText(`Reported by: ${reporterName}`, w - padX, currentY);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Public Community Contributor`, w - padX, currentY);
    }

    // Reset alignment
    ctx.textAlign = 'left';
    currentY += 20 * scale;

    // ROW 4: Accuracy & Location Source
    const sourceLabel = this.getSourceLabel(location?.source);
    let metaString = `Source: ${sourceLabel}`;

    if (location?.source === 'device' && location?.accuracy) {
      metaString += ` · Accuracy: ${location.accuracy}`;
    }

    ctx.font = `${Math.round(11 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(metaString, padX, currentY);

    // Export as high quality JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to generate geotagged image blob.'));
        },
        'image/jpeg',
        0.92
      );
    });

    return {
      dataUrl,
      blob,
      width: w,
      height: h,
    };
  }
}
