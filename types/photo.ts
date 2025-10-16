export interface PhotoAsset {
  uri: string;
  width: number;
  height: number;
  type?: 'image' | 'video';
  fileSize?: number;
  fileName?: string;
  mimeType?: string;
}

export interface PhotoValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PhotoUploadState {
  selectedPhoto: PhotoAsset | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  validationResult: PhotoValidationResult | null;
}

export interface PhotoUploadTip {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'essential' | 'recommended' | 'optional';
}

// Photo Upload Tips Data
export const PHOTO_UPLOAD_TIPS: PhotoUploadTip[] = [
  {
    id: 'include-workspace',
    title: 'Include your desk, chair, and lighting',
    description: 'Make sure your entire workspace is visible in the frame for the best analysis',
    icon: 'desktopcomputer',
    type: 'essential',
  },
  {
    id: 'good-lighting',
    title: 'Make sure the room is well-lit',
    description: 'Natural light or bright room lighting helps our AI see details clearly',
    icon: 'lightbulb',
    type: 'essential',
  },
  {
    id: 'full-workspace',
    title: 'Capture the full workspace area',
    description: 'Include surrounding walls and floor space to understand the room layout',
    icon: 'camera.viewfinder',
    type: 'recommended',
  },
  {
    id: 'clear-view',
    title: 'Remove clutter for clearer analysis',
    description: 'Temporarily clear your desk to help AI focus on furniture and layout',
    icon: 'sparkles',
    type: 'optional',
  },
  {
    id: 'multiple-angles',
    title: 'Consider taking multiple photos',
    description: 'Different angles can provide more comprehensive workspace insights',
    icon: 'camera.rotate',
    type: 'optional',
  },
];

// Photo validation constants - Removed all restrictions to handle any image size
export const PHOTO_VALIDATION = {
  MAX_FILE_SIZE: Number.MAX_SAFE_INTEGER, // No file size limit
  MIN_WIDTH: 1,  // Accept any width
  MIN_HEIGHT: 1, // Accept any height
  MAX_WIDTH: Number.MAX_SAFE_INTEGER, // No maximum width
  MAX_HEIGHT: Number.MAX_SAFE_INTEGER, // No maximum height
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp', 'image/bmp', 'image/gif', 'image/tiff'], // Support all common formats
  RECOMMENDED_ASPECT_RATIOS: [
    { ratio: 4/3, label: '4:3 (Standard)' },
    { ratio: 16/9, label: '16:9 (Widescreen)' },
    { ratio: 3/2, label: '3:2 (Camera)' },
    { ratio: 1/1, label: '1:1 (Square)' },
  ],
} as const;
