import { useState, useCallback } from "react";
import type { Puzzle, PieceKey } from "./types";
import { PIECE_DEFS, DEFAULT_THETA, DEFAULT_PHI } from "./constants";
import { encodePuzzle, decodePuzzle, generatePuzzle } from "./utils/encode";
import { IsometricView } from "./components/IsometricView";
import { PiecePreview } from "./components/PiecePreview";

export default function App() {
  // Load initial state from URL query parameter
  const initialState = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      const result = decodePuzzle(id);
      if (result) {
        const keys = new Set(id.split("-")[0].split(""));
        return {
          puzzle: result,
          puzzleId: id,
          selected: keys,
          idInput: id,
        };
      }
    }
    return {
      puzzle: null,
      puzzleId: "",
      selected: new Set<string>(),
      idInput: "",
    };
  };

  const initial = initialState();
  const [selected, setSelected] = useState<Set<string>>(initial.selected);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(initial.puzzle);
  const [showAnswer, setShowAnswer] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [puzzleId, setPuzzleId] = useState(initial.puzzleId);
  const [idInput, setIdInput] = useState(initial.idInput);
  const [theta, setTheta] = useState(DEFAULT_THETA);
  const [phi, setPhi] = useState(DEFAULT_PHI);
  const [copied, setCopied] = useState(false);

  const togglePiece = (key: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(key)) {
        n.delete(key);
      } else {
        n.add(key);
      }
      return n;
    });
    setPuzzle(null);
    setShowAnswer(false);
    setError(null);
    setPuzzleId("");
  };

  const generate = useCallback(() => {
    if (selected.size < 2) return;
    setGenerating(true);
    setError(null);
    setShowAnswer(false);
    setTheta(DEFAULT_THETA);
    setPhi(DEFAULT_PHI);

    setTimeout(() => {
      const r = generatePuzzle([...selected], 400);
      if (r) {
        setPuzzle(r);
        const id = encodePuzzle(r.pieces);
        setPuzzleId(id);
        console.log("Puzzle ID:", id);
      } else {
        setError("生成に失敗しました。もう一度お試しください。");
        setPuzzle(null);
        setPuzzleId("");
      }
      setGenerating(false);
    }, 50);
  }, [selected]);

  const loadFromId = useCallback(() => {
    const trimmed = idInput.trim();
    if (!trimmed) return;

    const result = decodePuzzle(trimmed);
    if (result) {
      setPuzzle(result);
      setPuzzleId(trimmed);
      setShowAnswer(false);
      setError(null);
      setTheta(DEFAULT_THETA);
      setPhi(DEFAULT_PHI);
      const keys = new Set(trimmed.split("-")[0].split(""));
      setSelected(keys);
    } else {
      setError("無効なIDです。正しいIDを入力してください。");
    }
  }, [idInput]);

  const copyUrl = useCallback(() => {
    if (!puzzleId) return;
    const url = `${window.location.origin}${window.location.pathname}?id=${puzzleId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }, [puzzleId]);

  const shareToX = useCallback(() => {
    if (!puzzleId) return;
    const url = `${window.location.origin}${window.location.pathname}?id=${puzzleId}`;
    const text = `Cube Puzzleに挑戦！ 使用ブロック: ${[...selected].join(", ")}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank");
  }, [puzzleId, selected]);

  const handleDrag = useCallback((dx: number, dy: number) => {
    setTheta(p => p - dx * 0.008);
    setPhi(p => Math.max(0.05, Math.min(Math.PI / 2 - 0.05, p + dy * 0.008)));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)", fontFamily: "'Segoe UI','Hiragino Sans','Meiryo',sans-serif", color: "#e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-block", background: "linear-gradient(135deg,#f97316,#ef4444,#8b5cf6,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 34, fontWeight: 900, letterSpacing: "-0.02em" }}>
          Cube Puzzle Generator
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "20px 24px", marginBottom: 24, border: "1px solid rgba(255,255,255,0.06)", width: "100%", maxWidth: 520 }}>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12, fontWeight: 600 }}>使用ブロックを選択（2つ以上）</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {(Object.keys(PIECE_DEFS) as PieceKey[]).map(key => {
            const sel = selected.has(key);
            const d = PIECE_DEFS[key];
            return (
              <button
                key={key}
                onClick={() => togglePiece(key)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "8px 10px",
                  borderRadius: 12,
                  border: sel ? `2px solid ${d.color}` : "2px solid rgba(255,255,255,0.08)",
                  background: sel ? `${d.color}18` : "rgba(255,255,255,0.02)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  transform: sel ? "scale(1.05)" : "scale(1)",
                  boxShadow: sel ? `0 0 20px ${d.color}30` : "none",
                  minWidth: 64
                }}
              >
                <PiecePreview pieceKey={key} />
                <span style={{ fontSize: 11, fontWeight: 700, color: sel ? d.color : "#64748b" }}>{key}</span>
              </button>
            );
          })}
        </div>
        {selected.size > 0 && (
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#64748b" }}>
            選択中: {[...selected].join(", ")}
          </div>
        )}
      </div>

      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "16px 24px", marginBottom: 24, border: "1px solid rgba(255,255,255,0.06)", width: "100%", maxWidth: 520 }}>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 600 }}>IDから問題を読み込み</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={idInput}
            onChange={e => setIdInput(e.target.value)}
            placeholder="例: ADF-a3k2m"
            onKeyDown={e => { if (e.key === "Enter") loadFromId(); }}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#e2e8f0", fontSize: 14, fontFamily: "monospace", outline: "none" }}
          />
          <button
            onClick={loadFromId}
            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            読み込み
          </button>
        </div>
      </div>

      <button
        onClick={generate}
        disabled={selected.size < 2 || generating}
        style={{
          padding: "14px 48px",
          borderRadius: 12,
          border: "none",
          background: selected.size >= 2 ? "linear-gradient(135deg,#f97316,#ef4444)" : "rgba(255,255,255,0.06)",
          color: selected.size >= 2 ? "#fff" : "#475569",
          fontSize: 16,
          fontWeight: 700,
          cursor: selected.size >= 2 ? "pointer" : "not-allowed",
          boxShadow: selected.size >= 2 ? "0 4px 24px rgba(249,115,22,0.3)" : "none",
          marginBottom: 24,
          opacity: generating ? 0.7 : 1
        }}
      >
        {generating ? "生成中..." : "🎲 問題を生成"}
      </button>

      {error && <div style={{ color: "#f87171", fontSize: 14, marginBottom: 16 }}>{error}</div>}

      {puzzle && (
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.06)", width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {puzzleId && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, width: "100%" }}>
              <span style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>ID:</span>
              <code style={{ flex: 1, fontSize: 14, color: "#e2e8f0", background: "rgba(255,255,255,0.06)", padding: "6px 10px", borderRadius: 6, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis" }}>
                {puzzleId}
              </code>
              <button
                onClick={copyUrl}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                  color: copied ? "#4ade80" : "#94a3b8",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s"
                }}
              >
                {copied ? "✓ コピー済" : "URLコピー"}
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>使用ブロック:</span>
            {[...selected].map(k => (
              <div key={k}>
                <PiecePreview pieceKey={k as PieceKey} size={40} />
              </div>
            ))}
          </div>

          <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.3)" }}>
            <IsometricView
              cubes={puzzle.allCubes}
              width={380}
              height={340}
              showAnswer={showAnswer}
              pieces={puzzle.pieces}
              theta={theta}
              phi={phi}
              onDrag={handleDrag}
            />
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: showAnswer ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
                color: showAnswer ? "#a78bfa" : "#94a3b8",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {showAnswer ? "🔒 答えを隠す" : "👁 答えを見る"}
            </button>
            <button
              onClick={() => { setTheta(DEFAULT_THETA); setPhi(DEFAULT_PHI); }}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: "#94a3b8",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              ↩ 視点リセット
            </button>
            <button
              onClick={shareToX}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(59,130,246,0.15)",
                color: "#60a5fa",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              𝕏 ポスト
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
