import { useState, useEffect } from 'react';

interface WordleAIState {
  possibleWords: string[];
  lastGuess: string | null;
  feedback: ('correct' | 'present' | 'absent')[] | null;
  usedWords: Set<string>;
  presentLetters: Set<string>;
}

export class WordleAI {
  private words: string[];
  private state: WordleAIState;
  private wordScores: Map<string, number>;

  constructor(words: string[]) {
    this.words = words;
    this.state = {
      possibleWords: [...words],
      lastGuess: null,
      feedback: null,
      usedWords: new Set(),
      presentLetters: new Set()
    };
    this.wordScores = new Map();
    this.initializeWordScores();
  }

  private initializeWordScores() {
    this.words.forEach(word => {
      this.wordScores.set(word, 0);
    });
  }

  makeGuess(): string {
    if (this.state.possibleWords.length === 0) {
      // If no possible words, reset to all words minus used words
      this.state.possibleWords = this.words.filter(word => !this.state.usedWords.has(word));
    }

    // Filter words that include all present letters
    let candidateWords = this.state.possibleWords.filter(word => 
      Array.from(this.state.presentLetters).every(letter => word.includes(letter))
    );

    // If no words include all present letters, fall back to all possible words
    if (candidateWords.length === 0) {
      candidateWords = this.state.possibleWords;
    }

    // Choose the word with the highest score that hasn't been used
    let bestWord = candidateWords.find(word => !this.state.usedWords.has(word)) || '';
    let bestScore = this.wordScores.get(bestWord) || 0;

    for (const word of candidateWords) {
      if (this.state.usedWords.has(word)) continue;  // Skip used words
      const score = this.wordScores.get(word) || 0;
      if (score > bestScore) {
        bestWord = word;
        bestScore = score;
      }
    }

    this.state.lastGuess = bestWord;
    this.state.usedWords.add(bestWord);  // Add the guessed word to usedWords
    return bestWord;
  }

  updateState(feedback: ('correct' | 'present' | 'absent')[]) {
    if (!this.state.lastGuess) {
      console.warn('No last guess available. Skipping state update.');
      return;
    }

    this.state.feedback = feedback;

    // Update presentLetters based on feedback
    feedback.forEach((status, index) => {
      if (status === 'present') {
        this.state.presentLetters.add(this.state.lastGuess![index]);
      }
    });

    this.state.possibleWords = this.state.possibleWords.filter(word => 
      this.isWordConsistentWithFeedback(word, this.state.lastGuess!, feedback)
    );

    // Update the score of the last guess based on the feedback
    const lastGuessScore = this.wordScores.get(this.state.lastGuess) || 0;
    const feedbackScore = feedback.filter(f => f === 'correct').length;
    this.wordScores.set(this.state.lastGuess, lastGuessScore + feedbackScore);
  }

  private isWordConsistentWithFeedback(word: string, guess: string, feedback: ('correct' | 'present' | 'absent')[]): boolean {
    for (let i = 0; i < word.length; i++) {
      if (feedback[i] === 'correct' && word[i] !== guess[i]) {
        return false;
      }
      if (feedback[i] === 'absent' && word.includes(guess[i])) {
        return false;
      }
      if (feedback[i] === 'present' && (!word.includes(guess[i]) || word[i] === guess[i])) {
        return false;
      }
    }
    return true;
  }

  resetState() {
    this.state = {
      possibleWords: [...this.words],
      lastGuess: null,
      feedback: null,
      usedWords: new Set(),
      presentLetters: new Set()
    };
  }

  calculateWordProbabilities(): { [word: string]: number } {
    const totalScore = this.state.possibleWords.reduce((sum, word) => sum + (this.wordScores.get(word) || 0), 0);
    const probabilities: { [word: string]: number } = {};

    this.state.possibleWords.forEach(word => {
      if (!this.state.usedWords.has(word)) {  // Only calculate probabilities for unused words
        const score = this.wordScores.get(word) || 0;
        probabilities[word] = score / totalScore;
      }
    });

    return probabilities;
  }

  train(episodes: number) {
    for (let i = 0; i < episodes; i++) {
      const targetWord = this.words[Math.floor(Math.random() * this.words.length)];
      this.resetState();
      let guessCount = 0;

      while (guessCount < 6) {
        const guess = this.makeGuess();
        const feedback = this.getFeedback(guess, targetWord);
        this.updateState(feedback);
        guessCount++;

        if (guess === targetWord) {
          // Reward the AI for guessing correctly
          const score = this.wordScores.get(guess) || 0;
          this.wordScores.set(guess, score + (6 - guessCount + 1) * 2);
          break;
        }
      }
    }
  }

  private getFeedback(guess: string, solution: string): ('correct' | 'present' | 'absent')[] {
    const feedback: ('correct' | 'present' | 'absent')[] = [];
    const solutionArray = solution.split('');
    const guessArray = guess.split('');

    // First pass: Mark correct letters
    guessArray.forEach((letter, index) => {
      if (letter === solutionArray[index]) {
        feedback[index] = 'correct';
        solutionArray[index] = '#'; // Mark as used
        guessArray[index] = '*'; // Mark as processed
      }
    });

    // Second pass: Mark present and absent letters
    guessArray.forEach((letter, index) => {
      if (letter !== '*') {
        if (solutionArray.includes(letter)) {
          feedback[index] = 'present';
          solutionArray[solutionArray.indexOf(letter)] = '#'; // Mark as used
        } else {
          feedback[index] = 'absent';
        }
      }
    });

    return feedback;
  }
}

export const useWordleAI = (words: string[]) => {
  const [ai, setAI] = useState<WordleAI | null>(null);

  useEffect(() => {
    if (words.length > 0) {
      const newAI = new WordleAI(words);
      newAI.train(1000); // Train the AI for 1000 episodes
      setAI(newAI);
    }
  }, [words]);

  return ai;
};