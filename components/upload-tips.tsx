import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { PHOTO_UPLOAD_TIPS, PhotoUploadTip } from '@/types/photo';

interface UploadTipsProps {
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

export function UploadTips({ isExpanded = false, onToggle }: UploadTipsProps) {
  const [expanded, setExpanded] = useState(isExpanded);

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  const essentialTips = PHOTO_UPLOAD_TIPS.filter(tip => tip.type === 'essential');
  const otherTips = PHOTO_UPLOAD_TIPS.filter(tip => tip.type !== 'essential');

  return (
    <View style={[GlobalStyles.card, styles.container]}>
      <TouchableOpacity 
        style={styles.header}
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} photo tips`}
      >
        <View style={styles.headerContent}>
          <IconSymbol 
            name="lightbulb" 
            size={20} 
            color={Colors.primary} 
          />
          <ThemedText style={[GlobalStyles.cardTitle, styles.title]}>
            Photo Tips
          </ThemedText>
        </View>
        
        <IconSymbol 
          name={expanded ? 'chevron.up' : 'chevron.down'} 
          size={16} 
          color={Colors.textLight} 
        />
      </TouchableOpacity>

      {/* Always show essential tips */}
      <View style={styles.tipsContainer}>
        {essentialTips.map((tip) => (
          <TipItem key={tip.id} tip={tip} />
        ))}
      </View>

      {/* Show additional tips when expanded */}
      {expanded && (
        <View style={styles.tipsContainer}>
          <View style={styles.separator} />
          {otherTips.map((tip) => (
            <TipItem key={tip.id} tip={tip} />
          ))}
        </View>
      )}
    </View>
  );
}

interface TipItemProps {
  tip: PhotoUploadTip;
}

function TipItem({ tip }: TipItemProps) {
  const getTypeColor = (type: PhotoUploadTip['type']) => {
    switch (type) {
      case 'essential': return Colors.primary;
      case 'recommended': return Colors.secondary;
      case 'optional': return Colors.textLight;
      default: return Colors.textLight;
    }
  };

  return (
    <View style={styles.tipItem}>
      <View style={styles.tipIcon}>
        <IconSymbol 
          name={tip.icon as any} 
          size={16} 
          color={getTypeColor(tip.type)} 
        />
      </View>
      
      <View style={styles.tipContent}>
        <ThemedText style={[GlobalStyles.bodyMedium, styles.tipTitle]}>
          {tip.title}
        </ThemedText>
        <ThemedText style={[GlobalStyles.bodySmall, styles.tipDescription]}>
          {tip.description}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: Spacing.sm,
    marginBottom: 0,
  },
  tipsContainer: {
    marginTop: Spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  tipIcon: {
    width: 24,
    alignItems: 'center',
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  tipTitle: {
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  tipDescription: {
    opacity: 0.8,
    lineHeight: 18,
  },
});
