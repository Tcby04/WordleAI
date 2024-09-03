import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './components/ui/button';
import { useWordleAI } from './WordleAI';
import { AIBoard } from './AIBoard';
import { GameBoard } from './GameBoard';
import { Alert } from './components/ui/alert';
import { OptionsModal } from './OptionsModal';

const AI_DELAY_MS = 1000;

interface Score {
  wins: number;
  losses: number;
}

type GameMode = 'turnBased' | 'normal' | 'aiOnly' | 'hiddenAI';

const App: React.FC = () => {
  const [words, setWords] = useState<string[]>([]);
  const [solution, setSolution] = useState('');
  const [scores, setScores] = useState<Score[]>([
    { wins: 0, losses: 0 },
    { wins: 0, losses: 0 }
  ]);
  const [isTraining, setIsTraining] = useState(false);
  const [showProbabilities, setShowProbabilities] = useState(false);
  const [humanTurn, setHumanTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState<string | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('turnBased');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const ai = useWordleAI(words);

  const getRandomWord = useCallback(() => {
    if (words.length > 0) {
      return words[Math.floor(Math.random() * words.length)];
    }
    return '';
  }, [words]);

  const startNewGame = useCallback(() => {
    const newSolution = getRandomWord();
    if (newSolution) {
      setSolution(newSolution);
      setHumanTurn(true);
      setGameStatus(null);
      setGameKey(prevKey => prevKey + 1);
      if (ai) {
        ai.resetState();
      }
    }
  }, [getRandomWord, ai]);

  useEffect(() => {
    console.log('Loading words...');
    fetch('/five_letter_words.txt')
      .then(response => response.text())
      .then(text => {
        const wordSet = new Set<string>();
        const lines = text.split('\n');

        lines.forEach((word) => {
          const cleanedWord = word.trim().toUpperCase();
          if (cleanedWord.length === 5 && /^[A-Z]+$/.test(cleanedWord)) {
            wordSet.add(cleanedWord);
          }
        });

        const loadedWords = Array.from(wordSet);
        if (loadedWords.length > 0) {
          setWords(loadedWords);
        } else {
          console.error('No valid words loaded');
        }
      })
      .catch(error => {
        console.error('Error loading words:', error);
      });
  }, []);

  useEffect(() => {
    if (words.length > 0 && !ai) {
      setIsTraining(true);
    }
  }, [words, ai]);

  useEffect(() => {
    if (ai && isTraining) {
      setIsTraining(false);
      startNewGame();
    }
  }, [ai, isTraining, startNewGame]);

  useEffect(() => {
    if (words.length > 0) {
      const newSolution = getRandomWord();
      setSolution(newSolution);
    }
  }, [words, getRandomWord]);

  const handleWin = (boardId: number) => {
    setScores(prevScores => {
      const newScores = [...prevScores];
      newScores[boardId].wins += 1;
      return newScores;
    });
    setGameStatus(`${boardId === 0 ? 'You' : 'The AI'} guessed the word!`);
    if (gameMode === 'aiOnly') {
      setTimeout(startNewGame, AI_DELAY_MS);
    }
  };

  const handleLose = (boardId: number) => {
    setScores(prevScores => {
      const newScores = [...prevScores];
      newScores[boardId].losses += 1;
      return newScores;
    });
    setGameStatus(`Game over for ${boardId === 0 ? 'you' : 'the AI'}! The word was ${solution}.`);
    if (gameMode === 'aiOnly') {
      setTimeout(startNewGame, AI_DELAY_MS);
    }
  };

  const handleHumanGuess = useCallback(() => {
    if (gameMode === 'turnBased') {
      setHumanTurn(false);
    }
  }, [gameMode]);

  const handleAIGuess = useCallback(() => {
    if (gameMode === 'turnBased') {
      setHumanTurn(true);
    }
  }, [gameMode]);

  const handleSelectOption = (option: GameMode) => {
    setGameMode(option);
    setIsModalOpen(false);
    startNewGame();
  };

  if (isTraining) {
    return <div className="min-h-screen bg-purple-900 text-white flex items-center justify-center">Training AI...</div>;
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-purple-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-8">Error: No valid words loaded</h1>
        <p>Please check the console for more information.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white flex flex-col items-center justify-center p-4 overflow-x-hidden">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-8 text-center">Human vs AI Wordle</h1>
      <div className="flex flex-col md:flex-row justify-between w-full max-w-4xl mb-4 text-center md:text-left">
        <div className="text-lg md:text-xl mb-2 md:mb-0">Human - Wins: {scores[0].wins} Losses: {scores[0].losses}</div>
        <div className="text-lg md:text-xl">AI - Wins: {scores[1].wins} Losses: {scores[1].losses}</div>
      </div>
      <div className="flex gap-4 mb-4 justify-between">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-700 hover:bg-purple-600"
        >
          Game Options
        </Button>
      </div>
      <div className="flex flex-col md:flex-row justify-center gap-8 w-full max-w-4xl">
        {/* Always render the GameBoard for human player */}
        <GameBoard 
          key={`human-${gameKey}`}
          solution={solution} 
          onWin={() => handleWin(0)} 
          onLose={() => handleLose(0)} 
          boardId={1}
          onGuess={handleHumanGuess}
          isActive={gameMode === 'normal' || gameMode === 'hiddenAI' || (gameMode === 'turnBased' && humanTurn)}
        />
        {/* Render AIBoard for all modes except 'hiddenAI' */}
        {gameMode !== 'hiddenAI' && (
          <AIBoard 
            key={`ai-${gameKey}`}
            solution={solution} 
            onWin={() => handleWin(1)} 
            onLose={() => handleLose(1)} 
            boardId={2}
            ai={ai}
            showProbabilities={showProbabilities}
            humanGuessed={gameMode === 'aiOnly' || (gameMode === 'turnBased' && !humanTurn)}
            isHidden={false}
            onGuess={handleAIGuess}
          />
        )}
        {/* Render a blurred AIBoard for 'hiddenAI' mode */}
        {gameMode === 'hiddenAI' && (
          <AIBoard 
            key={`ai-hidden-${gameKey}`}
            solution={solution} 
            onWin={() => handleWin(1)} 
            onLose={() => handleLose(1)} 
            boardId={2}
            ai={ai}
            showProbabilities={false}
            humanGuessed={true}
            isHidden={true}
            onGuess={handleAIGuess}
          />
        )}
      </div>
      {gameStatus && (
        <Alert className="mt-4 mb-4">
          {gameStatus}
        </Alert>
      )}
      
      {gameMode !== 'aiOnly' && (
        <Button onClick={startNewGame} className="mt-4 bg-purple-700 hover:bg-purple-600 w-full md:w-auto">
          Next Word
        </Button>
      )}
      <OptionsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectOption={handleSelectOption}
      />
    </div>
  );
};

export default App;