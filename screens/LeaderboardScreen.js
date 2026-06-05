import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../theme';
import { getLeaderboard, clearLeaderboard, getStats, clearStats, fetchGlobalLeaderboard } from '../utils/leaderboardHelper';

export default function LeaderboardScreen() {
  const isFocused = useIsFocused();
  const [activeBoard, setActiveBoard] = useState('translation'); // 'translation', 'question', or 'stats'
  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (isFocused) {
      if (activeBoard === 'stats') {
        setStats(getStats());
      } else {
        // Load local copy immediately
        setScores(getLeaderboard(activeBoard));
        // Fetch global copy in background
        fetchGlobalLeaderboard(activeBoard).then((globalScores) => {
          if (globalScores) {
            setScores(globalScores);
          }
        });
      }
    }
  }, [isFocused, activeBoard]);



  const handleResetStats = () => {
    const cleared = clearStats();
    setStats(cleared);
  };

  const getRankEmoji = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '👾';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="game-controller-outline" size={40} color={theme.colors.primary} />
        <Text style={styles.title}>ARCADE HALL OF FAME</Text>
        <Text style={styles.subtitle}>Les champions de la série de réponses correctes</Text>
      </View>

      {/* Board Selector Tabs */}
      <View style={styles.boardToggleContainer}>
        <Pressable 
          style={[styles.boardToggleButton, activeBoard === 'translation' && styles.activeBoardButton]}
          onPress={() => setActiveBoard('translation')}
        >
          <Ionicons 
            name="language-outline" 
            size={16} 
            color={activeBoard === 'translation' ? theme.colors.white : theme.colors.textMuted} 
          />
          <Text style={[styles.boardToggleText, activeBoard === 'translation' && styles.activeBoardToggleText]}>
            Jeu Traduction
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.boardToggleButton, activeBoard === 'question' && styles.activeBoardButton]}
          onPress={() => setActiveBoard('question')}
        >
          <Ionicons 
            name="help-circle-outline" 
            size={16} 
            color={activeBoard === 'question' ? theme.colors.white : theme.colors.textMuted} 
          />
          <Text style={[styles.boardToggleText, activeBoard === 'question' && styles.activeBoardToggleText]}>
            Quiz Questions
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.boardToggleButton, activeBoard === 'stats' && styles.activeBoardButton]}
          onPress={() => setActiveBoard('stats')}
        >
          <Ionicons 
            name="bar-chart-outline" 
            size={16} 
            color={activeBoard === 'stats' ? theme.colors.white : theme.colors.textMuted} 
          />
          <Text style={[styles.boardToggleText, activeBoard === 'stats' && styles.activeBoardToggleText]}>
            Statistiques
          </Text>
        </Pressable>
      </View>

      {activeBoard === 'stats' ? (
        <View style={styles.statsContainer}>
          {/* Translation Stats Card */}
          <Text style={styles.sectionTitle}>🕹️ JEU DE TRADUCTION</Text>
          <View style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statsBox}>
                <Text style={styles.statsVal}>{stats.translationGames || 0}</Text>
                <Text style={styles.statsLbl}>Parties Jouées</Text>
              </View>
              <View style={styles.statsBox}>
                <Text style={styles.statsVal}>{stats.translationMaxStreak || 0}</Text>
                <Text style={styles.statsLbl}>Série Max 🔥</Text>
              </View>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statsBox}>
                <Text style={styles.statsVal}>
                  {stats.translationTotal > 0
                    ? `${Math.round((stats.translationCorrect / stats.translationTotal) * 100)}%`
                    : '0%'}
                </Text>
                <Text style={styles.statsLbl}>Précision</Text>
              </View>
              <View style={styles.statsBox}>
                <Text style={styles.statsVal}>
                  {stats.translationCorrect || 0}/{stats.translationTotal || 0}
                </Text>
                <Text style={styles.statsLbl}>Correct/Total</Text>
              </View>
            </View>
          </View>

          {/* Questions Stats Card */}
          <Text style={styles.sectionTitle}>❓ QUIZ DE QUESTIONS</Text>
          <View style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statsBox}>
                <Text style={styles.statsVal}>{stats.questionGames || 0}</Text>
                <Text style={styles.statsLbl}>Parties Jouées</Text>
              </View>
              <View style={styles.statsBox}>
                <Text style={styles.statsVal}>{stats.questionMaxStreak || 0}</Text>
                <Text style={styles.statsLbl}>Série Max 🔥</Text>
              </View>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statsBox}>
                <Text style={styles.statsVal}>
                  {stats.questionTotal > 0
                    ? `${Math.round((stats.questionCorrect / stats.questionTotal) * 100)}%`
                    : '0%'}
                </Text>
                <Text style={styles.statsLbl}>Précision</Text>
              </View>
              <View style={styles.statsBox}>
                <Text style={styles.statsVal}>
                  {stats.questionCorrect || 0}/{stats.questionTotal || 0}
                </Text>
                <Text style={styles.statsLbl}>Correct/Total</Text>
              </View>
            </View>
          </View>

          {/* Reset Stats Button */}
          <Pressable 
            style={({ pressed }) => [
              styles.resetButton,
              { marginTop: 20 },
              pressed && styles.resetButtonPressed
            ]}
            onPress={handleResetStats}
          >
            <Ionicons name="refresh-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.resetButtonText}>Réinitialiser les statistiques</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Flashing Arcade Text */}
          <View style={styles.glowingBar}>
            <Text style={styles.glowingText}>🏆 MEILLEURES SÉRIES D'AFFILÉE 🏆</Text>
          </View>

          {/* Leaderboard Card */}
          <View style={styles.card}>
            {/* Table Headers */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.headerCol, styles.colRank]}>RANG</Text>
              <Text style={[styles.headerCol, styles.colName]}>JOUEUR</Text>
              <Text style={[styles.headerCol, styles.colStreak, { textAlign: 'right' }]}>SÉRIE</Text>
              <Text style={[styles.headerCol, styles.colDate, { textAlign: 'right' }]}>DATE</Text>
            </View>

            <View style={styles.divider} />

            {/* Scores Rows */}
            {scores.length > 0 ? (
              scores.map((item, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.tableRow,
                    index === 0 && styles.tableRowGold,
                    index === scores.length - 1 && { borderBottomWidth: 0 } // No border on last row
                  ]}
                >
                  <Text style={[styles.cellText, styles.colRank, styles.colRankFont]}>
                    {getRankEmoji(index)} {index + 1}
                  </Text>
                  <Text 
                    className="notranslate"
                    dataSet={{ translate: 'no' }}
                    style={[
                      styles.cellText, 
                      styles.colName, 
                      styles.nameFont,
                      index === 0 && styles.goldText
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.cellText, styles.colStreak, styles.streakFont, { textAlign: 'right' }]}>
                    {item.streak} pts
                  </Text>
                  <Text style={[styles.cellText, styles.colDate, styles.dateFont, { textAlign: 'right' }]}>
                    {item.date}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyTableRow}>
                <Text style={styles.emptyTableText}>
                  Aucun score enregistré. Jouez pour inscrire le premier record ! 👾
                </Text>
              </View>
            )}
          </View>

          {/* Retro Flashing Screen Bottom Detail */}
          <Text style={styles.blinkText}>INSERT COIN TO PLAY</Text>


        </>
      )}
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
  },
  glowingBar: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: theme.spacing.md,
    width: '100%',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  glowingText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    fontSize: 14,
  },
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.borderMuted,
    padding: theme.spacing.md,
    width: '100%',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: theme.spacing.lg,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  headerCol: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  divider: {
    height: 2,
    backgroundColor: theme.colors.borderMuted,
    marginVertical: theme.spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  tableRowGold: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
  },
  cellText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  colRank: {
    width: 75,
  },
  colRankFont: {
    fontWeight: 'bold',
  },
  colName: {
    flex: 1.2,
  },
  nameFont: {
    fontWeight: '700',
  },
  goldText: {
    color: theme.colors.warning,
  },
  colStreak: {
    width: 70,
  },
  streakFont: {
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  colDate: {
    width: 90,
  },
  dateFont: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  blinkText: {
    color: theme.colors.textMuted,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 3,
    marginVertical: theme.spacing.lg,
    opacity: 0.7,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.borderMuted,
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginTop: theme.spacing.sm,
  },
  resetButtonPressed: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderColor: theme.colors.error,
  },
  resetButtonText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginLeft: 6,
  },
  emptyTableRow: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTableText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  boardToggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.sm,
    padding: 4,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.borderMuted,
    width: '100%',
  },
  boardToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeBoardButton: {
    backgroundColor: theme.colors.primary,
    borderBottomColor: theme.colors.primaryDark,
  },
  boardToggleText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  activeBoardToggleText: {
    color: theme.colors.white,
  },
  statsContainer: {
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  statsCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.borderMuted,
    padding: theme.spacing.md,
    width: '100%',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  statsBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.borderMuted,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statsVal: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsLbl: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
