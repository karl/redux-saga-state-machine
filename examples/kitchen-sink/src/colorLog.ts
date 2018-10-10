export const colorLog = (color: string, label: string, ...data: any[]) => {
  // tslint:disable-next-line:no-console
  console.log(
    `%c${label}`,
    `background-color: ${color}; color: #000; padding: 2px 4px; font-weight: bold;`,
    ...data,
  );
};
