import React, { useState, useEffect, useCallback } from 'react';
import { WordleAI } from './WordleAI';
import { ProbabilitiesDisplay } from './ProbabilitiesDisplay';
import { Button } from './components/ui/button';

interface AIBoardProps {
  solution: string;
  onWin: () => void;
  onLose: () => void;
  boardId: number;
  ai: WordleAI | null;
  showProbabilities: boolean;
  humanGuessed: boolean;
  isHidden: boolean;
}

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const AI_DELAY_MS = 1000; // 0.5 second delay

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export const AIBoard: React.FC<AIBoardProps> = ({ 
  solution, 
  onWin, 
  onLose, 
  boardId, 
  ai, 
  showProbabilities, 
  humanGuessed,
  isHidden
}) => {
  const [guesses, setGuesses] = useState<string[]>(Array(MAX_GUESSES).fill(null));
  const [currentRow, setCurrentRow] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [probabilities, setProbabilities] = useState<{ [word: string]: number }>({});
  const [usedLetters, setUsedLetters] = useState<{ [key: string]: 'correct' | 'present' | 'absent' | 'unused' }>({});

  const resetBoard = useCallback(() => {
    setGuesses(Array(MAX_GUESSES).fill(null));
    setCurrentRow(0);
    setGameOver(false);
    setProbabilities({});
    setUsedLetters({});
  }, []);

  useEffect(() => {
    resetBoard();
    if (ai) {
      ai.resetState();
    }
  }, [solution, ai, resetBoard]);

  const handleGuess = useCallback(() => {
    if (!ai || gameOver) return;

    const aiGuess = ai.makeGuess();
    const newGuesses = [...guesses];
    newGuesses[currentRow] = aiGuess;
    setGuesses(newGuesses);

    const feedback: ('correct' | 'present' | 'absent')[] = Array(WORD_LENGTH).fill('absent');
    const solutionArray = solution.split('');
    const guessArray = aiGuess.split('');

    // First pass: Mark correct letters
    guessArray.forEach((letter, index) => {
      if (letter === solutionArray[index]) {
        feedback[index] = 'correct';
        solutionArray[index] = '#'; // Mark as used
        guessArray[index] = '*'; // Mark as processed
      }
    });

    // Second pass: Mark present letters
    guessArray.forEach((letter, index) => {
      if (letter !== '*' && solutionArray.includes(letter)) {
        feedback[index] = 'present';
        solutionArray[solutionArray.indexOf(letter)] = '#'; // Mark as used
      }
    });

    // Update used letters
    const newUsedLetters = { ...usedLetters };
    feedback.forEach((status, index) => {
      const letter = aiGuess[index];
      if (status === 'correct' || (status === 'present' && newUsedLetters[letter] !== 'correct')) {
        newUsedLetters[letter] = status;
      } else if (status === 'absent' && !newUsedLetters[letter]) {
        newUsedLetters[letter] = 'absent';
      }
    });
    setUsedLetters(newUsedLetters);

    ai.updateState(feedback);
    setProbabilities(ai.calculateWordProbabilities());

    if (aiGuess === solution) {
      setGameOver(true);
      onWin();
    } else if (currentRow === MAX_GUESSES - 1) {
      setGameOver(true);
      onLose();
    } else {
      setCurrentRow(prev => prev + 1);
    }
  }, [ai, currentRow, guesses, solution, onWin, onLose, gameOver, usedLetters]);

  useEffect(() => {
    if (ai && !gameOver && currentRow < MAX_GUESSES && humanGuessed) {
      const timer = setTimeout(() => {
        handleGuess();
      }, AI_DELAY_MS);

      return () => clearTimeout(timer);
    }
  }, [ai, currentRow, gameOver, handleGuess, humanGuessed]);

  const getLetterColor = (letter: string, index: number, guess: string) => {
    if (!guess) return 'border-purple-700'; // Empty cell

    const solutionArray = solution.split('');
    const guessArray = guess.split('');

    if (solutionArray[index] === letter) {
      return 'bg-green-600';
    }

    if (solutionArray.includes(letter)) {
      const letterCountInSolution = solutionArray.filter(l => l === letter).length;
      const letterCountInGuess = guessArray.filter(l => l === letter).length;
      const correctPositions = guessArray.filter((l, i) => l === letter && solution[i] === letter).length;

      if (letterCountInGuess > letterCountInSolution && 
          guessArray.indexOf(letter) !== index && 
          correctPositions < letterCountInSolution) {
        return index < guess.lastIndexOf(letter) ? 'bg-yellow-600' : 'bg-gray-600';
      }

      return 'bg-yellow-600';
    }

    return 'bg-gray-600';
  };

  const getKeyColor = (letter: string) => {
    switch (usedLetters[letter]) {
      case 'correct':
        return 'bg-green-600';
      case 'present':
        return 'bg-yellow-600';
      case 'absent':
        return 'bg-gray-600';
      default:
        return 'bg-purple-700';
    }
  };

  return (
    <div className={`flex flex-col items-center ${isHidden ? 'filter blur-md pointer-events-none' : ''}`}>
      <h2 className="text-2xl font-bold mb-4">Board {boardId} (AI)</h2>
      <div className="grid gap-2 mb-4">
        {guesses.map((guess, i) => (
          <div key={i} className="flex gap-2">
            {Array.from({ length: WORD_LENGTH }).map((_, j) => (
              <div
                key={j}
                className={`w-12 h-12 border-2 flex items-center justify-center text-2xl font-bold transition-all duration-500 ${
                  guess
                    ? getLetterColor(guess[j], j, guess)
                    : 'border-purple-700'
                }`}
              >
                {guess ? guess[j] : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className='mb-3'></div>
      <div className="mt-10 mb-4">
        {KEYBOARD_ROWS.map((row, i) => (
          <div key={i} className="flex justify-center gap-1 my-1">
            {row.map((letter) => (
              <Button
                key={letter}
                className={`w-8 h-10 transition-colors duration-300 ${getKeyColor(letter)}`}
                disabled={true}
              >
                {letter}
              </Button>
            ))}
          </div>
        ))}
      </div>
      {showProbabilities && <ProbabilitiesDisplay probabilities={probabilities} />}
    </div>
  );
};