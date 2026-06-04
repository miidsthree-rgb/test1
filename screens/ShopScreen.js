import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../theme';
import { getCoins, hasExtraLifeUpgrade, hasExtendedTimerUpgrade, hasDoubleCoinsUpgrade, buyUpgrade } from '../utils/leaderboardHelper';

export default function ShopScreen() {
  const isFocused = useIsFocused();
  const [coins, setCoins] = useState(50);

  useEffect(() => {
    if (isFocused) {
      setCoins(getCoins());
    }
  }, [isFocused]);

  const handleBuyUpgrade = (upgradeId, cost) => {
    const success = buyUpgrade(upgradeId, cost);
    if (success) {
      setCoins(getCoins());
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cart-outline" size={40} color={theme.colors.primary} />
        <Text style={styles.title}>BOUTIQUE ARCADE</Text>
        <Text style={styles.subtitle}>Équipez-vous pour battre tous les records !</Text>
      </View>

      {/* Coins Indicator Header */}
      <View style={styles.shopCoinsHeader}>
        <Text style={styles.shopCoinsLabel}>Votre Solde :</Text>
        <View style={styles.coinsDisplay}>
          <Ionicons name="ellipse" size={12} color="#FBBF24" style={{ marginRight: 4 }} />
          <Text style={styles.coinsText}>{coins} 🪙</Text>
        </View>
      </View>

      {/* Upgrades List */}
      <Text style={styles.sectionTitle}>💡 UPGRADES PERMANENTS</Text>
      
      {/* Upgrade 1: Extra Life */}
      <View style={styles.shopItemCard}>
        <View style={styles.shopItemLeft}>
          <Ionicons name="heart" size={32} color={theme.colors.error} style={styles.shopItemIcon} />
          <View style={styles.shopItemDetails}>
            <Text style={styles.shopItemTitle}>Quatrième Cœur ❤️</Text>
            <Text style={styles.shopItemDesc}>Commencez vos parties avec 4 vies au lieu de 3 !</Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.buyBtn,
            hasExtraLifeUpgrade() && styles.buyBtnOwned,
            (coins < 50 && !hasExtraLifeUpgrade()) && styles.buyBtnDisabled,
            pressed && styles.buyBtnPressed
          ]}
          onPress={() => handleBuyUpgrade('extra_life', 50)}
          disabled={hasExtraLifeUpgrade() || coins < 50}
        >
          <Text style={styles.buyBtnText}>
            {hasExtraLifeUpgrade() ? 'ACQUIS' : '50 🪙'}
          </Text>
        </Pressable>
      </View>

      {/* Upgrade 2: Extended Timer */}
      <View style={styles.shopItemCard}>
        <View style={styles.shopItemLeft}>
          <Ionicons name="time" size={32} color={theme.colors.secondary} style={styles.shopItemIcon} />
          <View style={styles.shopItemDetails}>
            <Text style={styles.shopItemTitle}>Temps Étendu ⚡</Text>
            <Text style={styles.shopItemDesc}>Passez à 90s (au lieu de 60s) en traduction et 20s (au lieu de 15s) en questions !</Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.buyBtn,
            hasExtendedTimerUpgrade() && styles.buyBtnOwned,
            (coins < 75 && !hasExtendedTimerUpgrade()) && styles.buyBtnDisabled,
            pressed && styles.buyBtnPressed
          ]}
          onPress={() => handleBuyUpgrade('extended_timer', 75)}
          disabled={hasExtendedTimerUpgrade() || coins < 75}
        >
          <Text style={styles.buyBtnText}>
            {hasExtendedTimerUpgrade() ? 'ACQUIS' : '75 🪙'}
          </Text>
        </Pressable>
      </View>

      {/* Upgrade 3: Double Coins */}
      <View style={styles.shopItemCard}>
        <View style={styles.shopItemLeft}>
          <Ionicons name="ellipse" size={32} color="#FBBF24" style={styles.shopItemIcon} />
          <View style={styles.shopItemDetails}>
            <Text style={styles.shopItemTitle}>Double Pièces 🪙🪙</Text>
            <Text style={styles.shopItemDesc}>Gagnez 4 pièces d'or par bonne réponse au lieu de 2 !</Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.buyBtn,
            hasDoubleCoinsUpgrade() && styles.buyBtnOwned,
            (coins < 100 && !hasDoubleCoinsUpgrade()) && styles.buyBtnDisabled,
            pressed && styles.buyBtnPressed
          ]}
          onPress={() => handleBuyUpgrade('double_coins', 100)}
          disabled={hasDoubleCoinsUpgrade() || coins < 100}
        >
          <Text style={styles.buyBtnText}>
            {hasDoubleCoinsUpgrade() ? 'ACQUIS' : '100 🪙'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  scrollContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.white,
    marginTop: theme.spacing.sm,
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 242, 254, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
    alignSelf: 'flex-start',
    width: '100%',
  },
  coinsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  coinsText: {
    color: '#FBBF24',
    fontWeight: 'bold',
    fontSize: 13,
  },
  shopCoinsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    width: '100%',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  shopCoinsLabel: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 10,
  },
  shopItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.borderMuted,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    width: '100%',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shopItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  shopItemIcon: {
    marginRight: theme.spacing.sm,
  },
  shopItemDetails: {
    flex: 1,
  },
  shopItemTitle: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  shopItemDesc: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  buyBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 10,
    minWidth: 85,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderBottomWidth: 4,
    borderBottomColor: '#047857',
  },
  buyBtnOwned: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: theme.colors.success,
    borderBottomWidth: 2,
    elevation: 0,
    shadowOpacity: 0,
  },
  buyBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: '#064E3B',
    borderBottomWidth: 1.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  buyBtnPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 1.5,
  },
  buyBtnText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
});
