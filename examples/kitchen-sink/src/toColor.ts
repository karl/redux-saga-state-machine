const hashCode = (text: string) => {
  let hash = 0;
  let i;
  let chr;
  if (text.length === 0) {
    return hash;
  }
  for (i = 0; i < text.length; i++) {
    chr = text.charCodeAt(i);
    // tslint:disable-next-line
    hash = (hash << 5) - hash + chr;
    // tslint:disable-next-line
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

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
  const index = Math.abs(Math.round((hashCode(key) / 10) % 10));
  return colors[index];
};
