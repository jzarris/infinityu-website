export interface GalleryItem {
  id: string;
  category: string;
  treatmentArea: string;
  beforeImage: string;
  afterImage: string;
}

// Gallery images will be added as they become available with proper patient consent
// Each image requires documented HIPAA-compliant patient consent before upload
export const galleryItems: GalleryItem[] = [];

export const galleryCategories = [
  'All',
  'HiFu',
  'Body Contouring',
  'Microneedling',
  'Injectables',
  'Radio Frequency',
] as const;
