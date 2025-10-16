import React from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { ProductRecommendation } from '@/types/ai-analysis';
import { RecommendationCard } from './recommendation-card';

interface RecommendationCarouselProps {
  recommendations: ProductRecommendation[];
}

export function RecommendationCarousel({ recommendations }: RecommendationCarouselProps) {
  const handleProductPress = (product: ProductRecommendation) => {
    // TODO: Implement product detail view or external link
    Alert.alert(
      product.name,
      `${product.description}\n\nPrice: $${product.price.min}${product.price.min !== product.price.max ? ` - $${product.price.max}` : ''}`,
      [
        { text: 'Close', style: 'cancel' },
        ...(product.purchaseUrl ? [{ 
          text: 'View Product', 
          onPress: () => {
            // TODO: Open external link in Phase 8
            Alert.alert('Coming Soon', 'External links will be available in the next update.');
          }
        }] : [])
      ]
    );
  };

  const renderRecommendationCard = ({ item }: { item: ProductRecommendation }) => (
    <RecommendationCard
      product={item}
      onPress={handleProductPress}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="exclamationmark.triangle" size={32} color={Colors.textLighter} />
      <ThemedText style={[GlobalStyles.bodyLarge, styles.emptyTitle]}>
        No Recommendations
      </ThemedText>
      <ThemedText style={[GlobalStyles.bodyMedium, styles.emptyMessage]}>
        We couldn&apos;t generate product recommendations for your workspace. 
        Please try running the analysis again.
      </ThemedText>
    </View>
  );

  if (!recommendations || recommendations.length === 0) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recommendations}
        renderItem={renderRecommendationCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={undefined} // Let it scroll freely
        decelerationRate="fast"
        getItemLayout={(data, index) => ({
          length: 280, // Approximate card width + margin
          offset: 280 * index,
          index,
        })}
      />
      
      {/* Scroll Indicator */}
      <View style={styles.scrollIndicator}>
        <IconSymbol name="chevron.left" size={16} color={Colors.textLighter} />
        <ThemedText style={[GlobalStyles.bodySmall, styles.scrollText]}>
          Swipe to see more
        </ThemedText>
        <IconSymbol name="chevron.right" size={16} color={Colors.textLighter} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  listContent: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm, // Less padding on right since cards have margin
  },
  scrollIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  scrollText: {
    color: Colors.textLighter,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    fontWeight: '600',
    color: Colors.textLight,
  },
  emptyMessage: {
    textAlign: 'center',
    color: Colors.textLighter,
    lineHeight: 20,
  },
});
