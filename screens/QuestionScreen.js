import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';

export default function QuestionScreen() {
  const [answerText, setAnswerText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetQuestion = async () => {
    if (!answerText.trim() || !apiKey.trim()) {
      setError('Veuillez entrer une réponse et une clé API OpenAI.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant playing Jeopardy. The user provides an answer in English, and you must respond with the correct question in English, starting with "What is", "Who is", etc.',
            },
            {
              role: 'user',
              content: answerText,
            },
          ],
          temperature: 0.7,
          max_tokens: 50,
        }),
      });

      const data = await response.json();
      if (response.ok && data.choices && data.choices.length > 0) {
        setQuestionText(data.choices[0].message.content);
      } else {
        setError(data.error?.message || 'Erreur lors de la génération de la question.');
      }
    } catch (err) {
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Trouver la Question (Jeu de style Jeopardy)</Text>

      <Text style={styles.label}>Clé API OpenAI :</Text>
      <TextInput
        style={styles.inputKey}
        placeholder="sk-..."
        value={apiKey}
        onChangeText={setApiKey}
        secureTextEntry
      />
      <Text style={styles.hint}>Votre clé n'est pas sauvegardée et est utilisée uniquement pour cette requête.</Text>

      <Text style={styles.label}>Réponse (en anglais) :</Text>
      <TextInput
        style={styles.input}
        placeholder="Example: The capital of France"
        value={answerText}
        onChangeText={setAnswerText}
        multiline
      />

      <Button title="Obtenir la Question" onPress={handleGetQuestion} />

      {loading && <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {questionText ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Question correspondante :</Text>
          <Text style={styles.resultText}>{questionText}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
  },
  inputKey: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  loader: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#e6ffe6',
    borderRadius: 5,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006600',
  },
});
