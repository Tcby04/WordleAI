import React from 'react';

interface ProbabilitiesDisplayProps {
  probabilities: { [word: string]: number };
}

export const ProbabilitiesDisplay: React.FC<ProbabilitiesDisplayProps> = ({ probabilities }) => {
  const sortedProbabilities = Object.entries(probabilities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="bg-purple-800 p-4 rounded-lg shadow-lg mt-4">
      <h3 className="text-xl font-bold mb-2">Top 10 Word Probabilities</h3>
      <ul>
        {sortedProbabilities.map(([word, probability]) => (
          <li key={word} className="flex justify-between">
            <span>{word}</span>
            <span>{(probability * 100).toFixed(2)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
