import { motion } from 'framer-motion';
import type { AlgorithmMeta } from '../algorithms/types';

interface Props {
  algorithms: AlgorithmMeta[];
  selected: AlgorithmMeta | null;
  onSelect: (algo: AlgorithmMeta) => void;
  onInfo: (algo: AlgorithmMeta) => void;
}

export function AlgoSelector({ algorithms, selected, onSelect, onInfo }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {algorithms.map((algo) => {
        const isSelected = selected?.id === algo.id;
        const base = isSelected
          ? 'border-orange-500 text-white'
          : 'border-white/10 text-white/60 hover:text-white';

        return (
          <div key={algo.id} className="flex items-stretch">
            {/* Name — selects the algorithm */}
            <motion.button
              onClick={() => onSelect(algo)}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-l-lg text-sm font-medium border-y border-l
                          transition-colors ${base} ${
                isSelected ? 'bg-orange-600' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {algo.name}
            </motion.button>

            {/* ⓘ — opens info panel */}
            <button
              onClick={() => onInfo(algo)}
              title={`How ${algo.name} works`}
              className={`px-2 py-1.5 rounded-r-lg border text-xs font-bold transition-colors ${
                isSelected
                  ? 'bg-orange-700/70 border-orange-500 border-l-orange-400/40 text-orange-100 hover:bg-orange-500 hover:text-white'
                  : 'bg-white/5 border-white/10 border-l-white/5 text-white/45 hover:text-white hover:bg-white/15'
              }`}
            >
              ⓘ
            </button>
          </div>
        );
      })}
    </div>
  );
}
