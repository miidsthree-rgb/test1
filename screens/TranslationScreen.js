import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';

export default function TranslationScreen() {
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTranslate = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|en`);
      const data = await response.json();
      if (data && data.responseData && data.responseData.translatedText) {
        setTranslation(data.responseData.translatedText);
      } else {
        setError('Error translating text.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Traduction (Français → Anglais)</Text>
      <TextInput
        style={styles.input}
        placeholder="Entrez une phrase en français..."
        value={text}
        onChangeText={setText}
        multiline
      />
      <Button title="Traduire" onPress={handleTranslate} />

      {loading && <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />}

      {error && <Text style={styles.error}>{error}</Text>}

      {translation ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Traduction en Anglais :</Text>
          <Text style={styles.resultText}>{translation}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    minHeight: 100,
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
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
  },
});
