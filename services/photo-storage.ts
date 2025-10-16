import { PhotoAsset, PhotoValidationResult } from '@/types/photo';
import { Directory, File, Paths } from 'expo-file-system';

const PHOTOS_DIRECTORY_NAME = 'photos';

export class PhotoStorageService {
  /**
   * Get photos directory
   */
  static getPhotosDirectory(): Directory {
    return new Directory(Paths.document, PHOTOS_DIRECTORY_NAME);
  }

  /**
   * Initialize photos directory
   */
  static async initializeDirectory(): Promise<void> {
    try {
      const photosDir = this.getPhotosDirectory();
      if (!photosDir.exists) {
        photosDir.create();
      }
    } catch (error) {
      console.error('Failed to initialize photos directory:', error);
      throw new Error('Unable to create photos directory');
    }
  }

  /**
   * Validate photo asset - Now accepts all images without restrictions
   */
  static validatePhoto(photo: PhotoAsset): PhotoValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // No restrictions - accept all images
    // Only provide helpful tips as warnings, never block uploads

    // Provide helpful tips for very large files (but don't block them)
    if (photo.fileSize && photo.fileSize > 50 * 1024 * 1024) { // 50MB
      warnings.push(`Large file size (${(photo.fileSize / 1024 / 1024).toFixed(1)}MB). Processing may take longer, but we'll handle it.`);
    }

    // Provide tips for very high resolution (but don't block them)
    if (photo.width > 8192 || photo.height > 8192) {
      warnings.push(`Very high resolution (${photo.width}x${photo.height}). Processing may take longer, but we'll analyze it thoroughly.`);
    }

    // All images are valid - no errors ever
    return {
      isValid: true, // Always valid
      errors, // Always empty
      warnings,
    };
  }

  /**
   * Copy photo to app's document directory
   */
  static async savePhoto(photoUri: string): Promise<string> {
    try {
      await this.initializeDirectory();
      
      const fileName = `workspace_${Date.now()}.jpg`;
      const photosDir = this.getPhotosDirectory();
      const destinationFile = new File(photosDir, fileName);
      const sourceFile = new File(photoUri);
      
      sourceFile.copy(destinationFile);

      return destinationFile.uri;
    } catch (error) {
      console.error('Failed to save photo:', error);
      throw new Error('Unable to save photo');
    }
  }

  /**
   * Get photo info including file size
   */
  static async getPhotoInfo(uri: string): Promise<Partial<PhotoAsset>> {
    try {
      const file = new File(uri);
      
      return {
        uri,
        fileSize: file.size,
        fileName: file.name,
      };
    } catch (error) {
      console.error('Failed to get photo info:', error);
      return { uri };
    }
  }

  /**
   * Delete photo from storage
   */
  static async deletePhoto(uri: string): Promise<void> {
    try {
      const file = new File(uri);
      if (file.exists) {
        file.delete();
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  }

  /**
   * Clean up old photos (keep only last 5)
   */
  static async cleanupOldPhotos(): Promise<void> {
    try {
      await this.initializeDirectory();
      
      const photosDir = this.getPhotosDirectory();
      const contents = photosDir.list();
      const photoFiles = contents.filter(item => 
        item instanceof File && item.name.startsWith('workspace_')
      ) as File[];
      
      if (photoFiles.length > 5) {
        // Sort by creation time (filename contains timestamp)
        photoFiles.sort((a, b) => a.name.localeCompare(b.name));
        const filesToDelete = photoFiles.slice(0, photoFiles.length - 5);
        
        for (const file of filesToDelete) {
          file.delete();
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old photos:', error);
    }
  }
}
