import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

interface GameBoardProps {
  solution: string;
  onWin: () => void;
  onLose: () => void;
  boardId: number;
  onGuess: () => void;
  isActive: boolean;
}

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

interface UsedLetters {
  [key: string]: 'correct' | 'present' | 'absent' | 'unused';
}

export const GameBoard: React.FC<GameBoardProps> = ({ solution, onWin, onLose, boardId, onGuess, isActive }) => {
  const [guesses, setGuesses] = useState<string[]>(Array(MAX_GUESSES).fill(null));
  const [currentGuess, setCurrentGuess] = useState('');
  const [usedLetters, setUsedLetters] = useState<UsedLetters>({});
  const [currentRow, setCurrentRow] = useState(0);
  const [shake, setShake] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGuesses(Array(MAX_GUESSES).fill(null));
    setCurrentGuess('');
    setUsedLetters({});
    setCurrentRow(0);
    setShake(false);
    setGameOver(false);
  }, [solution]);

  const handleGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH || !isActive || gameOver) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const newGuesses = [...guesses];
    newGuesses[currentRow] = currentGuess;
    setGuesses(newGuesses);

    // Update used letters
    const newUsedLetters: UsedLetters = { ...usedLetters };
    const solutionArray = solution.split('');
    const guessArray = currentGuess.split('');
    const feedback: ('correct' | 'present' | 'absent')[] = [];

    // First pass: Mark correct letters
    guessArray.forEach((letter, index) => {
      if (letter === solutionArray[index]) {
        newUsedLetters[letter] = 'correct';
        solutionArray[index] = '#'; // Mark as used
        guessArray[index] = '*'; // Mark as processed
        feedback[index] = 'correct';
      }
    });

    // Second pass: Mark present and absent letters
    guessArray.forEach((letter, index) => {
      if (letter !== '*') {
        if (solutionArray.includes(letter)) {
          newUsedLetters[letter] = newUsedLetters[letter] === 'correct' ? 'correct' : 'present';
          solutionArray[solutionArray.indexOf(letter)] = '#'; // Mark as used
          feedback[index] = 'present';
        } else {
          newUsedLetters[letter] = newUsedLetters[letter] === 'correct' || newUsedLetters[letter] === 'present' 
            ? newUsedLetters[letter] 
            : 'absent';
          feedback[index] = 'absent';
        }
      }
    });

    setUsedLetters(newUsedLetters);

    if (currentGuess === solution) {
      setGameOver(true);
      onWin();
    } else if (currentRow === MAX_GUESSES - 1) {
      setGameOver(true);
      onLose();
    } else {
      setCurrentRow(currentRow + 1);
    }

    setCurrentGuess('');
    onGuess(); // Notify parent that a guess has been made
  }, [currentGuess, guesses, currentRow, usedLetters, solution, onWin, onLose, onGuess, isActive, gameOver]);

  useEffect(() => {
    if (inputRef.current && isActive) {
      inputRef.current.focus();
    }
  }, [currentRow, isActive]);

  const handleKeyPress = (letter: string) => {
    if (gameOver || !isActive) return;
    if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((oldGuess) => oldGuess + letter);
    }
  };

  const handleBackspace = () => {
    if (!isActive) return;
    setCurrentGuess((oldGuess) => oldGuess.slice(0, -1));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (gameOver || !isActive) return;
    if (event.key === 'Enter') {
      handleGuess();
    } else if (event.key === 'Backspace') {
      handleBackspace();
    }
  };

  const getLetterColor = (letter: string, index: number, guess: string) => {
    if (!guess) return 'border-purple-700'; // Empty cell

    const solutionArray = solution.split('');
    const guessArray = guess.split('');

    // First, mark correct letters
    if (solutionArray[index] === letter) {
      solutionArray[index] = '#';
      return 'bg-green-600';
    }

    // Then, check for present letters
    if (solutionArray.includes(letter)) {
      // Count how many times this letter appears in the solution and in the guess
      const letterCountInSolution = solutionArray.filter(l => l === letter).length;
      const letterCountInGuess = guessArray.filter(l => l === letter).length;
      const correctPositions = guessArray.filter((l, i) => l === letter && solution[i] === letter).length;

      if (letterCountInGuess > letterCountInSolution && 
          guessArray.indexOf(letter) !== index && 
          correctPositions < letterCountInSolution) {
        // This accounts for duplicate letters in the guess
        return index < guess.lastIndexOf(letter) ? 'bg-yellow-600' : 'bg-gray-600';
      }

      solutionArray[solutionArray.indexOf(letter)] = '#';
      return 'bg-yellow-600';
    }

    // If not correct or present, it's absent
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
    <div className="flex flex-col items-center w-full max-w-xs md:max-w-none">
      <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Board {boardId} (Human)</h2>
      <div className={`grid gap-1 md:gap-2 mb-2 md:mb-4 ${shake ? 'animate-shake' : ''}`}>
        {guesses.map((guess, i) => (
          <div key={i} className="flex gap-2">
            {Array.from({ length: WORD_LENGTH }).map((_, j) => (
              <div
                key={j}
                className={`w-12 h-12 border-2 flex items-center justify-center text-2xl font-bold transition-all duration-500 ${
                  guess
                    ? getLetterColor(guess[j], j, guess)
                    : i === currentRow
                    ? currentGuess[j]
                      ? 'border-purple-300 bg-purple-700'
                      : 'border-purple-300'
                    : 'border-purple-700'
                }`}
              >
                {guess ? guess[j] : i === currentRow ? currentGuess[j] : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mb-2 md:mb-4 flex gap-2 w-full">
        <Input
          ref={inputRef}
          type="text"
          value={currentGuess}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentGuess(e.target.value.toUpperCase().slice(0, WORD_LENGTH))}
          onKeyDown={handleKeyDown}
          className="bg-purple-800 border-purple-600 text-white"
          placeholder="Type your guess"
          maxLength={WORD_LENGTH}
          disabled={gameOver || !isActive}
        />
        <Button onClick={handleGuess} disabled={gameOver || !isActive || currentGuess.length !== WORD_LENGTH}>
          Guess
        </Button>
      </div>
      <div className="mb-4">
        {KEYBOARD_ROWS.map((row, i) => (
          <div key={i} className="flex justify-center gap-1 my-1">
            {row.map((letter) => (
              <Button
                key={letter}
                onClick={() => handleKeyPress(letter)}
                className={`w-8 h-10 transition-colors duration-300 ${getKeyColor(letter)}`}
                disabled={gameOver || !isActive}
              >
                {letter}
              </Button>
            ))}
            {i === 2 && (
              <>
                <Button onClick={handleBackspace} className="px-2 bg-purple-700" disabled={gameOver || !isActive}>
                  ←
                </Button>
                <Button onClick={handleGuess} className="px-2 bg-purple-700" disabled={gameOver || !isActive || currentGuess.length !== WORD_LENGTH}>
                  Enter
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};