import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Storage abstract interface
export interface StorageProvider {
  uploadFile(file: Buffer, fileName: string, mimeType: string): Promise<string>;
  deleteFile(url: string): Promise<void>;
}

// Local Storage Implementation (Dev)
class LocalStorageProvider implements StorageProvider {
  private uploadDir = path.join(process.cwd(), '.storage', 'uploads');

  async uploadFile(file: Buffer, fileName: string): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    
    const ext = path.extname(fileName);
    const uniqueName = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, uniqueName);
    
    await fs.writeFile(filePath, file);
    return `/api/files/${uniqueName}`;
  }

  async deleteFile(url: string): Promise<void> {
    const fileName = path.basename(url);
    const filePath = path.join(this.uploadDir, fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Failed to delete local file:', error);
    }
  }
}

// S3 Storage Implementation (Prod - Placeholder)
class S3StorageProvider implements StorageProvider {
  async uploadFile(file: Buffer, fileName: string): Promise<string> {
    // Implement S3 upload logic here
    console.log('S3 Upload Placeholder:', fileName);
    return `https://s3-bucket.example.com/${fileName}`;
  }

  async deleteFile(url: string): Promise<void> {
    console.log('S3 Delete Placeholder:', url);
  }
}

// Factory to get provider based on environment
export const getStorageProvider = (): StorageProvider => {
  if (process.env.STORAGE_TYPE === 's3') {
    return new S3StorageProvider();
  }
  return new LocalStorageProvider();
};

export const storage = getStorageProvider();
