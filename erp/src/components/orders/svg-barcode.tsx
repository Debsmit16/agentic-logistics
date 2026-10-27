"use client";

import React, { useMemo } from "react";

/**
 * Standard Code 39 barcode encoding table.
 * Each character has 9 elements (5 bars, 4 spaces).
 * Exactly 3 elements are wide ('1'), 6 are narrow ('0').
 * Renders pure SVG <rect fill="#000000"> vectors so it prints
 * pitch-black regardless of browser "Background graphics" settings.
 */
const CODE39_ENCODINGS: Record<string, string> = {
  "0": "000110100",
  "1": "100100001",
  "2": "001100001",
  "3": "101100000",
  "4": "000110001",
  "5": "100110000",
  "6": "001110000",
  "7": "000100101",
  "8": "100100100",
  "9": "001100100",
  "A": "100001001",
  "B": "001001001",
  "C": "101001000",
  "D": "000011001",
  "E": "100011000",
  "F": "001011000",
  "G": "000001101",
  "H": "100001100",
  "I": "001001100",
  "J": "000011100",
  "K": "100000011",
  "L": "001000011",
  "M": "101000010",
  "N": "000010011",
  "O": "100010010",
  "P": "001010010",
  "Q": "000000111",
  "R": "100000110",
  "S": "001000110",
  "T": "000010110",
  "U": "110000001",
  "V": "011000001",
  "W": "111000000",
  "X": "010010001",
  "Y": "110010000",
  "Z": "011010000",
  "-": "010000101",
  ".": "110000100",
  " ": "011000100",
  "$": "010101000",
  "/": "010100010",
  "+": "010001010",
  "%": "000101010",
  "*": "010010100",
};

interface BarcodeRect {
  x: number;
  width: number;
}

export function SvgBarcode({
  value,
  height = 42,
  className = "",
}: {
  value: string;
  height?: number;
  className?: string;
}) {
  const { rects, totalWidth } = useMemo(() => {
    // Sanitize to Code 39 character set and wrap with start/stop '*'
    const clean = (value || "AWB-0000")
      .toUpperCase()
      .replace(/[^0-9A-Z\-.$/+% ]/g, "-");
    const fullString = `*${clean}*`;

    const narrow = 2;
    const wide = 5;
    const interGap = 2;

    const list: BarcodeRect[] = [];
    let currentX = 6; // quiet zone

    for (let i = 0; i < fullString.length; i++) {
      const char = fullString[i];
      const pattern = CODE39_ENCODINGS[char] || CODE39_ENCODINGS["-"];

      for (let elem = 0; elem < 9; elem++) {
        const isBar = elem % 2 === 0;
        const isWide = pattern[elem] === "1";
        const w = isWide ? wide : narrow;

        if (isBar) {
          list.push({ x: currentX, width: w });
        }
        currentX += w;
      }
      currentX += interGap;
    }

    currentX += 6; // trailing quiet zone
    return { rects: list, totalWidth: currentX };
  }, [value]);

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{
        display: "block",
        margin: "0 auto",
        maxWidth: "340px",
        height: `${height}px`,
        overflow: "visible",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {rects.map((bar, idx) => (
        <rect
          key={idx}
          x={bar.x}
          y={0}
          width={bar.width}
          height={height}
          fill="#000000"
        />
      ))}
    </svg>
  );
}
