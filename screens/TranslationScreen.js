import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  Clipboard,
  KeyboardAvoidingView,
  Animated
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../theme';
import { checkHighScore, addHighScore, saveGameSession, getCoins, spendCoins, addCoins, hasExtraLifeUpgrade, hasExtendedTimerUpgrade, hasDoubleCoinsUpgrade } from '../utils/leaderboardHelper';

// Translation quiz data (40 curated grammar and translation traps)
const translationGameData = [
  {
    french: "Je suis d'accord avec toi.",
    options: [
      "I am agree with you.",
      "I agree with you.",
      "I am agreement with you."
    ],
    correctIndex: 1,
    explanation: "En anglais, 'agree' est directement un verbe. On dit donc 'I agree' et jamais 'I am agree' (qui est une traduction littérale de 'Je suis d'accord')."
  },
  {
    french: "Il a 25 ans.",
    options: [
      "He has 25 years.",
      "He is 25 years old.",
      "He is 25 years."
    ],
    correctIndex: 1,
    explanation: "Pour exprimer l'âge, l'anglais utilise l'auxiliaire 'be' (être) suivi de l'âge et de 'years old' (facultatif mais recommandé), pas le verbe 'have' (avoir)."
  },
  {
    french: "Je l'attends depuis ce matin.",
    options: [
      "I wait him since this morning.",
      "I have been waiting for him since this morning.",
      "I am waiting him from this morning."
    ],
    correctIndex: 1,
    explanation: "1. Le verbe 'wait' nécessite la préposition 'for' (wait for someone).\n2. Pour une action commencée dans le passé qui continue au présent, on utilise le Present Perfect Continuous ('have been waiting')."
  },
  {
    french: "Actuellement, j'habite à Lyon.",
    options: [
      "Actually, I live in Lyon.",
      "Currently, I live in Lyon.",
      "Presently, I am live at Lyon."
    ],
    correctIndex: 1,
    explanation: "Attention au faux-ami : 'Actually' signifie 'En fait' ou 'En réalité'. Pour dire 'Actuellement', on utilise 'Currently'."
  },
  {
    french: "Je vais lui téléphoner demain.",
    options: [
      "I am going to call to him tomorrow.",
      "I will phone at him tomorrow.",
      "I am going to call him tomorrow."
    ],
    correctIndex: 2,
    explanation: "Le verbe 'call' (ou 'phone') est transitif direct en anglais. On appelle quelqu'un directement : 'call someone' (sans la préposition 'to' ou 'at')."
  },
  {
    french: "C'est un film très intéressant.",
    options: [
      "It's a very interesting movie.",
      "It's a movie very interesting.",
      "It's a very interested movie."
    ],
    correctIndex: 0,
    explanation: "1. Les adjectifs se placent toujours AVANT le nom en anglais (interesting movie).\n2. On utilise le suffixe '-ing' pour qualifier une chose intéressante, et '-ed' pour exprimer le sentiment d'une personne (ex: I am interested)."
  },
  {
    french: "J'écoute de la musique.",
    options: [
      "I listen music.",
      "I am listening to music.",
      "I am listening music."
    ],
    correctIndex: 1,
    explanation: "Le verbe 'listen' nécessite la préposition 'to' devant son complément d'objet : 'listen to music / listen to me'."
  },
  {
    french: "En fait, c'est très facile.",
    options: [
      "Actually, it's very easy.",
      "Currently, it's very easy.",
      "In fact, it is make easy."
    ],
    correctIndex: 0,
    explanation: "Le mot 'Actually' signifie 'En réalité' ou 'En fait'. C'est le vrai équivalent de notre 'En fait'."
  },
  {
    french: "Je cherche mes clés.",
    options: [
      "I look my keys.",
      "I am looking for my keys.",
      "I search my keys."
    ],
    correctIndex: 1,
    explanation: "Le verbe pour exprimer la recherche est 'look for'. Dire 'look my keys' signifie 'regarder mes clés'."
  },
  {
    french: "Regarde cette photo !",
    options: [
      "Look at this photo!",
      "Look this photo!",
      "Watch at this photo!"
    ],
    correctIndex: 0,
    explanation: "Le verbe 'look' nécessite la préposition 'at' lorsqu'il a un complément direct de regard : 'look at something'."
  },
  {
    french: "Il est très fort en maths.",
    options: [
      "He is very good at math.",
      "He is very good in math.",
      "He is very good for math."
    ],
    correctIndex: 0,
    explanation: "En anglais, on utilise la préposition 'at' après l'adjectif 'good' ou 'bad' pour désigner une matière ou discipline : 'good at math / bad at sports'."
  },
  {
    french: "Elle travaille ici depuis 2018.",
    options: [
      "She works here since 2018.",
      "She is working here for 2018.",
      "She has been working here since 2018."
    ],
    correctIndex: 2,
    explanation: "Pour exprimer le bilan d'une action commencée dans le passé et toujours en cours, on utilise le Present Perfect. Comme on indique un point de départ précis ('2018'), on utilise 'since'."
  },
  {
    french: "Je ne l'ai pas encore vu.",
    options: [
      "I don't see him already.",
      "I haven't seen him yet.",
      "I didn't see him already."
    ],
    correctIndex: 1,
    explanation: "Dans les phrases négatives avec 'pas encore', on utilise l'adverbe 'yet' placé en fin de phrase, accompagné du Present Perfect ('haven't seen')."
  },
  {
    french: "J'ai beaucoup de devoirs ce soir.",
    options: [
      "I have a lot of homeworks tonight.",
      "I have a lot of homework tonight.",
      "I have many homeworks tonight."
    ],
    correctIndex: 1,
    explanation: "Le nom 'homework' est indénombrable (uncountable) en anglais. Il ne prend jamais de 's' à la fin et s'utilise au singulier."
  },
  {
    french: "Ces informations sont fausses.",
    options: [
      "These informations are false.",
      "This information is false.",
      "This informations are false."
    ],
    correctIndex: 1,
    explanation: "Le mot 'information' est indénombrable en anglais. Il s'accorde toujours au singulier : 'this information is' (et non 'these informations are')."
  },
  {
    french: "J'ai besoin de conseils.",
    options: [
      "I need some advice.",
      "I need advices.",
      "I need an advice."
    ],
    correctIndex: 0,
    explanation: "Le mot 'advice' est indénombrable. On ne peut pas dire 'advices' ou 'an advice'. On utilise 'some advice' ou 'a piece of advice'."
  },
  {
    french: "Les gens sont très accueillants ici.",
    options: [
      "People is very friendly here.",
      "The peoples are very friendly here.",
      "People are very friendly here."
    ],
    correctIndex: 2,
    explanation: "Le nom 'people' est un collectif qui est toujours pluriel en anglais. Le verbe doit donc être conjugué au pluriel : 'people are'."
  },
  {
    french: "Elle a de longs cheveux blonds.",
    options: [
      "She has long blond hairs.",
      "She has long blond hair.",
      "She has the long blond hair."
    ],
    correctIndex: 1,
    explanation: "Pour désigner la chevelure entière, 'hair' est indénombrable et reste au singulier. 'Hairs' (au pluriel) désigne des cheveux individuels (ex: des poils sur un manteau)."
  },
  {
    french: "Il fait froid aujourd'hui.",
    options: [
      "He is cold today.",
      "It is cold today.",
      "It makes cold today."
    ],
    correctIndex: 1,
    explanation: "Pour parler du temps ou de la météo, l'anglais utilise le pronom impersonnel 'It' suivi du verbe 'be' ('It is cold/hot/windy')."
  },
  {
    french: "Je vais me coucher car je suis fatigué.",
    options: [
      "I am going to sleep myself because I am tired.",
      "I am going to bed because I am tired.",
      "I go to sleep me because I am tired."
    ],
    correctIndex: 1,
    explanation: "Les verbes comme 'go to bed' ou 'go to sleep' ne sont pas réfléchis en anglais. Il ne faut pas traduire littéralement le 'me' français."
  },
  {
    french: "Je préfère voyager en train.",
    options: [
      "I prefer traveling by train.",
      "I prefer traveling in train.",
      "I prefer traveling with train."
    ],
    correctIndex: 0,
    explanation: "Pour exprimer le moyen de transport utilisé, on utilise la préposition 'by' suivie directement du moyen de transport : 'by train / by car / by plane'."
  },
  {
    french: "C'est sa voiture (à elle).",
    options: [
      "It's his car.",
      "It's her car.",
      "It's its car."
    ],
    correctIndex: 1,
    explanation: "En anglais, les adjectifs possessifs s'accordent avec le POSSESSEUR, pas avec l'objet possessé. Le possesseur étant une femme (elle), on utilise 'her'."
  },
  {
    french: "C'est son ordinateur (à lui).",
    options: [
      "It's her computer.",
      "It's his computer.",
      "It's its computer."
    ],
    correctIndex: 1,
    explanation: "Le possesseur étant un homme (lui), on utilise l'adjectif possessif 'his', peu importe le genre du mot ordinateur."
  },
  {
    french: "Je préfère le thé au café.",
    options: [
      "I prefer tea than coffee.",
      "I prefer tea or coffee.",
      "I prefer tea to coffee."
    ],
    correctIndex: 2,
    explanation: "Après le verbe 'prefer', on exprime la préférence entre deux éléments à l'aide de la préposition 'to' : 'I prefer A to B'."
  },
  {
    french: "Elle court plus vite que son frère.",
    options: [
      "She runs faster than her brother.",
      "She runs more fast than her brother.",
      "She runs faster as her brother."
    ],
    correctIndex: 0,
    explanation: "1. Pour les adjectifs courts d'une syllabe comme 'fast', le comparatif de supériorité se forme en ajoutant '-er' ('faster').\n2. 'Que' dans une comparaison se traduit par 'than'."
  },
  {
    french: "C'est le pire jour de ma vie.",
    options: [
      "It's the worse day of my life.",
      "It's the worst day of my life.",
      "It's the baddest day of my life."
    ],
    correctIndex: 1,
    explanation: "Le superlatif de l'adjectif irrégulier 'bad' (mauvais) est 'the worst' (le pire). 'Worse' est le comparatif (pire)."
  },
  {
    french: "Je n'ai pas d'argent sur moi.",
    options: [
      "I have no any money on me.",
      "I don't have any money on me.",
      "I don't have no money on me."
    ],
    correctIndex: 1,
    explanation: "En anglais, on évite la double négation. On dit soit 'I have no money', soit 'I don't have any money'."
  },
  {
    french: "Rien ne s'est passé hier.",
    options: [
      "Nothing didn't happen yesterday.",
      "Nothing happened yesterday.",
      "Nothing has passed yesterday."
    ],
    correctIndex: 1,
    explanation: "Le sujet 'Nothing' (Rien) contient déjà la négation. Le verbe doit donc rester à la forme affirmative pour éviter la double négation : 'Nothing happened'."
  },
  {
    french: "Tu devrais partir maintenant.",
    options: [
      "You should to leave now.",
      "You should leave now.",
      "You should leaving now."
    ],
    correctIndex: 1,
    explanation: "Le modal 'should' (devrais) est suivi directement de la base verbale du verbe (sans 'to' et sans '-ing')."
  },
  {
    french: "Il peut parler trois langues.",
    options: [
      "He can to speak three languages.",
      "He can speak three languages.",
      "He can speaks three languages."
    ],
    correctIndex: 1,
    explanation: "Le modal 'can' (peut) est suivi directement de la base verbale sans 'to', et ne prend jamais de 's' à la troisième personne."
  },
  {
    french: "Je veux qu'il vienne avec nous.",
    options: [
      "I want him to come with us.",
      "I want that he comes with us.",
      "I want him coming with us."
    ],
    correctIndex: 0,
    explanation: "Pour exprimer ce qu'on veut qu'une autre personne fasse, on utilise la structure : 'want + COD + to + verbe' (I want him to come)."
  },
  {
    french: "Elle m'a fait rire.",
    options: [
      "She made me to laugh.",
      "She made me laugh.",
      "She did me laugh."
    ],
    correctIndex: 1,
    explanation: "Le verbe causatif 'make' (au passé 'made') suivi d'un COD est construit avec une base verbale directe (sans 'to') : 'made me laugh'."
  },
  {
    french: "Laisse-moi t'aider.",
    options: [
      "Let me help you.",
      "Let me to help you.",
      "Leave me help you."
    ],
    correctIndex: 0,
    explanation: "1. 'Laisser faire' se traduit par 'let'.\n2. 'Let' est suivi du COD et de la base verbale sans 'to' (let me help)."
  },
  {
    french: "Je me réveille à 6 heures.",
    options: [
      "I wake up at 6 o'clock.",
      "I wake myself at 6 o'clock.",
      "I wake up on 6 o'clock."
    ],
    correctIndex: 0,
    explanation: "1. Le verbe 'wake up' n'est pas réfléchi en anglais.\n2. On indique l'heure à l'aide de la préposition 'at'."
  },
  {
    french: "Il est marié avec un médecin.",
    options: [
      "He is married with a doctor.",
      "He is married to a doctor.",
      "He is married at a doctor."
    ],
    correctIndex: 1,
    explanation: "En anglais, on utilise la préposition 'to' après l'adjectif 'married' pour indiquer l'union : 'married to someone'."
  },
  {
    french: "Je n'y peux rien.",
    options: [
      "I can do nothing about it.",
      "I can't do anything about it.",
      "I can do nothing there."
    ],
    correctIndex: 1,
    explanation: "Pour exprimer l'impuissance face à une situation, l'anglais utilise l'expression 'can't do anything about it'."
  },
  {
    french: "Il y a beaucoup de monde.",
    options: [
      "There is many people.",
      "There are many peoples.",
      "There are many people."
    ],
    correctIndex: 2,
    explanation: "Comme 'people' est pluriel, on doit accorder le présentateur au pluriel : 'There are' (et non 'There is')."
  },
  {
    french: "C'est facile à faire.",
    options: [
      "It's easy to do.",
      "It's easy for do.",
      "It's easy at do."
    ],
    correctIndex: 0,
    explanation: "Après un adjectif qualifiant une action, on utilise la préposition 'to' pour introduire l'infinitif : 'easy to do / hard to find'."
  },
  {
    french: "J'ai oublié mes clés à la maison.",
    options: [
      "I have forgotten my keys at home.",
      "I left my keys at home.",
      "I forgot my keys at home."
    ],
    correctIndex: 1,
    explanation: "Pour dire qu'on a 'laissé' un objet physique quelque part par oubli, on préfère utiliser le verbe 'leave' ('I left my keys at home') plutôt que 'forget'."
  },
  {
    french: "Elle est plus intelligente que lui.",
    options: [
      "She is more intelligent as him.",
      "She is more intelligent than him.",
      "She is intelligenter than him."
    ],
    correctIndex: 1,
    explanation: "1. Pour les adjectifs longs de plus de deux syllabes, on utilise 'more + adjectif'.\n2. La comparaison s'effectue avec 'than'."
  }
];

export default function TranslationScreen() {
  const [activeSubTab, setActiveSubTab] = useState('translator'); // 'translator' or 'game'
  const [blinkAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Translator States
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [direction, setDirection] = useState('FR_EN'); // 'FR_EN' or 'EN_FR'
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  // Game States
  const [unusedIndices, setUnusedIndices] = useState([]);
  const [gameIndex, setGameIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showGameFeedback, setShowGameFeedback] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // New arcade states
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [coins, setCoins] = useState(50);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const isFocused = useIsFocused();

  // Sync coins on tab focus
  useEffect(() => {
    if (isFocused) {
      setCoins(getCoins());
    }
  }, [isFocused]);

  // Arcade Streak States
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (activeSubTab === 'game' && isGameStarted && !gameFinished && !showGameFeedback && !isGameOver) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSubTab, gameFinished, showGameFeedback, isGameOver, gameIndex]);

  const handleTimeout = () => {
    setSelectedOption(-1); // special value for timeout
    setShowGameFeedback(true);
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) {
      setIsGameOver(true);
      saveGameSession('translation', currentStreak);
    }
  };

  // Initialize Game on Mount
  useEffect(() => {
    initializeGame();
  }, []);

  // Load history from localStorage if on Web
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const savedHistory = localStorage.getItem('translation_history');
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  const initializeGame = () => {
    const indices = Array.from({ length: translationGameData.length }, (_, i) => i);
    // Shuffle indices
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = indices[i];
      indices[i] = indices[j];
      indices[j] = temp;
    }
    const firstIdx = indices.pop();
    setUnusedIndices(indices);
    setGameIndex(firstIdx);
    setSelectedOption(null);
    setShowGameFeedback(false);
    setGameScore(0);
    setGameFinished(false);
    setIsGameOver(false);
    setCurrentStreak(0);
    setMaxStreak(0);
    setPlayerName('');
    setScoreSaved(false);

    // Reset new states based on upgrades
    const hasExtraLife = hasExtraLifeUpgrade();
    const hasExtendedTimer = hasExtendedTimerUpgrade();
    setLives(hasExtraLife ? 4 : 3);
    setTimeLeft(hasExtendedTimer ? 90 : 60);
    setUsedFiftyFifty(false);
    setHiddenOptions([]);
  };

  const saveHistoryItem = (original, translated, dir) => {
    const newItem = {
      id: Date.now().toString(),
      original,
      translated,
      direction: dir,
    };
    const updatedHistory = [newItem, ...history.filter(item => item.original !== original).slice(0, 4)]; // Keep last 5 unique items
    setHistory(updatedHistory);

    if (Platform.OS === 'web') {
      try {
        localStorage.setItem('translation_history', JSON.stringify(updatedHistory));
      } catch (e) {
        console.error('Failed to save history', e);
      }
    }
  };

  const handleTranslate = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setCopied(false);
    
    const langpair = direction === 'FR_EN' ? 'fr|en' : 'en|fr';
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${direction === 'FR_EN' ? 'fr' : 'en'}&tl=${direction === 'FR_EN' ? 'en' : 'fr'}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await response.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const result = data[0][0][0];
        setTranslation(result);
        saveHistoryItem(text, result, direction);
      } else {
        setError('Erreur lors de la traduction.');
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setDirection(prev => (prev === 'FR_EN' ? 'EN_FR' : 'FR_EN'));
    setText(translation);
    setTranslation(text);
    setError(null);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!translation) return;
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(translation);
    } else {
      Clipboard.setString(translation);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    setHistory([]);
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem('translation_history');
      } catch (e) {}
    }
  };

  const handleHistoryPress = (item) => {
    setText(item.original);
    setTranslation(item.translated);
    setDirection(item.direction);
    setError(null);
    setCopied(false);
  };

  // Game Logic
  const handleOptionSelect = (optionIndex) => {
    if (showGameFeedback) return;
    setSelectedOption(optionIndex);
  };

  const handleFiftyFifty = () => {
    if (usedFiftyFifty || showGameFeedback) return;
    if (coins < 10) return;
    const success = spendCoins(10);
    if (success) {
      setCoins(getCoins());
      const currentQ = translationGameData[gameIndex];
      const correctIdx = currentQ.correctIndex;
      const incorrectIndices = [0, 1, 2].filter(idx => idx !== correctIdx);
      const randomIncorrectToHide = incorrectIndices[Math.floor(Math.random() * incorrectIndices.length)];
      setHiddenOptions([randomIncorrectToHide]);
      setUsedFiftyFifty(true);
    }
  };

  const handleVerifyGame = () => {
    if (selectedOption === null) return;
    const currentQ = translationGameData[gameIndex];
    setShowGameFeedback(true);
    
    if (selectedOption === currentQ.correctIndex) {
      setGameScore(prev => prev + 10);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
      // Earn 2 coins for correct answer (4 if double coins upgrade owned)
      const hasDoubleCoins = hasDoubleCoinsUpgrade();
      const newCoins = addCoins(hasDoubleCoins ? 4 : 2);
      setCoins(newCoins);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setIsGameOver(true);
        saveGameSession('translation', currentStreak);
      }
    }
  };

  const handleNextGame = () => {
    setSelectedOption(null);
    setShowGameFeedback(false);

    if (isGameOver) {
      // Trigger game over screen
      setGameFinished(true);
      return;
    }

    // Reset timer and options
    const hasExtendedTimer = hasExtendedTimerUpgrade();
    setTimeLeft(hasExtendedTimer ? 90 : 60);
    setHiddenOptions([]);
    setUsedFiftyFifty(false);

    // Select next random non-repeating question
    let currentUnused = [...unusedIndices];
    if (currentUnused.length === 0) {
      // Refill and reshuffle
      currentUnused = Array.from({ length: translationGameData.length }, (_, i) => i);
      for (let i = currentUnused.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = currentUnused[i];
        currentUnused[i] = currentUnused[j];
        currentUnused[j] = temp;
      }
    }
    
    const nextIdx = currentUnused.pop();
    setUnusedIndices(currentUnused);
    setGameIndex(nextIdx);
  };

  const handleSaveHighScore = () => {
    if (!playerName.trim()) return;
    addHighScore(playerName, maxStreak, 'translation');
    setScoreSaved(true);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        
        {/* Toggle Mode Navigation Tab */}
        <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }}>
          <View style={styles.tabContainer}>
            <Pressable 
              style={[styles.tabButton, activeSubTab === 'translator' && styles.activeTabButton]}
              onPress={() => setActiveSubTab('translator')}
            >
              <Ionicons 
                name="language-outline" 
                size={18} 
                color={activeSubTab === 'translator' ? theme.colors.white : theme.colors.textMuted} 
              />
              <Text style={[styles.tabText, activeSubTab === 'translator' && styles.activeTabText]}>
                Traducteur
              </Text>
            </Pressable>
            <Pressable 
              style={[styles.tabButton, activeSubTab === 'game' && styles.activeTabButton]}
              onPress={() => setActiveSubTab('game')}
            >
              <Ionicons 
                name="play-outline" 
                size={18} 
                color={activeSubTab === 'game' ? theme.colors.white : theme.colors.textMuted} 
              />
              <Text style={[styles.tabText, activeSubTab === 'game' && styles.activeTabText]}>
                Jeu de Traduction
              </Text>
            </Pressable>
          </View>
        </View>

        {activeSubTab === 'translator' ? (
          /* ================= TRANSLATOR TAB ================= */
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.appTitle}>Tilio Translate</Text>

            {/* Language Selector Header */}
            <View style={styles.languageBar}>
              <Text style={styles.languageText}>
                {direction === 'FR_EN' ? 'Français' : 'Anglais'}
              </Text>
              <Pressable 
                style={({ pressed }) => [
                  styles.swapButton,
                  pressed && styles.swapButtonPressed
                ]} 
                onPress={handleSwap}
              >
                <Ionicons name="swap-horizontal" size={18} color={theme.colors.white} />
              </Pressable>
              <Text style={styles.languageText}>
                {direction === 'FR_EN' ? 'Anglais' : 'Français'}
              </Text>
            </View>

            {/* Input Card */}
            <View style={styles.card}>
              <TextInput
                className="notranslate"
                dataSet={{ translate: 'no' }}
                style={styles.input}
                placeholder={
                  direction === 'FR_EN' 
                    ? 'Saisissez votre texte en français...' 
                    : 'Enter your English text...'
                }
                placeholderTextColor={theme.colors.textMuted}
                value={text}
                onChangeText={setText}
                multiline
              />
              {text.length > 0 && (
                <Pressable style={styles.clearInputBtn} onPress={() => setText('')}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Main Action Button */}
            <Pressable 
              style={({ pressed }) => [
                styles.actionButton,
                (!text.trim() || loading) && styles.actionButtonDisabled,
                pressed && styles.actionButtonPressed
              ]}
              onPress={handleTranslate}
              disabled={!text.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Text style={styles.actionButtonText}>Traduire</Text>
              )}
            </Pressable>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={20} color={theme.colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Result Card */}
            {translation ? (
              <View style={[styles.card, styles.resultCard]}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>
                    {direction === 'FR_EN' ? 'Traduction en Anglais :' : 'Traduction en Français :'}
                  </Text>
                  <Pressable 
                    style={({ pressed }) => [
                      styles.iconButton,
                      pressed && styles.iconButtonPressed
                    ]} 
                    onPress={copyToClipboard}
                  >
                    <Ionicons 
                      name={copied ? "checkmark-circle" : "copy-outline"} 
                      size={16} 
                      color={copied ? theme.colors.success : theme.colors.primary} 
                    />
                    <Text 
                      className="notranslate"
                      dataSet={{ translate: 'no' }}
                      style={[styles.copyBtnText, copied && { color: theme.colors.success }]}
                    >
                      {copied ? 'Copié !' : 'Copier'}
                    </Text>
                  </Pressable>
                </View>
                <Text 
                  className="notranslate"
                  dataSet={{ translate: 'no' }}
                  style={styles.resultText}
                >
                  {translation}
                </Text>
              </View>
            ) : null}

            {/* History Section */}
            {history.length > 0 && (
              <View style={styles.historyContainer}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyTitleRow}>
                    <Ionicons name="time-outline" size={18} color={theme.colors.textMuted} />
                    <Text style={styles.historySectionTitle}>Historique Récent</Text>
                  </View>
                  <Pressable onPress={clearHistory}>
                    <Text style={styles.clearHistoryText}>Effacer</Text>
                  </Pressable>
                </View>

                {history.map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.historyCard,
                      pressed && styles.historyCardPressed
                    ]}
                    onPress={() => handleHistoryPress(item)}
                  >
                    <View style={styles.historyMeta}>
                      <Text style={styles.historyLangTag}>
                        {item.direction === 'FR_EN' ? 'FR ➔ EN' : 'EN ➔ FR'}
                      </Text>
                    </View>
                    <Text 
                      numberOfLines={1} 
                      style={styles.historyOriginal}
                      className="notranslate"
                      dataSet={{ translate: 'no' }}
                    >
                      {item.original}
                    </Text>
                    <Text 
                      numberOfLines={1} 
                      style={styles.historyTranslated}
                      className="notranslate"
                      dataSet={{ translate: 'no' }}
                    >
                      {item.translated}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>
        ) : (
          /* ================= TRANSLATION GAME TAB ================= */
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.appTitle}>Jeu de Traduction</Text>
            
            {!isGameStarted ? (
              // Start Game Landing Screen
              <View style={[styles.card, styles.startCard]}>
                <Ionicons name="game-controller" size={60} color={theme.colors.primary} style={{ marginBottom: 15 }} />
                <Text style={styles.startTitle}>TRADUCTION CHRONO</Text>
                <Text style={styles.startSubtitle}>
                  Testez votre anglais dans un défi de traduction sous haute tension. Répondez correctement avant la fin du temps imparti !
                </Text>
                
                <View style={styles.rulesContainer}>
                  <View style={styles.ruleRow}>
                    <Ionicons name="heart" size={18} color={theme.colors.error} style={{ marginRight: 10 }} />
                    <Text style={styles.ruleText}>{hasExtraLifeUpgrade() ? '4 Vies Actives' : '3 Vies de Départ'} (Upgrade disponible en Boutique)</Text>
                  </View>
                  <View style={styles.ruleRow}>
                    <Ionicons name="time" size={18} color={theme.colors.secondary} style={{ marginRight: 10 }} />
                    <Text style={styles.ruleText}>{hasExtendedTimerUpgrade() ? 'Temps Étendu (90s)' : 'Chrono : 60s par question'}</Text>
                  </View>
                  <View style={styles.ruleRow}>
                    <Ionicons name="ellipse" size={18} color="#FBBF24" style={{ marginRight: 10 }} />
                    <Text style={styles.ruleText}>Gagnez {hasDoubleCoinsUpgrade() ? '4 pièces 🪙' : '2 pièces 🪙'} par bonne réponse</Text>
                  </View>
                </View>

                <Pressable 
                  style={({ pressed }) => [styles.actionButton, styles.startGameBtn, pressed && styles.actionButtonPressed]}
                  onPress={() => {
                    initializeGame();
                    setIsGameStarted(true);
                  }}
                >
                  <Animated.Text style={[styles.actionButtonText, { opacity: blinkAnim }]}>
                    INSERT COIN / PRESS START 🎮
                  </Animated.Text>
                </Pressable>
              </View>
            ) : gameFinished ? (
              // Game Finished / Game Over Card
              <View style={[styles.card, styles.finishedCard]}>
                <Ionicons name="skull-outline" size={60} color={theme.colors.error} style={{ marginBottom: 10 }} />
                <Text style={styles.finishedTitle}>GAME OVER</Text>
                <Text style={styles.scoreText}>Score Final : {gameScore} pts</Text>
                <Text style={styles.streakText}>Série maximale : {maxStreak} réponses d'affilée 🔥</Text>
                
                {/* Arcade leaderboard capture form */}
                {checkHighScore(maxStreak, 'translation') ? (
                  !scoreSaved ? (
                    <View style={styles.highScoreBox}>
                      <Text style={styles.highScoreTitle}>✨ NOUVEAU RECORD CLASSEMENT ! ✨</Text>
                      <Text style={styles.highScoreSubtitle}>Entre ton prénom pour t'inscrire au panthéon :</Text>
                      <TextInput
                        className="notranslate"
                        dataSet={{ translate: 'no' }}
                        style={styles.highScoreInput}
                        placeholder="Ton prénom..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={playerName}
                        onChangeText={setPlayerName}
                        maxLength={12}
                      />
                      <Pressable
                        style={({ pressed }) => [
                          styles.saveScoreBtn,
                          !playerName.trim() && styles.saveScoreBtnDisabled,
                          pressed && styles.saveScoreBtnPressed
                        ]}
                        disabled={!playerName.trim()}
                        onPress={handleSaveHighScore}
                      >
                        <Text style={styles.saveScoreBtnText}>Enregistrer au Classement</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.highScoreBox}>
                      <Ionicons name="checkmark-circle" size={32} color={theme.colors.success} style={{ marginBottom: 6 }} />
                      <Text style={[styles.highScoreTitle, { color: theme.colors.success }]}>Score enregistré avec succès !</Text>
                      <Text style={styles.highScoreSubtitle}>Va voir l'onglet Classement pour voir ton rang ! 🏆</Text>
                    </View>
                  )
                ) : (
                  <Text style={styles.finishedSubtitle}>
                    Tu as fait une erreur et la série s'est arrêtée ! Retente ta chance pour grimper dans le classement ! 💪
                  </Text>
                )}

                <Pressable 
                  style={({ pressed }) => [styles.actionButton, styles.resetBtn, pressed && styles.actionButtonPressed]}
                  onPress={initializeGame}
                >
                  <Text style={styles.actionButtonText}>Recommencer la partie</Text>
                </Pressable>
              </View>
            ) : (
              // Active Game Screen
              <View style={{ position: 'relative', paddingBottom: 25 }}>
                {/* Score Bar */}
                <View style={styles.scoreBar}>
                  <Text style={styles.scoreBarText}>Série en cours : {currentStreak} 🔥</Text>
                  <Text style={styles.scoreBarText}>Score : {gameScore} pts</Text>
                </View>

                {/* Status Row (Lives, Coins & Timer) */}
                <View style={styles.statusRow}>
                  {/* Hearts */}
                  <View style={styles.heartsContainer}>
                    {Array.from({ length: hasExtraLifeUpgrade() ? 4 : 3 }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < lives ? "heart" : "heart-outline"}
                        size={22}
                        color={i < lives ? theme.colors.error : theme.colors.textMuted}
                        style={styles.heartIcon}
                      />
                    ))}
                  </View>

                  {/* Coins Display */}
                  <View style={styles.coinsDisplay}>
                    <Ionicons name="ellipse" size={12} color="#FBBF24" style={{ marginRight: 4 }} />
                    <Text style={styles.coinsText}>{coins} 🪙</Text>
                  </View>

                  {/* Timer Display */}
                  <View style={styles.timerContainer}>
                    <Ionicons name="time-outline" size={18} color={timeLeft <= 10 ? theme.colors.error : theme.colors.secondary} />
                    <Text style={[
                      styles.timerText,
                      timeLeft <= 10 && styles.timerTextWarning
                    ]}>
                      {timeLeft}s
                    </Text>
                  </View>
                </View>

                {/* Progress bar for Timer */}
                <View style={styles.timerBarOuter}>
                  <View style={[
                    styles.timerBarInner,
                    { width: `${(timeLeft / (hasExtendedTimerUpgrade() ? 90 : 60)) * 100}%` },
                    timeLeft <= 10 && { backgroundColor: theme.colors.error }
                  ]} />
                </View>

                {/* French Sentence Card */}
                <View style={styles.card}>
                  <Text style={styles.labelTitle}>Traduisez la phrase suivante :</Text>
                  <Text style={styles.gameFrenchText}>"{translationGameData[gameIndex].french}"</Text>
                </View>

                {/* Power-up Section */}
                <View style={styles.powerupRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.powerupBtn,
                      (usedFiftyFifty || coins < 10) && styles.powerupBtnDisabled,
                      pressed && styles.powerupBtnPressed
                    ]}
                    onPress={handleFiftyFifty}
                    disabled={usedFiftyFifty || coins < 10 || showGameFeedback}
                  >
                    <Ionicons name="sparkles-outline" size={16} color={usedFiftyFifty || coins < 10 ? theme.colors.textMuted : theme.colors.white} />
                    <Text style={[styles.powerupBtnText, (usedFiftyFifty || coins < 10) && styles.powerupBtnTextDisabled]}>
                      {usedFiftyFifty ? '50/50 Utilisé' : 'Bonus 50/50 (10 🪙)'}
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.labelTitle}>Sélectionnez la bonne option en anglais :</Text>
                
                {/* Options List */}
                {translationGameData[gameIndex].options.map((option, idx) => {
                  if (hiddenOptions.includes(idx)) return null;

                  const isOptSelected = selectedOption === idx;
                  const isCorrectAnswer = idx === translationGameData[gameIndex].correctIndex;
                  
                  let optionCardStyle = styles.optionCard;
                  let optionTextStyle = styles.optionText;

                  if (isOptSelected) {
                    optionCardStyle = [styles.optionCard, styles.optionCardSelected];
                  }

                  if (showGameFeedback) {
                    if (isCorrectAnswer) {
                      optionCardStyle = [styles.optionCard, styles.optionCardCorrect];
                      optionTextStyle = [styles.optionText, styles.optionTextCorrect];
                    } else if (isOptSelected) {
                      optionCardStyle = [styles.optionCard, styles.optionCardIncorrect];
                      optionTextStyle = [styles.optionText, styles.optionTextIncorrect];
                    }
                  }

                  return (
                    <Pressable
                      key={idx}
                      style={optionCardStyle}
                      onPress={() => handleOptionSelect(idx)}
                      disabled={showGameFeedback}
                    >
                      <View style={styles.optionIndicatorRow}>
                        <View style={[
                          styles.optionRadio, 
                          isOptSelected && styles.optionRadioSelected,
                          showGameFeedback && isCorrectAnswer && styles.optionRadioCorrect,
                          showGameFeedback && isOptSelected && !isCorrectAnswer && styles.optionRadioIncorrect
                        ]}>
                          {showGameFeedback && isCorrectAnswer && (
                            <Ionicons name="checkmark" size={14} color={theme.colors.white} />
                          )}
                          {showGameFeedback && isOptSelected && !isCorrectAnswer && (
                            <Ionicons name="close" size={14} color={theme.colors.white} />
                          )}
                        </View>
                        <Text 
                          className="notranslate"
                          dataSet={{ translate: 'no' }}
                          style={optionTextStyle}
                        >
                          {option}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}

                {/* Validation and Next Buttons */}
                {!showGameFeedback ? (
                  <Pressable 
                    style={({ pressed }) => [
                      styles.actionButton,
                      selectedOption === null && styles.actionButtonDisabled,
                      pressed && styles.actionButtonPressed
                    ]}
                    onPress={handleVerifyGame}
                    disabled={selectedOption === null}
                  >
                    <Text style={styles.actionButtonText}>Valider la réponse</Text>
                  </Pressable>
                ) : (
                  <View>
                    {/* Game Feedback Explanation */}
                    <View style={[
                      styles.feedbackBox, 
                      selectedOption === translationGameData[gameIndex].correctIndex 
                        ? styles.feedbackSuccess 
                        : styles.feedbackError
                    ]}>
                      <View style={styles.feedbackTitleRow}>
                        <Ionicons 
                          name={selectedOption === translationGameData[gameIndex].correctIndex ? "checkmark-circle-outline" : "close-circle-outline"} 
                          size={22} 
                          color={selectedOption === translationGameData[gameIndex].correctIndex ? theme.colors.success : theme.colors.error} 
                        />
                        <Text style={[
                          styles.feedbackTitle, 
                          { color: selectedOption === translationGameData[gameIndex].correctIndex ? theme.colors.success : theme.colors.error }
                        ]}>
                          {selectedOption === translationGameData[gameIndex].correctIndex 
                            ? 'Correct ! (+10 pts)' 
                            : selectedOption === -1 
                              ? 'Temps écoulé ! (-1 Vie)'
                              : lives <= 0 
                                ? 'Mauvaise réponse... Game Over !' 
                                : 'Mauvaise réponse... (-1 Vie)'}
                        </Text>
                      </View>
                      
                      <Text style={styles.feedbackExplainTitle}>Explication de la règle :</Text>
                      <Text 
                        className="notranslate"
                        dataSet={{ translate: 'no' }}
                        style={styles.feedbackExplainText}
                      >
                        {translationGameData[gameIndex].explanation}
                      </Text>
                    </View>

                    <Pressable 
                      style={({ pressed }) => [
                        styles.actionButton,
                        isGameOver ? styles.gameOverNextBtn : styles.gameNextButton,
                        pressed && styles.actionButtonPressed
                      ]}
                      onPress={handleNextGame}
                    >
                      <Text style={styles.actionButtonText}>
                        {isGameOver ? 'Terminer la partie (Game Over)' : 'Défi Suivant'}
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* Cheat code Easter Egg (Highlight/Surligner pour voir) */}
                <View style={styles.cheatContainer}>
                  <Text selectable={true} style={styles.cheatText}>
                    {translationGameData[gameIndex].options[translationGameData[gameIndex].correctIndex]}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
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
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.white,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 242, 254, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.sm,
    padding: 4,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.borderMuted,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary,
    borderBottomColor: theme.colors.primaryDark,
  },
  tabText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  activeTabText: {
    color: theme.colors.white,
  },
  languageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.borderMuted,
  },
  languageText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    width: 100,
    textAlign: 'center',
  },
  swapButton: {
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: '#059669',
    borderBottomWidth: 3.5,
    borderBottomColor: '#047857',
  },
  swapButtonPressed: {
    opacity: 0.8,
  },
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.borderMuted,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    position: 'relative',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    color: theme.colors.text,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    paddingRight: 30,
  },
  clearInputBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderBottomWidth: 5,
    borderBottomColor: '#047857',
    marginBottom: theme.spacing.md,
  },
  actionButtonPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 1.5,
  },
  actionButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: '#064E3B',
    borderBottomWidth: 1.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
    fontSize: 14,
  },
  resultCard: {
    marginTop: theme.spacing.lg,
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  resultTitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  resultText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.xs,
  },
  iconButtonPressed: {
    opacity: 0.7,
  },
  copyBtnText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  historyContainer: {
    marginTop: 30,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historySectionTitle: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  clearHistoryText: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  historyCardPressed: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.cardBgElevated,
  },
  historyMeta: {
    marginBottom: 4,
  },
  historyLangTag: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  historyOriginal: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  historyTranslated: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },

  /* ============ GAME STYLES ============ */
  scoreBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  scoreBarText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    marginRight: 4,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timerText: {
    color: theme.colors.secondary,
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 4,
  },
  timerTextWarning: {
    color: theme.colors.error,
  },
  timerBarOuter: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  timerBarInner: {
    height: '100%',
    backgroundColor: theme.colors.secondary,
  },
  powerupRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  powerupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
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
  powerupBtnDisabled: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  powerupBtnTextDisabled: {
    color: theme.colors.textMuted,
  },
  powerupBtnText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  powerupBtnTextUsed: {
    color: theme.colors.textMuted,
  },
  labelTitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  gameFrenchText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  optionCard: {
    backgroundColor: theme.colors.cardBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  optionCardCorrect: {
    borderColor: theme.colors.success,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  optionCardIncorrect: {
    borderColor: theme.colors.error,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
  },
  optionIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  optionRadioSelected: {
    borderColor: theme.colors.primary,
  },
  optionRadioCorrect: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success,
  },
  optionRadioIncorrect: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error,
  },
  optionText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  optionTextCorrect: {
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  optionTextIncorrect: {
    color: theme.colors.error,
    fontWeight: 'bold',
  },
  feedbackBox: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderColor: theme.colors.success,
  },
  feedbackError: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderColor: theme.colors.error,
  },
  feedbackTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  feedbackExplainTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: theme.spacing.sm,
  },
  feedbackExplainText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  gameNextButton: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
  },
  gameOverNextBtn: {
    backgroundColor: theme.colors.error,
    shadowColor: theme.colors.error,
  },
  finishedCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  finishedTitle: {
    color: theme.colors.error,
    fontSize: 28,
    fontWeight: '900',
    marginTop: theme.spacing.md,
    letterSpacing: 2,
  },
  scoreText: {
    color: theme.colors.primary,
    fontSize: 22,
    fontWeight: '900',
    marginVertical: theme.spacing.xs,
  },
  finishedSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  resetBtn: {
    width: '80%',
    marginBottom: 0,
    marginTop: theme.spacing.md,
  },

  /* Arcade Leaderboard styles */
  streakText: {
    fontSize: 18,
    color: theme.colors.secondary,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  highScoreBox: {
    width: '100%',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  highScoreTitle: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  highScoreSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  highScoreInput: {
    width: '90%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: 10,
    color: theme.colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  saveScoreBtn: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveScoreBtnDisabled: {
    backgroundColor: theme.colors.border,
  },
  saveScoreBtnPressed: {
    opacity: 0.8,
  },
  saveScoreBtnText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  cheatContainer: {
    position: 'absolute',
    bottom: -35,
    right: 0,
    padding: 10,
    zIndex: 999,
  },
  cheatText: {
    color: theme.colors.background,
    fontSize: 12,
    fontFamily: Platform.OS === 'web' ? 'Courier New' : 'monospace',
  },
  startCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  startTitle: {
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(16, 185, 129, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  startSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  rulesContainer: {
    width: '100%',
    backgroundColor: 'rgba(2, 44, 34, 0.3)',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  ruleText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  startGameBtn: {
    width: '90%',
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  blinkText: {
    color: theme.colors.primary,
    fontWeight: '950',
    fontSize: 13,
    letterSpacing: 3,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    opacity: 0.8,
  },
});
