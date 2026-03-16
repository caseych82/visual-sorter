import { motion, AnimatePresence } from 'framer-motion';
import type { AlgorithmMeta } from '../algorithms/types';

// ── Minimal syntax highlighter ─────────────────────────────────────────────────
const KEYWORDS = new Set([
  'function', 'return', 'const', 'let', 'var', 'if', 'else',
  'while', 'for', 'new', 'of', 'in', 'break', 'continue',
  'true', 'false', 'null', 'Math',
]);

type TokType = 'keyword' | 'comment' | 'string' | 'number' | 'plain';
interface Tok { type: TokType; text: string; }

function tokenize(code: string): Tok[] {
  const tokens: Tok[] = [];
  // Matches: line-comment | string literal | integer | identifier | any char
  const re = /(\/\/[^\n]*)|(["'`](?:[^"'`\\]|\\.)*["'`])|(\b\d+\b)|([A-Za-z_$][\w$]*)|([^])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const [, comment, str, num, ident, other] = m;
    if (comment)      tokens.push({ type: 'comment', text: comment });
    else if (str)     tokens.push({ type: 'string',  text: str });
    else if (num)     tokens.push({ type: 'number',  text: num });
    else if (ident)   tokens.push({ type: KEYWORDS.has(ident) ? 'keyword' : 'plain', text: ident });
    else              tokens.push({ type: 'plain',   text: other });
  }
  return tokens;
}

const TOK_CLASS: Record<TokType, string> = {
  keyword: 'text-violet-400',
  comment: 'text-zinc-500 italic',
  string:  'text-emerald-400',
  number:  'text-amber-400',
  plain:   'text-zinc-200',
};

function CodeBlock({ code }: { code: string }) {
  const tokens = tokenize(code);
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden bg-black/50">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/[0.03]">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        <span className="ml-2 text-[11px] text-white/25 font-mono">javascript</span>
      </div>
      <pre className="p-4 text-[12px] leading-[1.65] overflow-x-auto font-mono">
        <code>
          {tokens.map((tok, i) => (
            <span key={i} className={TOK_CLASS[tok.type]}>{tok.text}</span>
          ))}
        </code>
      </pre>
    </div>
  );
}

// ── Complexity badge ───────────────────────────────────────────────────────────
function Badge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-white/[0.04] rounded-lg px-3 py-2.5 border border-white/[0.07]">
      <span className="text-[10px] text-white/35 uppercase tracking-widest font-medium">{label}</span>
      <span className={`font-mono text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}

// ── Panel ──────────────────────────────────────────────────────────────────────
interface Props {
  algo: AlgorithmMeta | null;
  onClose: () => void;
}

export function AlgoInfoPanel({ algo, onClose }: Props) {
  return (
    <AnimatePresence>
      {algo && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            className="fixed right-0 top-0 h-full w-[420px] max-w-[95vw] z-50
                       bg-[#09091a]/95 backdrop-blur-2xl border-l border-white/10
                       flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-base font-bold text-white leading-tight">{algo.name}</h2>
                <p className="text-xs text-white/35 mt-1 leading-relaxed">{algo.description}</p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 mt-0.5 w-7 h-7 flex items-center justify-center rounded-lg
                           text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

              {/* Complexity grid */}
              <section>
                <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">
                  Complexity
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Badge label="Best"    value={algo.timeComplexity.best}    color="text-emerald-400" />
                  <Badge label="Average" value={algo.timeComplexity.average} color="text-yellow-400" />
                  <Badge label="Worst"   value={algo.timeComplexity.worst}   color="text-red-400" />
                  <Badge label="Space"   value={algo.spaceComplexity}        color="text-sky-400" />
                </div>
              </section>

              {/* How it works */}
              <section>
                <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">
                  How it works
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">{algo.explanation}</p>
              </section>

              {/* Code example */}
              <section>
                <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">
                  Code example
                </h3>
                <CodeBlock code={algo.codeExample} />
              </section>

            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
