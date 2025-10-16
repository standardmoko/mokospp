import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { ProductRecommendation } from '@/types/ai-analysis';

interface RecommendationCardProps {
  product: ProductRecommendation;
  onPress?: (product: ProductRecommendation) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.75; // 75% of screen width
const imageHeight = 160;

export function RecommendationCard({ product, onPress }: RecommendationCardProps) {
  const handlePress = () => {
    onPress?.(product);
  };

  const formatPrice = () => {
    if (product.price.min === product.price.max) {
      return `$${product.price.min}`;
    }
    return `$${product.price.min} - $${product.price.max}`;
  };

  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      desk: 'desktopcomputer',
      chair: 'chair',
      lighting: 'lightbulb',
      storage: 'archivebox',
      decor: 'leaf',
      tech: 'display',
    };
    return iconMap[category] || 'square.grid.2x2';
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <IconSymbol key={i} name="star.fill" size={12} color={Colors.warning} />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <IconSymbol key="half" name="star.leadinghalf.filled" size={12} color={Colors.warning} />
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <IconSymbol key={`empty-${i}`} name="star" size={12} color={Colors.textLighter} />
      );
    }
    
    return stars;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityLabel={`${product.name} - ${formatPrice()}`}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {product.imageUrl.includes('placeholder') ? (
          // Show icon for placeholder images
          <View style={styles.placeholderImage}>
            <IconSymbol 
              name={getCategoryIcon(product.category)} 
              size={48} 
              color={Colors.primary} 
            />
          </View>
        ) : (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <IconSymbol 
            name={getCategoryIcon(product.category)} 
            size={14} 
            color={Colors.white} 
          />
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={[GlobalStyles.heading3, styles.productName]} numberOfLines={2}>
            {product.name}
          </ThemedText>
          {product.brand && (
            <ThemedText style={[GlobalStyles.bodySmall, styles.brand]}>
              {product.brand}
            </ThemedText>
          )}
        </View>

        {/* Description */}
        <ThemedText style={[GlobalStyles.bodyMedium, styles.description]} numberOfLines={3}>
          {product.description}
        </ThemedText>

        {/* Rating */}
        {product.rating && (
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderStars(product.rating)}
            </View>
            <ThemedText style={[GlobalStyles.bodySmall, styles.ratingText]}>
              {product.rating.toFixed(1)}
            </ThemedText>
          </View>
        )}

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {product.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <ThemedText style={[GlobalStyles.bodySmall, styles.tagText]}>
                {tag}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Price */}
        <View style={styles.footer}>
          <ThemedText style={[GlobalStyles.heading3, styles.price]}>
            {formatPrice()}
          </ThemedText>
          <IconSymbol name="chevron.right" size={16} color={Colors.textLighter} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: imageHeight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.small,
    padding: Spacing.xs,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  productName: {
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  brand: {
    color: Colors.textLight,
    fontWeight: '500',
  },
  description: {
    marginBottom: Spacing.md,
    lineHeight: 18,
    opacity: 0.8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stars: {
    flexDirection: 'row',
    marginRight: Spacing.sm,
  },
  ratingText: {
    fontWeight: '600',
    color: Colors.textLight,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.small,
  },
  tagText: {
    color: Colors.textLight,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
