export interface CharacterStats {
  power: number;      // 1-100
  speed: number;      // 1-100
  technique: number;  // 1-100
  popularity: number; // 1-100
}

export interface Character {
  id: string;
  name: string;
  series: string;
  role: string;
  blurb: string;
  themeColor: string; // Hex color (e.g. "#EF4444")
  motif: string;      // A single Japanese kanji or representative character/emoji
  stats: CharacterStats;
  img?: string;       // Optional custom image path
  crestSymbol?: string; // Secondary decorative visual anchor or word
}
