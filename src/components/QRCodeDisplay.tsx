import React, { useMemo } from 'react';

// Generates a deterministic SVG QR code pseudo-matrix from any payload token string
export function QRCodeDisplay({
  data,
  size = 140,
  className = '',
}: {
  data: string;
  size?: number;
  className?: string;
}) {
  const matrix = useMemo(() => {
    // Generate a 25x25 grid
    const dim = 25;
    const grid: boolean[][] = Array.from({ length: dim }, () => Array(dim).fill(false));

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }

    // Helper to draw standard QR corner finder patterns
    const drawFinder = (startRow: number, startCol: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            grid[startRow + r][startCol + c] = true;
          }
        }
      }
    };

    drawFinder(0, 0); // Top-left
    drawFinder(0, dim - 7); // Top-right
    drawFinder(dim - 7, 0); // Bottom-left

    // Alignment timing patterns
    for (let i = 8; i < dim - 8; i++) {
      if (i % 2 === 0) {
        grid[6][i] = true;
        grid[i][6] = true;
      }
    }

    // Pseudo-random data modules derived deterministically from the string hash
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        // Skip finder areas
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= dim - 8) ||
          (r >= dim - 8 && c < 8) ||
          r === 6 ||
          c === 6
        ) {
          continue;
        }

        const charIdx = (r * dim + c) % data.length;
        const charCode = data.charCodeAt(charIdx);
        const cellHash = (hash ^ (r * 31 + c * 17) ^ charCode) % 100;
        grid[r][c] = Math.abs(cellHash) < 48;
      }
    }

    return grid;
  }, [data]);

  const dim = matrix.length;
  const cellSize = size / dim;

  return (
    <div className={`inline-block p-2 bg-white rounded-lg shadow-inner ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
        xmlns="http://www.w3.org/2000/svg"
      >
        {matrix.map((row, r) =>
          row.map((active, c) => {
            if (!active) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#0f172a"
              />
            );
          })
        )}
      </svg>
    </div>
  );
}
