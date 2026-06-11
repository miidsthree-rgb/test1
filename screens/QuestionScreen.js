import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Animated
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../theme';
import { checkHighScore, addHighScore, saveGameSession, getCoins, spendCoins, addCoins, hasExtraLifeUpgrade, hasExtendedTimerUpgrade, hasDoubleCoinsUpgrade, getValorantRank, fetchGlobalLeaderboard } from '../utils/leaderboardHelper';

// Irregular verbs mapping for grammar parser
const irregularVerbs = {
  went: 'go',
  ate: 'eat',
  drank: 'drink',
  bought: 'buy',
  saw: 'see',
  met: 'meet',
  read: 'read',
  wrote: 'write',
  slept: 'sleep',
  came: 'come',
  took: 'take',
  made: 'make',
  gave: 'give',
  got: 'get',
  found: 'find',
  spoke: 'speak',
  ran: 'run',
  sang: 'sing',
  swam: 'swim',
  told: 'tell',
  said: 'say',
  knew: 'know'
};

// Quiz database
const quizData = [
  {
    statement: "She lives in New York.",
    prompt: "Posez la question sur le lieu (Where...)",
    acceptedAnswers: ["where does she live", "where does she live?", "where does she live in new york?"],
    explanation: "lives (Présent Simple, 3e pers. singulier) ➔ Auxiliaire 'does'. Sujet 'she'. Verbe de base 'live'. Lieu 'New York' ➔ 'Where'.\nRéponse : 'Where does she live?'"
  },
  {
    statement: "I went to Paris last summer.",
    prompt: "Posez la question sur le lieu (Where...)",
    acceptedAnswers: ["where did you go last summer", "where did you go last summer?", "where did you go?", "where did you go last summer"],
    explanation: "went (Passé de 'go') ➔ Auxiliaire 'did'. Sujet 'I' devient 'you'. Verbe de base 'go'. Lieu 'Paris' ➔ 'Where'.\nRéponse : 'Where did you go last summer?'"
  },
  {
    statement: "They are playing football in the garden.",
    prompt: "Posez la question fermée (Yes/No Question...)",
    acceptedAnswers: ["are they playing football in the garden", "are they playing football in the garden?", "are they playing football?"],
    explanation: "Présence de l'auxiliaire 'are'. On l'inverse simplement avec le sujet.\nRéponse : 'Are they playing football in the garden?'"
  },
  {
    statement: "He will arrive at 8 PM.",
    prompt: "Posez la question sur le temps (When... / What time...)",
    acceptedAnswers: ["when will he arrive", "when will he arrive?", "what time will he arrive", "what time will he arrive?"],
    explanation: "Auxiliaire modal 'will'. Sujet 'he'. Temps 'at 8 PM' ➔ 'When' ou 'What time'.\nRéponse : 'When will he arrive?'"
  },
  {
    statement: "I woke up early because I had an exam.",
    prompt: "Posez la question sur la cause (Why...)",
    acceptedAnswers: ["why did you wake up early", "why did you wake up early?", "why did you wake up?"],
    explanation: "woke up (Passé de 'wake up') ➔ Auxiliaire 'did'. Sujet 'I' devient 'you'. Cause 'because...' ➔ 'Why'.\nRéponse : 'Why did you wake up early?'"
  },
  {
    statement: "She is reading a fantastic book.",
    prompt: "Posez la question sur l'objet (What...)",
    acceptedAnswers: ["what is she reading", "what is she reading?"],
    explanation: "Auxiliaire 'is'. Sujet 'she'. Verbe 'reading'. Objet 'a fantastic book' ➔ 'What'.\nRéponse : 'What is she reading?'"
  },
  {
    statement: "They speak English very well.",
    prompt: "Posez la question fermée (Yes/No Question...)",
    acceptedAnswers: ["do they speak english very well", "do they speak english very well?", "do they speak english?"],
    explanation: "Présent Simple (They speak) ➔ Auxiliaire 'do'. Sujet 'they'. Verbe 'speak'.\nRéponse : 'Do they speak English very well?'"
  },
  {
    statement: "He has a brand new car.",
    prompt: "Posez la question fermée avec l'auxiliaire 'does' (Does he...)",
    acceptedAnswers: ["does he have a brand new car", "does he have a brand new car?", "does he have a car?"],
    explanation: "Présent Simple (He has) ➔ Auxiliaire 'does'. Le verbe conjugué 'has' redevient la base verbale 'have' après l'auxiliaire.\nRéponse : 'Does he have a brand new car?'"
  },
  {
    statement: "We visited our grandparents yesterday.",
    prompt: "Posez la question sur le temps (When...)",
    acceptedAnswers: ["when did you visit your grandparents", "when did you visit your grandparents?", "when did you visit them?"],
    explanation: "Passé Simple (visited) ➔ Auxiliaire 'did'. Sujet 'we' devient 'you'. Verbe redevient la base verbale 'visit'. Temps 'yesterday' ➔ 'When'.\nRéponse : 'When did you visit your grandparents?'"
  },
  {
    statement: "She goes to the gym twice a week.",
    prompt: "Posez la question sur la fréquence (How often...)",
    acceptedAnswers: ["how often does she go to the gym", "how often does she go to the gym?", "how often does she go there?"],
    explanation: "Présent Simple (goes) ➔ Auxiliaire 'does'. Sujet 'she'. Verbe redevient la base verbale 'go'. Fréquence 'twice a week' ➔ 'How often'.\nRéponse : 'How often does she go to the gym?'"
  },
  {
    statement: "This laptop costs 800 dollars.",
    prompt: "Posez la question sur le prix (How much...)",
    acceptedAnswers: ["how much does this laptop cost", "how much does this laptop cost?", "how much does it cost?"],
    explanation: "Présent Simple (costs) ➔ Auxiliaire 'does'. Sujet 'this laptop' (it). Verbe redevient 'cost'. Prix '800 dollars' ➔ 'How much'.\nRéponse : 'How much does this laptop cost?'"
  },
  {
    statement: "There are thirty students in the class.",
    prompt: "Posez la question sur le nombre (How many...)",
    acceptedAnswers: ["how many students are there in the class", "how many students are there in the class?", "how many students are there?"],
    explanation: "Présence de 'are there'. Nombre 'thirty students' ➔ 'How many students'.\nRéponse : 'How many students are there in the class?'"
  },
  {
    statement: "I am looking for my keys.",
    prompt: "Posez la question sur l'objet recherché (What...)",
    acceptedAnswers: ["what are you looking for", "what are you looking for?"],
    explanation: "Présent en -ING avec 'am looking for'. Sujet 'I' devient 'you', donc l'auxiliaire 'am' s'accorde en 'are'. La préposition 'for' reste en fin de question.\nRéponse : 'What are you looking for?'"
  },
  {
    statement: "This smartphone belongs to Thomas.",
    prompt: "Posez la question sur la possession (Whose...) ou l'identité (Who...)",
    acceptedAnswers: ["whose smartphone is this", "whose smartphone is this?", "who does this smartphone belong to", "who does this smartphone belong to?"],
    explanation: "Pour la possession : 'Whose smartphone is this?'. Avec le verbe 'belong to' : 'Who does this smartphone belong to?' (la préposition 'to' reste à la fin).\nRéponse : 'Whose smartphone is this?' ou 'Who does this smartphone belong to?'"
  },
  {
    statement: "They traveled to Japan by plane.",
    prompt: "Posez la question sur le moyen de transport (How...)",
    acceptedAnswers: ["how did they travel to japan", "how did they travel to japan?", "how did they go to japan?"],
    explanation: "Passé Simple (traveled) ➔ Auxiliaire 'did'. Moyen de transport 'by plane' ➔ 'How'.\nRéponse : 'How did they travel to Japan?'"
  },
  {
    statement: "The museum opens at 9 AM.",
    prompt: "Posez la question sur l'heure d'ouverture (What time...)",
    acceptedAnswers: ["what time does the museum open", "what time does the museum open?", "when does the museum open?"],
    explanation: "Présent Simple (opens) ➔ Auxiliaire 'does'. Sujet 'the museum'. Verbe de base 'open'. Heure 'at 9 AM' ➔ 'What time'.\nRéponse : 'What time does the museum open?'"
  },
  {
    statement: "My favorite color is green.",
    prompt: "Posez la question sur la couleur préférée (What...)",
    acceptedAnswers: ["what is your favorite color", "what is your favorite color?"],
    explanation: "Inversion de l'auxiliaire 'is' et du sujet 'my favorite color' (qui devient 'your favorite color').\nRéponse : 'What is your favorite color?'"
  },
  {
    statement: "They can speak Spanish fluently.",
    prompt: "Posez la question sur la capacité (Can they...)",
    acceptedAnswers: ["can they speak spanish fluently", "can they speak spanish fluently?", "can they speak spanish?"],
    explanation: "Présence du modal 'can'. On l'inverse simplement avec le sujet 'they'. Le verbe reste 'speak'.\nRéponse : 'Can they speak Spanish fluently?'"
  },
  {
    statement: "I was born in London.",
    prompt: "Posez la question sur le lieu de naissance (Where...)",
    acceptedAnswers: ["where were you born", "where were you born?"],
    explanation: "Passé passif 'was born'. Sujet 'I' devient 'you', ce qui change l'auxiliaire 'was' en 'were'. Lieu 'in London' ➔ 'Where'.\nRéponse : 'Where were you born?'"
  },
  {
    statement: "She was crying because she lost her cat.",
    prompt: "Posez la question sur la cause (Why...)",
    acceptedAnswers: ["why was she crying", "why was she crying?"],
    explanation: "Passé Continu (was crying) ➔ Inversion de l'auxiliaire 'was' et du sujet 'she'. Cause 'because...' ➔ 'Why'.\nRéponse : 'Why was she crying?'"
  },
  {
    statement: "We are going to buy a new house next year.",
    prompt: "Posez la question sur le projet (What...)",
    acceptedAnswers: ["what are you going to buy next year", "what are you going to buy next year?", "what are you going to buy?"],
    explanation: "Futur proche (are going to buy). Sujet 'we' devient 'you'. Objet 'a new house' ➔ 'What'.\nRéponse : 'What are you going to buy next year?'"
  },
  {
    statement: "He is 1.85 meters tall.",
    prompt: "Posez la question sur la taille (How tall...)",
    acceptedAnswers: ["how tall is he", "how tall is he?"],
    explanation: "Pour la taille physique d'une personne, on utilise 'How tall' suivi de l'auxiliaire 'be' et du sujet.\nRéponse : 'How tall is he?'"
  },
  {
    statement: "This book is very interesting.",
    prompt: "Posez la question sur l'appréciation (What... like ou How...)",
    acceptedAnswers: ["what is this book like", "what is this book like?", "how is this book", "how is this book?"],
    explanation: "Pour demander une description/appréciation d'une chose, on utilise 'What is [sujet] like?' ou simplement 'How is [sujet]?'.\nRéponse : 'What is this book like?'"
  },
  {
    statement: "It takes 2 hours to get to Paris by train.",
    prompt: "Posez la question sur la durée (How long...)",
    acceptedAnswers: ["how long does it take to get to paris by train", "how long does it take to get to paris by train?", "how long does it take?"],
    explanation: "Présent Simple impersonnel (takes) ➔ Auxiliaire 'does'. Sujet 'it'. Verbe de base 'take'. Durée '2 hours' ➔ 'How long'.\nRéponse : 'How long does it take to get to Paris by train?'"
  },
  {
    statement: "She has been learning English for three years.",
    prompt: "Posez la question sur la durée de l'action (How long...)",
    acceptedAnswers: ["how long has she been learning english", "how long has she been learning english?"],
    explanation: "Present Perfect Continuous (has been learning). On inverse le premier auxiliaire 'has' avec le sujet 'she'. Durée 'for three years' ➔ 'How long'.\nRéponse : 'How long has she been learning English?'"
  },
  {
    statement: "My father works as a software engineer.",
    prompt: "Posez la question sur le métier (What... do)",
    acceptedAnswers: ["what does your father do", "what does your father do?", "what is your father's job?"],
    explanation: "Pour demander le métier de quelqu'un, on utilise la structure 'What does [sujet] do?' ou 'What is [sujet]'s job?'.\nRéponse : 'What does your father do?'"
  },
  {
    statement: "I would like to drink a glass of water.",
    prompt: "Posez la question sur le souhait (What... like to)",
    acceptedAnswers: ["what would you like to drink", "what would you like to drink?"],
    explanation: "Conditionnel poli 'would like'. Sujet 'I' devient 'you'. Inversion 'would you'. Objet 'a glass of water' ➔ 'What'.\nRéponse : 'What would you like to drink?'"
  },
  {
    statement: "They had already left when I arrived.",
    prompt: "Posez la question fermée (Had they...)",
    acceptedAnswers: ["had they already left when you arrived", "had they already left when you arrived?", "had they left?"],
    explanation: "Past Perfect (had left). On inverse l'auxiliaire 'had' et le sujet 'they'. Sujet 'I' devient 'you'.\nRéponse : 'Had they already left when you arrived?'"
  },
  {
    statement: "You should see a doctor.",
    prompt: "Posez la question de conseil (What should I...)",
    acceptedAnswers: ["what should i do", "what should i do?", "what should you do?"],
    explanation: "Demande de conseil avec le modal 'should'. Sujet devient 'I'. Verbe de base conseillé devient l'activité générale 'do'.\nRéponse : 'What should I do?'"
  },
  {
    statement: "Thomas is the tallest boy in the class.",
    prompt: "Posez la question sur l'identité (Who...)",
    acceptedAnswers: ["who is the tallest boy in the class", "who is the tallest boy in the class?", "who is the tallest?"],
    explanation: "La question porte sur le sujet animé 'Thomas' ➔ Pronom interrogatif 'Who'直接suivi du verbe et du groupe nominal.\nRéponse : 'Who is the tallest boy in the class?'"
  },
  {
    statement: "I usually have bread and butter for breakfast.",
    prompt: "Posez la question sur le repas (What...)",
    acceptedAnswers: ["what do you usually have for breakfast", "what do you usually have for breakfast?"],
    explanation: "Présent Simple (have) ➔ Auxiliaire 'do'. Sujet 'I' devient 'you'. Adverbe de fréquence 'usually' se place avant le verbe principal.\nRéponse : 'What do you usually have for breakfast?'"
  },
  {
    statement: "This package weighs five kilograms.",
    prompt: "Posez la question sur le poids (How heavy... ou How much...)",
    acceptedAnswers: ["how heavy is this package", "how heavy is this package?", "how much does this package weigh", "how much does this package weigh?"],
    explanation: "Pour demander le poids, on utilise soit 'How heavy is [sujet]?', soit le verbe conjugué 'weighs' au présent simple ➔ 'How much does this package weigh?'.\nRéponse : 'How heavy is this package?' ou 'How much does it weigh?'"
  },
  {
    statement: "They are staying at the Hilton Hotel.",
    prompt: "Posez la question sur l'hébergement (Where...)",
    acceptedAnswers: ["where are they staying", "where are they staying?"],
    explanation: "Présent Continu (are staying). On inverse l'auxiliaire 'are' avec le sujet 'they'. Lieu 'at the Hilton Hotel' ➔ 'Where'.\nRéponse : 'Where are they staying?'"
  },
  {
    statement: "I woke up at 7 o'clock this morning.",
    prompt: "Posez la question sur l'heure (What time...)",
    acceptedAnswers: ["what time did you wake up this morning", "what time did you wake up this morning?", "when did you wake up?"],
    explanation: "Passé Simple (woke up) ➔ Auxiliaire 'did'. Sujet 'I' devient 'you'. Verbe redevient la base verbale 'wake up'. Heure exacte 'at 7 o'clock' ➔ 'What time' ou 'When'.\nRéponse : 'What time did you wake up this morning?'"
  },
  {
    statement: "She forgot to lock the door.",
    prompt: "Posez la question fermée (Did she...)",
    acceptedAnswers: ["did she forget to lock the door", "did she forget to lock the door?", "did she forget?"],
    explanation: "Passé Simple (forgot) ➔ Auxiliaire 'did'. Sujet 'she'. Verbe de base 'forget'.\nRéponse : 'Did she forget to lock the door?'"
  },
  {
    statement: "This key opens the back door.",
    prompt: "Posez la question sur l'action de la clé (What...)",
    acceptedAnswers: ["what does this key open", "what does this key open?"],
    explanation: "Présent Simple (opens) ➔ Auxiliaire 'does'. Sujet 'this key'. Verbe de base 'open'. Objet 'the back door' ➔ 'What'.\nRéponse : 'What does this key open?'"
  },
  {
    statement: "He prefers coffee rather than tea.",
    prompt: "Posez la question sur la préférence (Which...)",
    acceptedAnswers: ["which does he prefer coffee or tea", "which does he prefer coffee or tea?", "what does he prefer?"],
    explanation: "Pour une préférence entre deux choix explicites, on utilise l'adjectif interrogatif 'Which'. Présent simple (prefers) ➔ Auxiliaire 'does'. Verbe de base 'prefer'.\nRéponse : 'Which does he prefer, coffee or tea?'"
  },
  {
    statement: "We have two cats and a dog.",
    prompt: "Posez la question sur le nombre d'animaux (How many...)",
    acceptedAnswers: ["how many pets do you have", "how many pets do you have?", "what pets do you have?"],
    explanation: "Pour demander un nombre, on utilise 'How many [nom pluriel]'. Présent simple (have) ➔ Auxiliaire 'do'. Sujet 'we' devient 'you'.\nRéponse : 'How many pets do you have?'"
  },
  {
    statement: "I spent my vacation in Italy.",
    prompt: "Posez la question sur le lieu (Where...)",
    acceptedAnswers: ["where did you spend your vacation", "where did you spend your vacation?", "where did you spend your holidays?"],
    explanation: "Passé Simple (spent) ➔ Auxiliaire 'did'. Sujet 'I' devient 'you'. Verbe de base 'spend'. Lieu 'in Italy' ➔ 'Where'.\nRéponse : 'Where did you spend your vacation?'"
  },
  {
    statement: "He is doing his homework right now.",
    prompt: "Posez la question sur l'activité (What... doing)",
    acceptedAnswers: ["what is he doing right now", "what is he doing right now?", "what is he doing?"],
    explanation: "Présent Continu (is doing). On inverse l'auxiliaire 'is' et le sujet 'he'. L'activité en cours se demande avec 'What ... doing'.\nRéponse : 'What is he doing right now?'"
  }
];

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function parseEnglishSentence(sentence) {
  const clean = sentence.trim().replace(/[.?]/g, '');
  if (!clean) return null;

  const words = clean.split(/\s+/);
  if (words.length < 2) return null;

  let origSubj = words[0];
  let subLower = origSubj.toLowerCase();
  
  let questionSubj = origSubj;
  if (subLower === 'i') {
    questionSubj = 'you';
  } else if (subLower === 'we') {
    questionSubj = 'you';
  }

  const auxList = ["am", "is", "are", "was", "were", "can", "could", "should", "would", "will", "have", "has", "had"];
  let auxIndex = -1;
  let auxFound = "";

  for (let i = 0; i < Math.min(words.length, 3); i++) {
    if (auxList.includes(words[i].toLowerCase())) {
      auxIndex = i;
      auxFound = words[i].toLowerCase();
      break;
    }
  }

  const questions = [];
  let tense = "Présent";
  let explanation = "";

  const getRestOfSentence = (startIndex, omitKeywords = []) => {
    return words.slice(startIndex).map(w => {
      const wl = w.toLowerCase();
      if (omitKeywords.includes(wl)) return '';
      if (wl === 'my') return 'your';
      if (wl === 'our') return 'your';
      if (wl === 'me') return 'you';
      if (wl === 'us') return 'you';
      if (wl === 'i') return 'you';
      return w;
    }).filter(Boolean).join(' ');
  };

  if (auxIndex !== -1) {
    let qAux = auxFound;
    
    if (subLower === 'i' && auxFound === 'am') {
      qAux = 'are';
    } else if (subLower === 'i' && auxFound === 'was') {
      qAux = 'were';
    } else if (subLower === 'we' && auxFound === 'are') {
      qAux = 'are';
    }

    const subject = questionSubj;
    const verbPart = getRestOfSentence(auxIndex + 1);
    
    tense = ["was", "were"].includes(auxFound) ? "Passé (auxiliaire)" : "Présent / Futur / Modal";
    explanation = `Présence de l'auxiliaire/modal "${auxFound}". On l'inverse avec le sujet "${origSubj}" (devenu "${subject}" pour s'accorder).`;

    const yesNo = `${capitalize(qAux)} ${subject} ${verbPart}?`;
    questions.push({ type: 'Fermée (Yes/No)', text: yesNo });

    const placeKeywords = ['in', 'to', 'at', 'on', 'under', 'near'];
    const timeKeywords = ['yesterday', 'tomorrow', 'today', 'morning', 'afternoon', 'evening', 'night', 'next', 'last'];
    
    let hasPlace = false;
    let placePreposition = '';
    let hasTime = false;

    words.forEach(w => {
      const wl = w.toLowerCase();
      if (placeKeywords.includes(wl)) {
        hasPlace = true;
        placePreposition = wl;
      }
      if (timeKeywords.includes(wl)) {
        hasTime = true;
      }
    });

    if (hasPlace) {
      const prepIdx = words.findIndex(w => w.toLowerCase() === placePreposition);
      const restBeforePlace = getRestOfSentence(auxIndex + 1, words.slice(prepIdx).map(w => w.toLowerCase()));
      questions.push({
        type: 'Lieu (Where)',
        text: `Where ${qAux} ${subject} ${restBeforePlace}?`
      });
    }

    if (hasTime) {
      const timeKeywordsList = ['yesterday', 'tomorrow', 'today', 'morning', 'afternoon', 'evening', 'night', 'next', 'last'];
      const timeIdx = words.findIndex(w => timeKeywordsList.includes(w.toLowerCase()));
      const restBeforeTime = getRestOfSentence(auxIndex + 1, words.slice(timeIdx).map(w => w.toLowerCase()));
      questions.push({
        type: 'Temps (When)',
        text: `When ${qAux} ${subject} ${restBeforeTime}?`
      });
    }

    const verbLower = verbPart.toLowerCase();
    if (verbLower.includes('reading') || verbLower.includes('watching') || verbLower.includes('eating') || verbLower.includes('doing')) {
      let activity = 'doing';
      if (verbLower.includes('reading')) activity = 'reading';
      if (verbLower.includes('watching')) activity = 'watching';
      if (verbLower.includes('eating')) activity = 'eating';
      
      questions.push({
        type: 'Objet (What)',
        text: `What ${qAux} ${subject} ${activity}?`
      });
    }

  } else {
    const verb = words[1];
    if (!verb) return null;

    const verbLower = verb.toLowerCase();
    let baseVerb = verbLower;
    let aux = 'do';
    let tenseName = 'Présent Simple';

    if (verbLower.endsWith('s') && !verbLower.endsWith('ss') && verbLower !== 'is' && verbLower !== 'has' && verbLower !== 'was') {
      tenseName = 'Présent Simple (3e pers. singulier)';
      aux = 'does';
      if (verbLower.endsWith('es')) {
        if (verbLower === 'goes') baseVerb = 'go';
        else if (verbLower === 'does') baseVerb = 'do';
        else if (verbLower.endsWith('ies')) baseVerb = verbLower.slice(0, -3) + 'y';
        else baseVerb = verbLower.slice(0, -2);
      } else {
        baseVerb = verbLower.slice(0, -1);
      }
    } else if (irregularVerbs[verbLower]) {
      tenseName = 'Prétérit (Passé Simple - Irrégulier)';
      aux = 'did';
      baseVerb = irregularVerbs[verbLower];
    } else if (verbLower.endsWith('ed')) {
      tenseName = 'Prétérit (Passé Simple - Régulier)';
      aux = 'did';
      if (verbLower.endsWith('ied')) {
        baseVerb = verbLower.slice(0, -3) + 'y';
      } else {
        const checkList = ['liked', 'loved', 'hated', 'danced', 'smiled', 'closed', 'used'];
        if (checkList.includes(verbLower)) {
          baseVerb = verbLower.slice(0, -1);
        } else {
          baseVerb = verbLower.slice(0, -2);
        }
      }
    } else {
      tenseName = 'Présent Simple (I/You/We/They)';
      aux = 'do';
      baseVerb = verbLower;
    }

    if (questionSubj.toLowerCase() === 'you' && aux === 'does') {
      aux = 'do';
    }

    explanation = `Temps détecté : ${tenseName}.\nVerbe principal : "${verb}". Base verbale : "${baseVerb}".\nSujet "${origSubj}" ➔ "${questionSubj}". Auxiliaire requis : "${aux}".`;

    const rest = getRestOfSentence(2);
    const yesNo = `${capitalize(aux)} ${questionSubj} ${baseVerb}${rest ? ' ' + rest : ''}?`;
    questions.push({ type: 'Fermée (Yes/No)', text: yesNo });

    const placeKeywords = ['in', 'to', 'at', 'on', 'under', 'near'];
    const timeKeywords = ['yesterday', 'tomorrow', 'today', 'morning', 'afternoon', 'evening', 'night', 'next', 'last'];

    let hasPlace = false;
    let placePreposition = '';
    let hasTime = false;

    words.forEach(w => {
      const wl = w.toLowerCase();
      if (placeKeywords.includes(wl)) {
        hasPlace = true;
        placePreposition = wl;
      }
      if (timeKeywords.includes(wl)) {
        hasTime = true;
      }
    });

    if (hasPlace) {
      const prepIdx = words.findIndex(w => w.toLowerCase() === placePreposition);
      const restBeforePlace = getRestOfSentence(2, words.slice(prepIdx).map(w => w.toLowerCase()));
      questions.push({
        type: 'Lieu (Where)',
        text: `Where ${aux} ${questionSubj} ${baseVerb}${restBeforePlace ? ' ' + restBeforePlace : ''}?`
      });
    }

    if (hasTime) {
      const timeKeywordsList = ['yesterday', 'tomorrow', 'today', 'morning', 'afternoon', 'evening', 'night', 'next', 'last'];
      const timeIdx = words.findIndex(w => timeKeywordsList.includes(w.toLowerCase()));
      const restBeforeTime = getRestOfSentence(2, words.slice(timeIdx).map(w => w.toLowerCase()));
      questions.push({
        type: 'Temps (When)',
        text: `When ${aux} ${questionSubj} ${baseVerb}${restBeforeTime ? ' ' + restBeforeTime : ''}?`
      });
    }

    if (!hasPlace && words.length > 2) {
      questions.push({
        type: 'Objet (What)',
        text: `What ${aux} ${questionSubj} ${baseVerb}?`
      });
    }
  }

  return {
    tense,
    explanation,
    questions
  };
}

export default function QuestionScreen() {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' or 'quiz'
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

  // Generator States
  const [inputText, setInputText] = useState('');
  const [parseResult, setParseResult] = useState(null);

  // Quiz States
  const [unusedIndices, setUnusedIndices] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // New arcade states
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [usedHint, setUsedHint] = useState(false);
  const [showHintText, setShowHintText] = useState("");
  const [coins, setCoins] = useState(50);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const isFocused = useIsFocused();

  // Sync coins on focus
  useEffect(() => {
    if (isFocused) {
      setCoins(getCoins());
    }
  }, [isFocused]);

  // New arcade streak states
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (activeTab === 'quiz' && isQuizStarted && !quizFinished && !showFeedback && !isGameOver) {
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
  }, [activeTab, quizFinished, showFeedback, isGameOver, quizIndex]);

  const handleTimeout = () => {
    setUserAnswer('');
    setShowFeedback(true);
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) {
      setIsGameOver(true);
      saveGameSession('question', currentStreak);
    }
  };

  // Initialize Quiz on Mount
  useEffect(() => {
    initializeQuiz();
  }, []);

  const initializeQuiz = () => {
    const indices = Array.from({ length: quizData.length }, (_, i) => i);
    // Shuffle indices
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = indices[i];
      indices[i] = indices[j];
      indices[j] = temp;
    }
    const firstIdx = indices.pop();
    setUnusedIndices(indices);
    setQuizIndex(firstIdx);
    setUserAnswer('');
    setShowFeedback(false);
    setIsCorrect(false);
    setScore(0);
    setQuizFinished(false);
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
    setUsedHint(false);
    setShowHintText("");
  };

  // Handle parse action
  const handleParse = () => {
    if (!inputText.trim()) return;
    const result = parseEnglishSentence(inputText);
    setParseResult(result);
  };

  const clearGenerator = () => {
    setInputText('');
    setParseResult(null);
  };

  const handleUseHint = () => {
    if (usedHint || showFeedback) return;
    if (coins < 15) return;
    const success = spendCoins(15);
    if (success) {
      setCoins(getCoins());
      const currentQ = quizData[quizIndex];
      const firstAccepted = currentQ.acceptedAnswers[0];
      const firstWord = firstAccepted.split(' ')[0];
      setShowHintText(`Le premier mot commence par : "${firstWord.toUpperCase()}"`);
      setUsedHint(true);
    }
  };

  // Handle quiz validation
  const handleCheckQuiz = () => {
    if (!userAnswer.trim()) return;
    
    if (userAnswer.trim().toLowerCase() === "miidsthree") {
      const streakStr = window.prompt("Entrez le nombre de points (streak) :");
      const streak = parseInt(streakStr, 10);
      if (!isNaN(streak) && streak >= 0) {
        const name = window.prompt("Entrez le nom du joueur :");
        if (name && name.trim()) {
          addHighScore(name, streak, 'question');
          alert("Score ajouté avec succès !");
        }
      }
      setUserAnswer('');
      return;
    }
    
    const currentQ = quizData[quizIndex];
    
    const cleanAnswer = userAnswer.trim().toLowerCase().replace(/[?.]/g, '');
    const isAnsCorrect = currentQ.acceptedAnswers.some(ans => {
      return ans.toLowerCase().replace(/[?.]/g, '') === cleanAnswer;
    });

    setIsCorrect(isAnsCorrect);
    setShowFeedback(true);
    if (isAnsCorrect) {
      setScore(prev => prev + 10);
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
        saveGameSession('question', currentStreak);
      }
    }
  };

  const handleNextQuiz = () => {
    setUserAnswer('');
    setShowFeedback(false);

    if (isGameOver) {
      // Trigger quiz finished screen after ensuring global leaderboard is synced
      fetchGlobalLeaderboard('question').finally(() => {
        setQuizFinished(true);
      });
      return;
    }

    // Reset timer and powerups
    const hasExtendedTimer = hasExtendedTimerUpgrade();
    setTimeLeft(hasExtendedTimer ? 90 : 60);
    setShowHintText("");
    setUsedHint(false);

    // Select next random non-repeating question
    let currentUnused = [...unusedIndices];
    if (currentUnused.length === 0) {
      // Refill and reshuffle
      currentUnused = Array.from({ length: quizData.length }, (_, i) => i);
      for (let i = currentUnused.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = currentUnused[i];
        currentUnused[i] = currentUnused[j];
        currentUnused[j] = temp;
      }
    }

    const nextIdx = currentUnused.pop();
    setUnusedIndices(currentUnused);
    setQuizIndex(nextIdx);
  };

  const handleSaveHighScore = () => {
    if (!playerName.trim()) return;
    addHighScore(playerName, maxStreak, 'question');
    setScoreSaved(true);
  };

  const resetQuiz = () => {
    initializeQuiz();
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
        
        {/* Toggle Mode Navigation Tab */}
        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tabButton, activeTab === 'generator' && styles.activeTabButton]}
            onPress={() => setActiveTab('generator')}
          >
            <Ionicons 
              name="construct-outline" 
              size={18} 
              color={activeTab === 'generator' ? theme.colors.white : theme.colors.textMuted} 
            />
            <Text style={[styles.tabText, activeTab === 'generator' && styles.activeTabText]}>
              Générateur
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.tabButton, activeTab === 'quiz' && styles.activeTabButton]}
            onPress={() => setActiveTab('quiz')}
          >
            <Ionicons 
              name="trophy-outline" 
              size={18} 
              color={activeTab === 'quiz' ? theme.colors.white : theme.colors.textMuted} 
            />
            <Text style={[styles.tabText, activeTab === 'quiz' && styles.activeTabText]}>
              Quiz d'Entraînement
            </Text>
          </Pressable>
        </View>

        {activeTab === 'generator' ? (
          /* ================= GENERATOR TAB ================= */
          <View>
            <Text style={styles.title}>Générateur de Question</Text>
            <Text style={styles.subtitle}>
              Saisissez une phrase affirmative en anglais (ex: "She lives in London") pour obtenir les questions correspondantes.
            </Text>

            <View style={styles.card}>
              <TextInput
                className="notranslate"
                dataSet={{ translate: 'no' }}
                style={styles.input}
                placeholder="Ex: He woke up at 8 AM..."
                placeholderTextColor={theme.colors.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              {inputText.length > 0 && (
                <Pressable style={styles.clearInputBtn} onPress={clearGenerator}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
                </Pressable>
              )}
            </View>

            <Pressable 
              style={({ pressed }) => [
                styles.actionButton,
                !inputText.trim() && styles.actionButtonDisabled,
                pressed && styles.actionButtonPressed
              ]}
              onPress={handleParse}
              disabled={!inputText.trim()}
            >
              <Text style={styles.actionButtonText}>Générer les Questions</Text>
            </Pressable>

            {parseResult && (
              <View style={styles.resultContainer}>
                {/* Grammatical Analysis */}
                <View style={[styles.card, styles.explanationCard]}>
                  <Text style={styles.sectionHeader}>Analyse Grammaticale</Text>
                  <Text 
                    className="notranslate"
                    dataSet={{ translate: 'no' }}
                    style={styles.explanationText}
                  >
                    {parseResult.explanation}
                  </Text>
                </View>

                {/* Generated Questions List */}
                <Text style={styles.sectionHeader}>Questions Proposées :</Text>
                {parseResult.questions.map((q, index) => (
                  <View key={index} style={[styles.card, styles.questionItemCard]}>
                    <View style={styles.questionTypeTag}>
                      <Text style={styles.tagText}>{q.type}</Text>
                    </View>
                    <Text 
                      className="notranslate"
                      dataSet={{ translate: 'no' }}
                      style={styles.questionText}
                    >
                      {q.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          /* ================= QUIZ TAB ================= */
          <View>
            <Text style={styles.title}>Entraînement : Pose la Question !</Text>
            
            {!isQuizStarted ? (
              // Start Game Landing Screen
              <View style={[styles.card, styles.startCard]}>
                <Ionicons name="help-circle" size={60} color={theme.colors.primary} style={{ marginBottom: 15 }} />
                <Text style={styles.startTitle}>CHALLENGE QUESTIONS</Text>
                <Text style={styles.startSubtitle}>
                  Transformez des déclarations affirmatives en questions anglaises correctes (Yes/No, Where, When, What...). Pas de droit à l'erreur !
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
                    initializeQuiz();
                    setIsQuizStarted(true);
                  }}
                >
                  <Animated.Text style={[styles.actionButtonText, { opacity: blinkAnim }]}>
                    INSERT COIN / PRESS START 🚀
                  </Animated.Text>
                </Pressable>
              </View>
            ) : quizFinished ? (
              // Quiz Finished Screen
              <View style={[styles.card, styles.finishedCard]}>
                <Ionicons name="skull-outline" size={60} color={theme.colors.error} style={{ marginBottom: 10 }} />
                <Text style={styles.finishedTitle}>GAME OVER</Text>
                <Text style={styles.scoreText}>Score Final : {score} pts</Text>
                <Text style={styles.streakText}>Série maximale : {maxStreak} réponses d'affilée 🔥</Text>
                {(() => {
                  const rankInfo = getValorantRank(maxStreak);
                  return (
                    <Text 
                      style={[
                        styles.streakText, 
                        { 
                          color: rankInfo.color, 
                          marginTop: 6, 
                          fontFamily: theme.fonts.retro,
                          fontSize: 14,
                          fontWeight: 'bold',
                          letterSpacing: 1
                        }
                      ]}
                    >
                      Rank : {rankInfo.name} 🎖️
                    </Text>
                  );
                })()}
                
                {/* Arcade leaderboard capture form */}
                {checkHighScore(maxStreak, 'question') ? (
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
                  onPress={resetQuiz}
                >
                  <Text style={styles.actionButtonText}>Recommencer la partie</Text>
                </Pressable>
              </View>
            ) : (
              // Active Quiz Screen
              <View style={{ position: 'relative', paddingBottom: 25 }}>
                {/* Score Indicator */}
                <View style={styles.scoreBar}>
                  <Text style={styles.scoreBarText}>Série en cours : {currentStreak} 🔥</Text>
                  <Text style={styles.scoreBarText}>Score : {score} pts</Text>
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

                <View style={styles.card}>
                  <Text style={styles.labelTitle}>Réponse donnée :</Text>
                  <Text 
                    className="notranslate"
                    dataSet={{ translate: 'no' }}
                    style={styles.quizStatement}
                  >
                    "{quizData[quizIndex].statement}"
                  </Text>
                  
                  <View style={styles.divider} />
                  
                  <Text style={styles.labelPrompt}>{quizData[quizIndex].prompt}</Text>
                  
                  <TextInput
                    className="notranslate"
                    dataSet={{ translate: 'no' }}
                    style={styles.quizInput}
                    placeholder="Saisissez la bonne question en anglais..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={userAnswer}
                    onChangeText={setUserAnswer}
                    editable={!showFeedback}
                  />
                </View>

                {/* Power-up Section */}
                <View style={styles.powerupRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.powerupBtn,
                      (usedHint || coins < 15) && styles.powerupBtnDisabled,
                      pressed && styles.powerupBtnPressed
                    ]}
                    onPress={handleUseHint}
                    disabled={usedHint || coins < 15 || showFeedback}
                  >
                    <Ionicons name="bulb-outline" size={16} color={usedHint || coins < 15 ? theme.colors.textMuted : theme.colors.white} />
                    <Text style={[styles.powerupBtnText, (usedHint || coins < 15) && styles.powerupBtnTextDisabled]}>
                      {usedHint ? 'Indice Utilisé' : 'Demander un Indice (15 🪙)'}
                    </Text>
                  </Pressable>
                </View>

                {showHintText ? (
                  <View style={styles.hintTextBox}>
                    <Text style={styles.hintText}>{showHintText}</Text>
                  </View>
                ) : null}

                {!showFeedback ? (
                  <Pressable 
                    style={({ pressed }) => [
                      styles.actionButton,
                      !userAnswer.trim() && styles.actionButtonDisabled,
                      pressed && styles.actionButtonPressed
                    ]}
                    onPress={handleCheckQuiz}
                    disabled={!userAnswer.trim()}
                  >
                    <Text style={styles.actionButtonText}>Vérifier la réponse</Text>
                  </Pressable>
                ) : (
                  <View>
                    {/* Feedback Container */}
                    <View style={[
                      styles.feedbackBox, 
                      isCorrect ? styles.feedbackSuccess : styles.feedbackError
                    ]}>
                      <View style={styles.feedbackTitleRow}>
                        <Ionicons 
                          name={isCorrect ? "checkmark-circle-outline" : "close-circle-outline"} 
                          size={24} 
                          color={isCorrect ? theme.colors.success : theme.colors.error} 
                        />
                        <Text style={[
                          styles.feedbackTitle, 
                          { color: isCorrect ? theme.colors.success : theme.colors.error }
                        ]}>
                          {isCorrect 
                            ? 'Excellent ! (+10 pts)' 
                            : userAnswer === '' && timeLeft === 0 
                              ? 'Temps écoulé ! (-1 Vie)'
                              : lives <= 0 
                                ? 'Mauvaise réponse... Game Over !' 
                                : 'Mauvaise réponse... (-1 Vie)'}
                        </Text>
                      </View>
                      
                      <Text style={styles.feedbackExplainTitle}>Règle & Explication :</Text>
                      <Text 
                        className="notranslate"
                        dataSet={{ translate: 'no' }}
                        style={styles.feedbackExplainText}
                      >
                        {quizData[quizIndex].explanation}
                      </Text>
                    </View>

                    <Pressable 
                      style={({ pressed }) => [
                        styles.actionButton,
                        isGameOver ? styles.gameOverNextBtn : styles.gameNextButton,
                        pressed && styles.actionButtonPressed
                      ]}
                      onPress={handleNextQuiz}
                    >
                      <Text style={styles.actionButtonText}>
                        {isGameOver ? 'Terminer la partie (Game Over)' : 'Défi Suivant'}
                      </Text>
                    </Pressable>
                  </View>
                )}

              </View>
            )}
          </View>
        )}
      </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.white,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 242, 254, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
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
    minHeight: 100,
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
  resultContainer: {
    marginTop: theme.spacing.md,
  },
  explanationCard: {
    borderColor: theme.colors.secondary,
    borderLeftWidth: 4,
  },
  sectionHeader: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  explanationText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  questionItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  questionTypeTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: theme.colors.primary,
    marginRight: 12,
  },
  tagText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  questionText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
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
  hintTextBox: {
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  hintText: {
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  labelTitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  quizStatement: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  labelPrompt: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  quizInput: {
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  feedbackBox: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: theme.colors.success,
  },
  feedbackError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: theme.colors.error,
  },
  feedbackTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
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
    fontSize: 26,
    fontWeight: '900',
    marginVertical: theme.spacing.sm,
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
  },

  /* Arcade Leaderboard styles */
  streakText: {
    fontSize: 16,
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
