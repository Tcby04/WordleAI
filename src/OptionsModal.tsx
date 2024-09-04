import React from 'react';
import { Button } from './components/ui/button';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: 'turnBased' | 'normal' | 'aiOnly' | 'hiddenAI') => void;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({ isOpen, onClose, onSelectOption }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-purple-800 p-6 rounded-lg shadow-xl relative z-60">
        <h2 className="text-2xl font-bold mb-4">Game Options</h2>
        <div className="space-y-4">
          <Button 
            onClick={() => onSelectOption('turnBased')} 
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Turn-Based Mode
          </Button>
          <Button 
            onClick={() => onSelectOption('normal')} 
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Race Mode
          </Button>
          <Button 
            onClick={() => onSelectOption('aiOnly')} 
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            AI Only Mode
          </Button>
          <Button 
            onClick={() => onSelectOption('hiddenAI')} 
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Hidden AI Mode
          </Button>
        </div>
        <Button onClick={onClose} className="mt-4 w-full bg-gray-600 hover:bg-gray-700">
          Close
        </Button>
      </div>
    </div>
  );
};