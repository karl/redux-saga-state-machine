import stringHash from 'string-hash';

const colors = [
  '#bae1ff', // blue
  '#baffc9', // green
  '#ffffba', // yellow
  '#ffdfba', // orange
  '#ffb3ba', // pink
  '#e6d5ff', // purple
  '#bbe1ff', // violet
  '#d1e800', // yellow-green
  '#ffd875', // dark-orange
  '#76f6d8', // teal
];

export const toColor = (key: string): string => {
  const index = Math.round(stringHash(key) / 429496729.5);
  return colors[index];
};
