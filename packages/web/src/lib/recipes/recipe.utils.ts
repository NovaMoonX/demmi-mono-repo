export const capitalizeCuisine = (cuisine: string) => {
  return cuisine
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const getCuisineColorClass = (cuisine: string, colorMap: Record<string, string>): string => {
  return colorMap[cuisine] ?? 'bg-muted text-muted-foreground';
}