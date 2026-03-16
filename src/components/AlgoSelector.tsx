import { motion } from 'framer-motion';
import type { AlgorithmMeta } from '../algorithms/types';

interface Props {
  algorithms: AlgorithmMeta[];
  selected: AlgorithmMeta | null;
  onSelect: (algo: AlgorithmMeta) => void;
}

export function AlgoSelector({ algorithms, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {algorithms.map((algo) => {
        const isSelected = selected?.id === algo.id;
        return (
          <motion.button
            key={algo.id}
            onClick={() => onSelect(algo)}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              isSelected
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {algo.name}
          </motion.button>
        );
      })}
    </div>
  );
}
