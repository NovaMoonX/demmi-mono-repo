export const capitalizeCuisine = (cuisine: string) => {
  return cuisine
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}