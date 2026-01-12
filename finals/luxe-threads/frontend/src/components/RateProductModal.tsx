import React, { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import { Button } from './ui';
import { XIcon } from './icons';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

interface RateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  orderNumber: string;
  existingRating?: number;
  onRatingSubmitted?: () => void;
}

export const RateProductModal: React.FC<RateProductModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  orderNumber,
  existingRating,
  onRatingSubmitted,
}) => {
  const [rating, setRating] = useState(existingRating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating);
    }
  }, [existingRating]);

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get order ID from order number first
      const order = await api.getOrderByNumber(orderNumber);
      
      await api.submitRating({
        product_id: productId,
        order_id: order.id,
        rating,
      });

      showToast(
        existingRating ? 'Rating updated successfully!' : 'Thank you for rating!',
        'success'
      );
      
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
      
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to submit rating', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-brand-surface rounded-lg shadow-xl max-w-md w-full p-6 border border-white/10 animate-popIn">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h3 className="text-xl font-bold text-brand-primary">
              Rate Product
            </h3>
            <p className="text-sm text-brand-secondary mt-1 line-clamp-2">
              {productName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-brand-secondary hover:text-brand-primary transition-colors"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Rating */}
        <div className="flex flex-col items-center py-6">
          <p className="text-brand-secondary mb-4">
            {existingRating ? 'Update your rating' : 'How would you rate this product?'}
          </p>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size="lg"
          />
          {rating > 0 && (
            <p className="text-brand-primary font-semibold mt-3">
              {rating} {rating === 1 ? 'Star' : 'Stars'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? 'Submitting...' : existingRating ? 'Update Rating' : 'Submit Rating'}
          </Button>
        </div>
      </div>
    </div>
  );
};
