import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import api from '../services/api';
import { Button, Card, Input } from '../components/ui';
import { UploadCloudIcon, LinkIcon, XIcon, PackageIcon, TagIcon, PlusIcon, EditIcon, TrashIcon, SparklesIcon } from '../components/icons';
import { ProductCardPreview } from '../components/ProductCardPreview';
import { extractSizesAndColors } from '../utils/variants';

type AdminTab = 'categories' | 'products';

const ProductForm: React.FC<{ product?: Product | null, onSave: () => void, onCancel: () => void, categories: Category[] }> = ({ product, onSave, onCancel, categories }) => {
  const [formData, setFormData] = useState({
    title: product?.title || product?.name || '',
    description: product?.description || '',
    selling_price: product?.selling_price || product?.price || 0,
    discount_percentage: product?.discount_percentage || 0,
    on_sale: product?.on_sale || false,
    sale_discount_percentage: product?.sale_discount_percentage || 0,
    usp_tag: product?.usp_tag || '',
    main_image_url: product?.main_image_url || product?.imageUrl || '',
    category_id: product?.category_id || categories[0]?.id || '',
    mockup_images: product?.mockup_images || [],
    mockup_video_url: product?.mockup_video_url || '',
    sizes: product?.variants?.sizes?.join(', ') || 'S, M, L, XL',
    colors: product?.variants?.colors?.join(', ') || 'Black, White',
    gelato_template_id: (product as any)?.gelato_template_id || '',
    gelato_preview_url: (product as any)?.gelato_preview_url || '',
  });

  // Mockup images organized by color: { color: { files: File[], previews: string[], existingUrls: string[] } }
  const [mockupImagesByColor, setMockupImagesByColor] = useState<Record<string, {
    files: File[];
    previews: string[];
    existingUrls: string[]; // URLs from database (existing images)
  }>>({});
  const [selectedColorForMockup, setSelectedColorForMockup] = useState<string>('');
  
  // File upload states
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(product?.main_image_url || product?.imageUrl || null);
  const [useMainImageUrl, setUseMainImageUrl] = useState(!!(product?.main_image_url || product?.imageUrl) && !(product?.main_image_url || product?.imageUrl)?.includes('supabase.co'));
  
  // Legacy mockup states (for backward compatibility, will be removed)
  const [mockupImageUrls, setMockupImageUrls] = useState<string[]>(formData.mockup_images || []);
  const [mockupImageFiles, setMockupImageFiles] = useState<(File | null)[]>([]);
  const [mockupImagePreviews, setMockupImagePreviews] = useState<string[]>([]);
  const [mockupImageUseUrl, setMockupImageUseUrl] = useState<boolean[]>([]);
  const [mockupImageIsDragging, setMockupImageIsDragging] = useState<boolean[]>([]);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(product?.mockup_video_url || null);
  const [useVideoUrl, setUseVideoUrl] = useState(!!product?.mockup_video_url && !product?.mockup_video_url?.includes('supabase.co'));
  const [isVideoDragging, setIsVideoDragging] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [templatePreview, setTemplatePreview] = useState<{
    sizes: string[];
    colors: string[];
    previewUrl?: string;
  } | null>(null);

  // Auto-load template preview when editing a product with gelato_template_id
  useEffect(() => {
    const loadTemplatePreview = async () => {
      if (product && (product as any)?.gelato_template_id && !templatePreview) {
        const templateId = (product as any).gelato_template_id;
        setIsLoadingTemplate(true);
        try {
          const templateData = await api.getGelatoTemplate(templateId);
          const variants = templateData.variants || [];
          
          // Extract sizes and colors using utility function
          const { sizes, colors } = extractSizesAndColors(variants);
          
          setTemplatePreview({
            sizes,
            colors,
            previewUrl: templateData.previewUrl,
          });
        } catch (error: any) {
          console.error('Failed to load template preview:', error);
        } finally {
          setIsLoadingTemplate(false);
        }
      }
    };
    
    loadTemplatePreview();
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  // Main Image Handlers
  const handleMainImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, main_image_url: url });
    setMainImagePreview(url);
    setMainImageFile(null);
  };

  const handleMainImageFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }
    setMainImageFile(file);
    setFormData({ ...formData, main_image_url: '' });
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMainImageFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleMainImageFileSelect(file);
    }
  };

  const handleMainImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleMainImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleMainImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleMainImageFileSelect(file);
    }
  };

  const removeMainImage = () => {
    setMainImageFile(null);
    setMainImagePreview(null);
    setFormData({ ...formData, main_image_url: '' });
  };

  // Mockup Images Handlers - Color-based
  const handleMockupImageFileSelect = (color: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }
    
    const current = mockupImagesByColor[color] || { files: [], previews: [], existingUrls: [] };
    const totalImages = current.existingUrls.length + current.files.length;
    
    // Limit to 4 images per color
    if (totalImages >= 4) {
      alert(`Maximum 4 mockup images allowed per color. You already have ${totalImages} images for ${color}.`);
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setMockupImagesByColor(prev => {
        const currentState = prev[color] || { files: [], previews: [], existingUrls: current.existingUrls };
        return {
          ...prev,
          [color]: {
            files: [...currentState.files, file],
            previews: [...currentState.previews, reader.result as string],
            existingUrls: currentState.existingUrls, // Preserve existing URLs
          },
        };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleMockupImageRemove = (color: string, index: number) => {
    setMockupImagesByColor(prev => {
      const current = prev[color];
      if (!current) return prev;
      
      const existingCount = current.existingUrls.length;
      
      // If removing an existing image (index < existingCount)
      if (index < existingCount) {
        return {
          ...prev,
          [color]: {
            files: current.files,
            previews: [
              ...current.existingUrls.slice(0, index),
              ...current.existingUrls.slice(index + 1),
              ...current.previews.slice(existingCount)
            ],
            existingUrls: [
              ...current.existingUrls.slice(0, index),
              ...current.existingUrls.slice(index + 1)
            ],
          },
        };
      } else {
        // Removing a newly uploaded image
        const newIndex = index - existingCount;
        return {
          ...prev,
          [color]: {
            files: current.files.filter((_, i) => i !== newIndex),
            previews: [
              ...current.existingUrls,
              ...current.previews.slice(existingCount).filter((_, i) => i !== newIndex)
            ],
            existingUrls: current.existingUrls,
          },
        };
      }
    });
  };

  // Legacy Mockup Images Handlers (keeping for backward compatibility)
  const handleMockupImageAdd = () => {
    if (mockupImageUrls.length < 4) {
      setMockupImageUrls([...mockupImageUrls, '']);
      setMockupImageFiles([...mockupImageFiles, null]);
      setMockupImagePreviews([...mockupImagePreviews, '']);
      setMockupImageUseUrl([...mockupImageUseUrl, true]);
      setMockupImageIsDragging([...mockupImageIsDragging, false]);
    }
  };

  const handleMockupImageRemoveLegacy = (index: number) => {
    setMockupImageUrls(mockupImageUrls.filter((_, i) => i !== index));
    setMockupImageFiles(mockupImageFiles.filter((_, i) => i !== index));
    setMockupImagePreviews(mockupImagePreviews.filter((_, i) => i !== index));
    setMockupImageUseUrl(mockupImageUseUrl.filter((_, i) => i !== index));
    setMockupImageIsDragging(mockupImageIsDragging.filter((_, i) => i !== index));
  };

  const handleMockupImageUrlChange = (index: number, url: string) => {
    const newUrls = [...mockupImageUrls];
    newUrls[index] = url;
    setMockupImageUrls(newUrls);
    
    const newPreviews = [...mockupImagePreviews];
    newPreviews[index] = url;
    setMockupImagePreviews(newPreviews);
    
    const newFiles = [...mockupImageFiles];
    newFiles[index] = null;
    setMockupImageFiles(newFiles);
  };

  const handleMockupImageFileSelectLegacy = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }
    const newFiles = [...mockupImageFiles];
    newFiles[index] = file;
    setMockupImageFiles(newFiles);
    
    const newUrls = [...mockupImageUrls];
    newUrls[index] = '';
    setMockupImageUrls(newUrls);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPreviews = [...mockupImagePreviews];
      newPreviews[index] = reader.result as string;
      setMockupImagePreviews(newPreviews);
    };
    reader.readAsDataURL(file);
  };

  const handleMockupImageDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    const newDragging = [...mockupImageIsDragging];
    newDragging[index] = true;
    setMockupImageIsDragging(newDragging);
  };

  const handleMockupImageDragLeave = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    const newDragging = [...mockupImageIsDragging];
    newDragging[index] = false;
    setMockupImageIsDragging(newDragging);
  };

  const handleMockupImageDrop = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    const newDragging = [...mockupImageIsDragging];
    newDragging[index] = false;
    setMockupImageIsDragging(newDragging);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleMockupImageFileSelect(index, file);
    }
  };

  // Video Handlers
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, mockup_video_url: url });
    setVideoPreview(url);
    setVideoFile(null);
  };

  const handleVideoFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('Video size should be less than 50MB');
      return;
    }
    setVideoFile(file);
    setFormData({ ...formData, mockup_video_url: '' });
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoFileSelect(file);
    }
  };

  const handleVideoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsVideoDragging(true);
  };

  const handleVideoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsVideoDragging(false);
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsVideoDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleVideoFileSelect(file);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setFormData({ ...formData, mockup_video_url: '' });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert files to base64 if uploaded
      let finalMainImageUrl = formData.main_image_url;
      if (mainImageFile) {
        const base64Image = await convertFileToBase64(mainImageFile);
        finalMainImageUrl = base64Image; // Will be sent as imageFile to backend
      }

      // Convert mockup images by color (new approach)
      const mockupImagesByColorData: Record<string, string[]> = {};
      for (const [color, data] of Object.entries(mockupImagesByColor)) {
        const imageData: string[] = [];
        for (const file of data.files) {
          const base64Image = await convertFileToBase64(file);
          imageData.push(base64Image);
        }
        if (imageData.length > 0) {
          mockupImagesByColorData[color] = imageData;
        }
      }

      // Legacy mockup images (for backward compatibility)
      const finalMockupImages: string[] = [];
      for (let i = 0; i < mockupImageUrls.length; i++) {
        if (mockupImageFiles[i]) {
          const base64Image = await convertFileToBase64(mockupImageFiles[i]!);
          finalMockupImages.push(base64Image);
        } else if (mockupImageUrls[i]) {
          finalMockupImages.push(mockupImageUrls[i]);
        }
      }

      // Convert video
      let finalVideoUrl = formData.mockup_video_url;
      if (videoFile) {
        const base64Video = await convertFileToBase64(videoFile);
        finalVideoUrl = base64Video; // Will be sent as videoFile to backend
      }

      const productData: any = {
        category_id: formData.category_id,
        title: formData.title,
        description: formData.description,
        selling_price: Number(formData.selling_price),
        discount_percentage: formData.discount_percentage > 0 ? Number(formData.discount_percentage) : null,
        on_sale: formData.on_sale || false,
        sale_discount_percentage: formData.on_sale && formData.sale_discount_percentage > 0 ? Number(formData.sale_discount_percentage) : null,
        usp_tag: formData.usp_tag || null,
        gelato_template_id: formData.gelato_template_id || null,
        variants: {
          sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
          colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
        },
        // Mockup images organized by color
        mockup_images_by_color: Object.keys(mockupImagesByColorData).length > 0 ? mockupImagesByColorData : undefined,
      };

      // Handle main image (URL or file)
      if (mainImageFile) {
        productData.main_image_file = finalMainImageUrl;
      } else {
        productData.main_image_url = finalMainImageUrl;
      }

      // Handle mockup images
      if (finalMockupImages.length > 0) {
        productData.mockup_images = finalMockupImages.filter(img => img);
      }

      // Handle video (URL or file)
      if (videoFile) {
        productData.mockup_video_file = finalVideoUrl;
      } else if (finalVideoUrl) {
        productData.mockup_video_url = finalVideoUrl;
      }

      if(product && product.id) {
        await api.updateProduct(product.id, productData);
      } else {
        await api.createProduct(productData);
      }
      onSave();
    } catch (error: any) {
      alert(`Error: ${error.message || 'Failed to save product'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Initialize mockup images and previews when editing existing product
  useEffect(() => {
    // Legacy mockup images
    if (product?.mockup_images && product.mockup_images.length > 0) {
      setMockupImageUrls(product.mockup_images);
      setMockupImagePreviews(product.mockup_images);
      setMockupImageFiles(new Array(product.mockup_images.length).fill(null));
      setMockupImageUseUrl(product.mockup_images.map(url => !url.includes('supabase.co')));
      setMockupImageIsDragging(new Array(product.mockup_images.length).fill(false));
    }
    
    // Load color-based mockup images from variants
    if (product && (product as any)?.variants_with_mockups) {
      const variantsWithMockups = (product as any).variants_with_mockups as Record<string, string[]>;
      const loadedMockups: Record<string, { files: File[]; previews: string[]; existingUrls: string[] }> = {};
      
      Object.entries(variantsWithMockups).forEach(([color, urls]) => {
        if (Array.isArray(urls) && urls.length > 0) {
          loadedMockups[color] = {
            files: [],
            previews: urls, // Show existing URLs as previews
            existingUrls: urls, // Keep track of existing URLs
          };
        }
      });
      
      if (Object.keys(loadedMockups).length > 0) {
        setMockupImagesByColor(loadedMockups);
      }
    }
  }, [product]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Section */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4 text-brand-primary">{product ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-brand-primary mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <select 
              name="category_id" 
              value={formData.category_id} 
              onChange={handleChange} 
              className="w-full border-white/20 bg-brand-surface rounded-md p-2 text-sm text-brand-primary"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-brand-primary mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <Input 
              name="title" 
              placeholder="Product Title" 
              value={formData.title} 
              onChange={handleChange} 
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-brand-primary mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea 
              name="description" 
              placeholder="Product description" 
              value={formData.description} 
              onChange={handleChange} 
              required 
              className="w-full border-white/20 bg-brand-surface rounded-md p-2 text-sm text-brand-primary min-h-[100px]"
            />
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-sm font-semibold text-brand-primary mb-2">
              Selling Price ($) <span className="text-red-400">*</span>
            </label>
            <Input 
              name="selling_price" 
              type="number" 
              step="0.01"
              placeholder="35.00" 
              value={formData.selling_price} 
              onChange={handleChange} 
              required
            />
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block text-sm font-semibold text-brand-primary mb-2">
              Discount Percentage (%)
            </label>
            <Input 
              name="discount_percentage" 
              type="number" 
              step="0.01"
              min="0"
              max="100"
              placeholder="30" 
              value={formData.discount_percentage} 
              onChange={handleChange}
            />
            {formData.discount_percentage > 0 && (
              <p className="text-xs text-brand-secondary mt-1">
                Discounted price: ${(Number(formData.selling_price) * (1 - Number(formData.discount_percentage) / 100)).toFixed(2)}
              </p>
            )}
          </div>

          {/* On Sale Checkbox */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="on_sale"
                checked={formData.on_sale}
                onChange={handleChange}
                className="w-4 h-4 rounded border-white/20 bg-brand-surface text-brand-accent focus:ring-brand-accent"
              />
              <span className="text-sm font-semibold text-brand-primary">
                Mark as On Sale
              </span>
            </label>
            <p className="text-xs text-brand-secondary mt-1 ml-6">
              Additional sale discount will stack multiplicatively with regular discount
            </p>
          </div>

          {/* Sale Discount Percentage */}
          {formData.on_sale && (
            <div>
              <label className="block text-sm font-semibold text-brand-primary mb-2">
                Sale Discount Percentage (%) <span className="text-red-400">*</span>
              </label>
              <Input 
                name="sale_discount_percentage" 
                type="number" 
                step="0.01"
                min="0"
                max="100"
                placeholder="15" 
                value={formData.sale_discount_percentage} 
                onChange={handleChange}
                required={formData.on_sale}
              />
              {formData.sale_discount_percentage > 0 && (
                <p className="text-xs text-brand-secondary mt-1">
                  {(() => {
                    const regularDiscount = Number(formData.discount_percentage) || 0;
                    const saleDiscount = Number(formData.sale_discount_percentage) || 0;
                    const afterRegular = Number(formData.selling_price) * (1 - regularDiscount / 100);
                    const finalPrice = afterRegular * (1 - saleDiscount / 100);
                    const effectiveDiscount = regularDiscount > 0 || saleDiscount > 0
                      ? 100 - (100 - regularDiscount) * (100 - saleDiscount) / 100
                      : 0;
                    return `Final price: $${finalPrice.toFixed(2)} (${effectiveDiscount.toFixed(1)}% total discount)`;
                  })()}
                </p>
              )}
            </div>
          )}

          {/* USP Tag */}
          <div>
            <label className="block text-sm font-semibold text-brand-primary mb-2">
              USP Tag
            </label>
            <Input 
              name="usp_tag" 
              placeholder="e.g., 100% organic cotton" 
              value={formData.usp_tag} 
              onChange={handleChange}
            />
          </div>

          {/* Gelato Template ID */}
          <div>
            <label className="block text-sm font-semibold text-brand-primary mb-2">
              Gelato Template ID
            </label>
            <div className="flex gap-2">
              <Input 
                name="gelato_template_id" 
                placeholder="e.g., template_abc123" 
                value={formData.gelato_template_id} 
                onChange={handleChange}
                className="flex-1"
              />
              {formData.gelato_template_id && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    if (!formData.gelato_template_id) return;
                    setIsLoadingTemplate(true);
                    try {
                      const templateData = await api.getGelatoTemplate(formData.gelato_template_id);
                      const variants = templateData.variants || [];
                      
                      // Extract sizes and colors using utility function
                      const { sizes, colors } = extractSizesAndColors(variants);
                      
                      setTemplatePreview({
                        sizes,
                        colors,
                        previewUrl: templateData.previewUrl,
                      });
                      
                      // Auto-populate sizes and colors in formData for saving (but display from templatePreview)
                      if (sizes.length > 0) {
                        setFormData({
                          ...formData,
                          sizes: sizes.join(', '),
                        });
                      }
                      if (colors.length > 0) {
                        setFormData({
                          ...formData,
                          colors: colors.join(', '),
                        });
                      }
                      
                      // Update preview URL if available
                      if (templateData.previewUrl) {
                        setFormData({
                          ...formData,
                          gelato_preview_url: templateData.previewUrl,
                        });
                      }
                    } catch (error: any) {
                      alert(`Failed to load template: ${error.message}`);
                      setTemplatePreview(null);
                    } finally {
                      setIsLoadingTemplate(false);
                    }
                  }}
                  disabled={isLoadingTemplate || !formData.gelato_template_id}
                  className="whitespace-nowrap"
                  title="Load sizes and colors from Gelato template"
                >
                  {isLoadingTemplate ? 'Loading...' : 'Load from Gelato'}
                </Button>
              )}
              {formData.gelato_preview_url && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(formData.gelato_preview_url, '_blank')}
                  className="whitespace-nowrap"
                  title="View Gelato Preview"
                >
                  <LinkIcon className="w-4 h-4 mr-1" />
                  Preview
                </Button>
              )}
            </div>
            <p className="text-xs text-brand-secondary mt-1">
              Template ID from Gelato dashboard. Click "Load from Gelato" to preview available sizes and colors.
            </p>
            {templatePreview && (
              <div className="mt-2 space-y-3">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs font-semibold text-green-400 mb-3">✓ Template loaded successfully</p>
                  
                  {/* Sizes - Read-only */}
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-brand-primary mb-1">
                      Available Sizes (from Gelato)
                    </label>
                    <Input 
                      value={templatePreview.sizes.join(', ') || 'None'} 
                      readOnly
                      disabled
                      className="bg-brand-surface/50 text-brand-secondary cursor-not-allowed"
                    />
                  </div>
                  
                  {/* Colors - Read-only */}
                  <div>
                    <label className="block text-xs font-semibold text-brand-primary mb-1">
                      Available Colors (from Gelato)
                    </label>
                    <Input 
                      value={templatePreview.colors.join(', ') || 'None'} 
                      readOnly
                      disabled
                      className="bg-brand-surface/50 text-brand-secondary cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-semibold text-brand-primary mb-3">
              Main Image <span className="text-red-400">*</span>
            </label>

            {/* Toggle between URL and File Upload */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setUseMainImageUrl(true);
                  setMainImageFile(null);
                  if (formData.main_image_url) {
                    setMainImagePreview(formData.main_image_url);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  useMainImageUrl
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-brand-surface text-brand-secondary hover:text-brand-primary border border-white/10'
                }`}
              >
                <LinkIcon className="w-4 h-4 inline mr-2" />
                Use URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseMainImageUrl(false);
                  setFormData({ ...formData, main_image_url: '' });
                  if (mainImageFile) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setMainImagePreview(reader.result as string);
                    };
                    reader.readAsDataURL(mainImageFile);
                  } else {
                    setMainImagePreview(null);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !useMainImageUrl
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-brand-surface text-brand-secondary hover:text-brand-primary border border-white/10'
                }`}
              >
                <UploadCloudIcon className="w-4 h-4 inline mr-2" />
                Upload File
              </button>
            </div>

            {/* URL Input */}
            {useMainImageUrl && (
              <div className="space-y-3">
                <Input
                  name="main_image_url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.main_image_url}
                  onChange={handleMainImageUrlChange}
                  className="w-full"
                  required={!mainImageFile}
                />
                {mainImagePreview && (
                  <div className="relative inline-block">
                    <img 
                      src={mainImagePreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border-2 border-white/20"
                      onError={() => setMainImagePreview(null)}
                    />
                    <button
                      type="button"
                      onClick={removeMainImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* File Upload with Drag & Drop */}
            {!useMainImageUrl && (
              <div
                onDragOver={handleMainImageDragOver}
                onDragLeave={handleMainImageDragLeave}
                onDrop={handleMainImageDrop}
                className="border-2 border-dashed rounded-xl p-6 text-center transition-all border-white/20 bg-brand-surface/50 hover:border-purple-400/50"
              >
                {mainImagePreview ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img 
                        src={mainImagePreview} 
                        alt="Preview" 
                        className="w-48 h-48 object-cover rounded-lg border-2 border-white/20 mx-auto shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeMainImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm text-brand-primary font-medium">{mainImageFile?.name}</p>
                      <p className="text-xs text-brand-secondary">
                        {(mainImageFile?.size ? mainImageFile.size / 1024 : 0).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById('main-image-input')?.click()}
                      className="text-sm text-brand-accent hover:text-brand-accent-hover transition-colors"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <UploadCloudIcon className="w-12 h-12 text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-brand-primary font-medium mb-1">Drag & drop an image here</p>
                      <p className="text-xs text-brand-secondary mb-4">or</p>
                      <button
                        type="button"
                        onClick={() => document.getElementById('main-image-input')?.click()}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                      >
                        Browse Files
                      </button>
                      <p className="text-xs text-brand-secondary mt-2">Max size: 10MB</p>
                    </div>
                  </div>
                )}
                <input
                  id="main-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageFileInput}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Mockup Images */}
          <div>
            <label className="block text-sm font-semibold text-brand-primary mb-3">
              Mockup Images ({mockupImageUrls.length}/4)
            </label>
            <div className="space-y-4">
              {mockupImageUrls.map((url, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newUseUrl = [...mockupImageUseUrl];
                        newUseUrl[index] = true;
                        setMockupImageUseUrl(newUseUrl);
                        const newFiles = [...mockupImageFiles];
                        newFiles[index] = null;
                        setMockupImageFiles(newFiles);
                        if (mockupImageUrls[index]) {
                          const newPreviews = [...mockupImagePreviews];
                          newPreviews[index] = mockupImageUrls[index];
                          setMockupImagePreviews(newPreviews);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        mockupImageUseUrl[index]
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-brand-surface text-brand-secondary hover:text-brand-primary border border-white/10'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3 inline mr-1" />
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newUseUrl = [...mockupImageUseUrl];
                        newUseUrl[index] = false;
                        setMockupImageUseUrl(newUseUrl);
                        const newUrls = [...mockupImageUrls];
                        newUrls[index] = '';
                        setMockupImageUrls(newUrls);
                        if (mockupImageFiles[index]) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const newPreviews = [...mockupImagePreviews];
                            newPreviews[index] = reader.result as string;
                            setMockupImagePreviews(newPreviews);
                          };
                          reader.readAsDataURL(mockupImageFiles[index]!);
                        } else {
                          const newPreviews = [...mockupImagePreviews];
                          newPreviews[index] = '';
                          setMockupImagePreviews(newPreviews);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        !mockupImageUseUrl[index]
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-brand-surface text-brand-secondary hover:text-brand-primary border border-white/10'
                      }`}
                    >
                      <UploadCloudIcon className="w-3 h-3 inline mr-1" />
                      Upload
                    </button>
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => handleMockupImageRemoveLegacy(index)}
                      className="p-1.5 ml-auto"
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  </div>

                  {mockupImageUseUrl[index] ? (
                    <Input 
                      value={url} 
                      onChange={(e) => handleMockupImageUrlChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="text-xs"
                    />
                  ) : (
                    <div
                      onDragOver={(e) => handleMockupImageDragOverLegacy(index, e)}
                      onDragLeave={(e) => handleMockupImageDragLeaveLegacy(index, e)}
                      onDrop={(e) => handleMockupImageDropLegacy(index, e)}
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                        mockupImageIsDragging[index]
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/20 bg-brand-surface/50 hover:border-purple-400/50'
                      }`}
                    >
                      {mockupImagePreviews[index] ? (
                        <div className="space-y-2">
                          <img 
                            src={mockupImagePreviews[index]} 
                            alt={`Mockup ${index + 1}`} 
                            className="w-32 h-32 object-cover rounded-lg border-2 border-white/20 mx-auto"
                          />
                          <p className="text-xs text-brand-primary">{mockupImageFiles[index]?.name}</p>
                          <button
                            type="button"
                            onClick={() => document.getElementById(`mockup-image-input-${index}`)?.click()}
                            className="text-xs text-brand-accent hover:text-brand-accent-hover"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <UploadCloudIcon className="w-8 h-8 text-purple-400 mx-auto" />
                          <p className="text-xs text-brand-primary">Drag & drop or</p>
                          <button
                            type="button"
                            onClick={() => document.getElementById(`mockup-image-input-${index}`)?.click()}
                            className="text-xs px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg"
                          >
                            Browse
                          </button>
                        </div>
                      )}
                      <input
                        id={`mockup-image-input-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleMockupImageFileSelectLegacy(index, file);
                        }}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              ))}
              {mockupImageUrls.length < 4 && (
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={handleMockupImageAdd}
                  className="w-full"
                >
                  <PlusIcon className="w-4 h-4 inline mr-2" />
                  Add Mockup Image
                </Button>
              )}
            </div>
          </div>

          {/* Mockup Images by Color - New Section */}
          {templatePreview && templatePreview.colors.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-brand-primary mb-3">
                Mockup Images by Color
              </label>
              
              {/* Color Selection Dropdown */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-brand-primary mb-2">
                  Select Color for Mockup Images
                </label>
                <select
                  value={selectedColorForMockup}
                  onChange={(e) => setSelectedColorForMockup(e.target.value)}
                  className="w-full px-4 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Select a color --</option>
                  {templatePreview.colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Section (only shown when color is selected) */}
              {selectedColorForMockup && (
                <div className="mb-4">
                  <div
                    onDragOver={handleMockupImageDragOver}
                    onDragLeave={handleMockupImageDragLeave}
                    onDrop={(e) => handleMockupImageDrop(selectedColorForMockup, e)}
                    className="border-2 border-dashed rounded-lg p-6 text-center transition-all border-white/20 bg-brand-surface/50 hover:border-purple-400/50"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                          <UploadCloudIcon className="w-12 h-12 text-purple-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-brand-primary font-medium mb-1">
                          Upload mockup images for <span className="text-purple-400">{selectedColorForMockup}</span>
                        </p>
                        <p className="text-xs text-brand-secondary mb-4">Drag & drop images here or</p>
                        {(() => {
                          const currentColorData = mockupImagesByColor[selectedColorForMockup];
                          const currentImageCount = currentColorData 
                            ? currentColorData.existingUrls.length + currentColorData.files.length 
                            : 0;
                          const isMaxReached = currentImageCount >= 4;
                          
                          return (
                            <>
                              <button
                                type="button"
                                onClick={() => !isMaxReached && document.getElementById(`mockup-color-input-${selectedColorForMockup}`)?.click()}
                                disabled={isMaxReached}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  isMaxReached
                                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                                }`}
                                title={isMaxReached ? 'Maximum 4 images per color reached' : 'Browse Files'}
                              >
                                Browse Files
                              </button>
                              <p className="text-xs text-brand-secondary mt-2">
                                Max size: 10MB per image. Maximum 4 images per color.
                                {currentImageCount > 0 && (
                                  <span className="block mt-1 text-purple-400">
                                    Current: {currentImageCount} / 4 images
                                  </span>
                                )}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <input
                      id={`mockup-color-input-${selectedColorForMockup}`}
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={(() => {
                        const currentColorData = mockupImagesByColor[selectedColorForMockup];
                        const currentImageCount = currentColorData 
                          ? currentColorData.existingUrls.length + currentColorData.files.length 
                          : 0;
                        return currentImageCount >= 4;
                      })()}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => {
                          handleMockupImageFileSelect(selectedColorForMockup, file);
                        });
                        // Reset input to allow selecting same file again
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Image Previews by Color */}
              {Object.keys(mockupImagesByColor).length > 0 && (
                <div className="space-y-4">
                  {Object.entries(mockupImagesByColor).map(([color, data]) => {
                    const totalImages = data.previews.length;
                    if (totalImages === 0) return null;
                    
                    const existingCount = data.existingUrls.length;
                    
                    return (
                      <div key={color} className="p-4 bg-brand-surface/50 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-brand-primary">
                            {color} ({totalImages} / 4 {totalImages === 1 ? 'image' : 'images'})
                            {existingCount > 0 && (
                              <span className="text-xs text-brand-secondary ml-2">
                                ({existingCount} existing, {data.files.length} new)
                              </span>
                            )}
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {data.previews.map((preview, index) => {
                            const isExisting = index < existingCount;
                            const fileIndex = index - existingCount;
                            
                            return (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`${color} mockup ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border-2 border-white/20"
                                />
                                {isExisting && (
                                  <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                    Existing
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleMockupImageRemove(color, index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                  title={isExisting ? "Remove existing image (will be deleted on save)" : "Remove image"}
                                >
                                  <XIcon className="w-4 h-4" />
                                </button>
                                <p className="text-xs text-brand-secondary mt-1 truncate">
                                  {!isExisting && data.files[fileIndex]?.name ? data.files[fileIndex].name : `Image ${index + 1}`}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!selectedColorForMockup && Object.keys(mockupImagesByColor).length === 0 && (
                <p className="text-xs text-brand-secondary italic">
                  Select a color above to start uploading mockup images
                </p>
              )}
            </div>
          )}

          {/* Mockup Video */}
          <div>
            <label className="block text-sm font-semibold text-brand-primary mb-3">
              Mockup Video
            </label>

            {/* Toggle between URL and File Upload */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setUseVideoUrl(true);
                  setVideoFile(null);
                  if (formData.mockup_video_url) {
                    setVideoPreview(formData.mockup_video_url);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  useVideoUrl
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-brand-surface text-brand-secondary hover:text-brand-primary border border-white/10'
                }`}
              >
                <LinkIcon className="w-4 h-4 inline mr-2" />
                Use URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseVideoUrl(false);
                  setFormData({ ...formData, mockup_video_url: '' });
                  if (videoFile) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setVideoPreview(reader.result as string);
                    };
                    reader.readAsDataURL(videoFile);
                  } else {
                    setVideoPreview(null);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !useVideoUrl
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-brand-surface text-brand-secondary hover:text-brand-primary border border-white/10'
                }`}
              >
                <UploadCloudIcon className="w-4 h-4 inline mr-2" />
                Upload File
              </button>
            </div>

            {/* URL Input */}
            {useVideoUrl && (
              <div className="space-y-3">
                <Input
                  name="mockup_video_url"
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={formData.mockup_video_url}
                  onChange={handleVideoUrlChange}
                  className="w-full"
                />
                {videoPreview && (
                  <div className="relative inline-block">
                    <video 
                      src={videoPreview} 
                      controls
                      className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-white/20"
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* File Upload with Drag & Drop */}
            {!useVideoUrl && (
              <div
                onDragOver={handleVideoDragOver}
                onDragLeave={handleVideoDragLeave}
                onDrop={handleVideoDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isVideoDragging
                    ? 'border-purple-500 bg-purple-500/10 scale-105'
                    : 'border-white/20 bg-brand-surface/50 hover:border-purple-400/50'
                }`}
              >
                {videoPreview ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <video 
                        src={videoPreview} 
                        controls
                        className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-white/20 mx-auto shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm text-brand-primary font-medium">{videoFile?.name}</p>
                      <p className="text-xs text-brand-secondary">
                        {(videoFile?.size ? (videoFile.size / 1024 / 1024).toFixed(2) : 0)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById('video-input')?.click()}
                      className="text-sm text-brand-accent hover:text-brand-accent-hover transition-colors"
                    >
                      Change Video
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <UploadCloudIcon className="w-12 h-12 text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-brand-primary font-medium mb-1">Drag & drop a video here</p>
                      <p className="text-xs text-brand-secondary mb-4">or</p>
                      <button
                        type="button"
                        onClick={() => !videoPreview && !videoFile && document.getElementById('video-input')?.click()}
                        disabled={!!videoPreview || !!videoFile}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          (videoPreview || videoFile)
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                        }`}
                        title={(videoPreview || videoFile) ? 'Only 1 video allowed. Remove current video to upload a new one.' : 'Browse Files'}
                      >
                        Browse Files
                      </button>
                      <p className="text-xs text-brand-secondary mt-2">
                        Max size: 50MB. Only 1 video allowed.
                        {(videoPreview || videoFile) && (
                          <span className="block mt-1 text-purple-400">Video already selected</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                <input
                  id="video-input"
                  type="file"
                  accept="video/*"
                  disabled={!!videoPreview || !!videoFile}
                  onChange={handleVideoFileInput}
                  className="hidden"
                />
              </div>
            )}
          </div>


          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-white/10">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Preview Section */}
      <div className="lg:sticky lg:top-8 h-fit">
        <div className="mb-3">
          <h3 className="text-base font-semibold text-brand-primary">Live Preview</h3>
          <p className="text-xs text-brand-secondary">See how your product will appear</p>
        </div>
        <div className="flex justify-center lg:justify-start">
          <ProductCardPreview 
            formData={{
              ...formData,
              main_image_url: mainImagePreview || formData.main_image_url || ''
            }} 
            categories={categories} 
          />
        </div>
      </div>
    </div>
  );
};

const CategoryForm: React.FC<{ category?: Category | null, onSave: () => void, onCancel: () => void }> = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    imageUrl: category?.imageUrl || '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(category?.imageUrl || null);
  const [useUrl, setUseUrl] = useState(!!category?.imageUrl && !category?.imageUrl.includes('supabase.co'));
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateSlug = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name' && !category) {
      // Auto-generate slug from name when creating new category
      setFormData({ ...formData, name: value, slug: generateSlug(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = generateSlug(e.target.value);
    setFormData({ ...formData, slug });
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, imageUrl: url });
    setImagePreview(url);
    setImageFile(null);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    setImageFile(file);
    setFormData({ ...formData, imageUrl: '' });
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: '' });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let categoryData: any = {
        name: formData.name,
        slug: formData.slug,
      };

      // If file is selected, convert to base64 and send as imageFile
      if (imageFile) {
        const base64Image = await convertFileToBase64(imageFile);
        categoryData.imageFile = base64Image;
      } else if (formData.imageUrl) {
        // Otherwise use URL
        categoryData.imageUrl = formData.imageUrl;
      } else {
        alert('Please provide either an image file or image URL');
        setIsSubmitting(false);
        return;
      }

      if(category && category.id) {
        await api.updateCategory(category.id, categoryData);
      } else {
        await api.createCategory(categoryData);
      }
      onSave();
    } catch (error: any) {
      alert(`Error: ${error.message || 'Failed to save category'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-display font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          {category ? 'Edit Category' : 'Create New Category'}
        </h3>
        <p className="text-sm text-brand-secondary">Add a new category to your store</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Name */}
        <div>
          <label className="block text-sm font-semibold text-brand-primary mb-2">
            Category Name <span className="text-red-400">*</span>
          </label>
          <Input 
            name="name" 
            placeholder="e.g., T-Shirts, Hoodies, Accessories" 
            value={formData.name} 
            onChange={handleChange} 
            required
            className="w-full"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-semibold text-brand-primary mb-2">
            Slug <span className="text-red-400">*</span>
          </label>
          <Input 
            name="slug" 
            placeholder="t-shirts (auto-generated)" 
            value={formData.slug} 
            onChange={handleSlugChange} 
            required
            className="w-full"
          />
          <p className="mt-1 text-xs text-brand-secondary">URL-friendly identifier (auto-generated from name)</p>
        </div>

        {/* Image Section */}
        <div>
          <label className="block text-sm font-semibold text-brand-primary mb-3">
            Category Image <span className="text-red-400">*</span>
          </label>

          {/* Toggle between URL and File Upload */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setUseUrl(true);
                setImageFile(null);
                if (formData.imageUrl) {
                  setImagePreview(formData.imageUrl);
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                useUrl
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-brand-surface text-brand-secondary hover:text-brand-primary border border-white/10'
              }`}
            >
              <LinkIcon className="w-4 h-4 inline mr-2" />
              Use URL
            </button>
            <button
              type="button"
              onClick={() => {
                setUseUrl(false);
                setFormData({ ...formData, imageUrl: '' });
                if (imageFile) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                  };
                  reader.readAsDataURL(imageFile);
                } else {
                  setImagePreview(null);
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !useUrl
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-brand-surface text-brand-secondary hover:text-brand-primary border border-white/10'
              }`}
            >
              <UploadCloudIcon className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
          </div>

          {/* URL Input */}
          {useUrl && (
            <div className="space-y-3">
              <Input
                name="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={handleImageUrlChange}
                className="w-full"
              />
              {imagePreview && (
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg border-2 border-white/20"
                    onError={() => setImagePreview(null)}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* File Upload with Drag & Drop */}
          {!useUrl && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-500/10 scale-105'
                  : 'border-white/20 bg-brand-surface/50 hover:border-purple-400/50'
              }`}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-48 h-48 object-cover rounded-lg border-2 border-white/20 mx-auto shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm text-brand-primary font-medium">{imageFile?.name}</p>
                    <p className="text-xs text-brand-secondary">
                      {(imageFile?.size ? imageFile.size / 1024 : 0).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="text-sm text-brand-accent hover:text-brand-accent-hover transition-colors"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <UploadCloudIcon className="w-12 h-12 text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-brand-primary font-medium mb-1">
                      Drag & drop an image here, or click to browse
                    </p>
                    <p className="text-xs text-brand-secondary">
                      Supports: JPEG, PNG, WebP (Max 5MB)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    Select Image
                  </button>
                </div>
              )}
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || (!imageFile && !formData.imageUrl)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('categories'); // Categories first (hierarchy)
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load both categories and products on mount to ensure metrics are accurate
  // Backend uses cache-first approach: checks Redis cache, falls back to DB if miss, then updates cache
  useEffect(() => {
    // Fetch both in parallel for better performance
    Promise.all([
      fetchCategories(),
      fetchProducts()
    ]);
  }, []); // Only run on mount

  // Refetch products when switching to products tab (in case they were modified elsewhere)
  useEffect(() => {
    if (activeTab === 'products' && !productsLoading) {
      fetchProducts();
    }
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await api.deleteProduct(id);
      // Refetch both to ensure metrics are accurate
      // Backend invalidates cache on delete, so refetch gets fresh data
      await Promise.all([
        fetchCategories(),
        fetchProducts()
      ]);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    setShowForm(false);
    setEditingProduct(null);
    setEditingCategory(null);
    
    // Refetch both categories and products to ensure metrics are accurate
    // Backend will check cache first, then DB if cache miss, and update cache
    // After modifications, cache is invalidated/upserted, so refetch gets fresh data
    await Promise.all([
      fetchCategories(),
      fetchProducts()
    ]);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setEditingCategory(null);
  };

  const handleCategoryDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await api.deleteCategory(id);
      // Refetch both to ensure metrics are accurate
      // Backend invalidates cache on delete, so refetch gets fresh data
      await Promise.all([
        fetchCategories(),
        fetchProducts()
      ]);
    }
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCategoryAddNew = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  // Calculate stats
  const totalCategories = categories.length;
  const totalProducts = products.length;
  const avgProductsPerCategory = totalCategories > 0 ? (totalProducts / totalCategories).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-bg via-brand-bg to-purple-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Admin Console
              </h1>
              <p className="text-brand-secondary">Manage your store's categories and products</p>
            </div>
            {!showForm && (
              <Button 
                onClick={activeTab === 'products' ? handleAddNew : handleCategoryAddNew}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Add New {activeTab === 'products' ? 'Product' : 'Category'}
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          {!showForm && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-secondary mb-1">Total Categories</p>
                    <p className="text-3xl font-bold text-brand-primary">{totalCategories}</p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <TagIcon className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-secondary mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-brand-primary">{totalProducts}</p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <PackageIcon className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-secondary mb-1">Avg per Category</p>
                    <p className="text-3xl font-bold text-brand-primary">{avgProductsPerCategory}</p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <SparklesIcon className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Tabs */}
          {!showForm && (
            <div className="flex gap-2 mb-8 bg-brand-surface/50 backdrop-blur-sm rounded-xl p-2 border border-white/10">
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
                  activeTab === 'categories'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-brand-secondary hover:text-brand-primary hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <TagIcon className="w-5 h-5" />
                  <span>Categories</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
                  activeTab === 'products'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-brand-secondary hover:text-brand-primary hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <PackageIcon className="w-5 h-5" />
                  <span>Products</span>
                </div>
              </button>
            </div>
          )}
        </div>

      {showForm ? (
        activeTab === 'products' ? (
          <ProductForm product={editingProduct} onSave={handleSave} onCancel={handleCancel} categories={categories} />
        ) : (
          <CategoryForm category={editingCategory} onSave={handleSave} onCancel={handleCancel} />
        )
      ) : (
        <>
          {activeTab === 'categories' ? (
            // Categories View - Card Grid Layout
            categoriesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-48 bg-white/10 rounded-lg mb-4"></div>
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2"></div>
                  </Card>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <Card className="p-12 text-center">
                <TagIcon className="w-16 h-16 mx-auto mb-4 text-brand-secondary opacity-50" />
                <h3 className="text-xl font-semibold text-brand-primary mb-2">No Categories Yet</h3>
                <p className="text-brand-secondary mb-6">Create your first category to organize your products</p>
                <Button onClick={handleCategoryAddNew} className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <PlusIcon className="w-5 h-5 inline mr-2" />
                  Create Category
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                  <Card key={category.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-white/10">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={category.imageUrl} 
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Category+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-xs font-medium">{category.slug}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-display font-bold text-brand-primary mb-2">{category.name}</h3>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                        <span className="text-xs text-brand-secondary font-mono">{category.slug}</span>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            onClick={() => handleCategoryEdit(category)}
                            className="p-2 hover:bg-purple-500/10"
                            aria-label="Edit category"
                          >
                            <EditIcon className="w-4 h-4 text-brand-secondary hover:text-purple-400" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            onClick={() => handleCategoryDelete(category.id)}
                            className="p-2 hover:bg-red-500/10"
                            aria-label="Delete category"
                          >
                            <TrashIcon className="w-4 h-4 text-brand-secondary hover:text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            // Products View - Enhanced Table Layout
            productsLoading ? (
              <Card className="p-8">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="h-16 w-16 bg-white/10 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-white/10 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : products.length === 0 ? (
              <Card className="p-12 text-center">
                <PackageIcon className="w-16 h-16 mx-auto mb-4 text-brand-secondary opacity-50" />
                <h3 className="text-xl font-semibold text-brand-primary mb-2">No Products Yet</h3>
                <p className="text-brand-secondary mb-6">Add your first product to start selling</p>
                <Button onClick={handleAddNew} className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <PlusIcon className="w-5 h-5 inline mr-2" />
                  Create Product
                </Button>
              </Card>
            ) : (
              <Card className="overflow-hidden border-white/10">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                      <tr>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Product</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Price</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Gelato Status</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-brand-primary uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-brand-surface divide-y divide-white/10">
                      {products.map((product, index) => (
                        <tr 
                          key={product.id} 
                          className="hover:bg-white/5 transition-colors group"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4 text-left">
                            <div className="flex items-center justify-start gap-4">
                              <div className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 border-white/10 group-hover:border-purple-500/50 transition-colors">
                                <img 
                                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Product';
                                  }}
                                />
                              </div>
                              <div className="text-left">
                                <div className="text-sm font-semibold text-brand-primary group-hover:text-purple-400 transition-colors">
                                  {product.name}
                                </div>
                                <div className="text-xs text-brand-secondary mt-1 line-clamp-2 max-w-md">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <div className="flex items-baseline justify-start gap-2">
                              <span className="text-lg font-bold text-pink-500">${product.price.toFixed(2)}</span>
                              {product.originalPrice && (
                                <span className="text-xs text-brand-secondary line-through">
                                  ${product.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium">
                              <TagIcon className="w-3 h-3" />
                              {categories.find(c => c.slug === product.category)?.name || product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {(() => {
                              const gelatoTemplateId = (product as any)?.gelato_template_id;
                              const gelatoTemplateData = (product as any)?.gelato_template_data;
                              const gelatoProductId = (product as any)?.gelato_product_id;
                              const gelatoStatus = (product as any)?.gelato_status;
                              
                              // Check if product is synced with Gelato
                              const hasTemplateId = !!gelatoTemplateId;
                              const hasTemplateData = !!gelatoTemplateData && typeof gelatoTemplateData === 'object';
                              // Check if variants were extracted (sizes/colors exist in products.variants)
                              const hasVariants = product.variants && (
                                (product.variants.sizes && product.variants.sizes.length > 0) ||
                                (product.variants.colors && product.variants.colors.length > 0)
                              );
                              // Product is ready if it has gelato_product_id or status is active
                              const isReady = !!gelatoProductId || gelatoStatus === 'active';
                              
                              const isSynced = hasTemplateId && hasTemplateData && hasVariants && isReady;
                              
                              if (!hasTemplateId) {
                                return null; // No Gelato integration
                              }
                              
                              return (
                                <span className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  isSynced 
                                    ? 'bg-green-500/10 text-green-400' 
                                    : 'bg-yellow-500/10 text-yellow-400'
                                }`}>
                                  {isSynced ? (
                                    <>
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      Synced
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                      </svg>
                                      Pending
                                    </>
                                  )}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                variant="ghost" 
                                onClick={() => handleEdit(product)}
                                className="p-2 hover:bg-purple-500/10"
                                aria-label="Edit product"
                              >
                                <EditIcon className="w-4 h-4 text-brand-secondary group-hover:text-purple-400" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                onClick={() => handleDelete(product.id)}
                                className="p-2 hover:bg-red-500/10"
                                aria-label="Delete product"
                              >
                                <TrashIcon className="w-4 h-4 text-brand-secondary group-hover:text-red-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )
          )}
        </>
      )}
      </div>
    </div>
  );
};
