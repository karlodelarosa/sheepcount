const GRADIENTS = Array.from({ length: 16 }, (_, i) => `bg-gradient-${i + 1}`);

export function getGradients(initials?: string): string {
  if (!initials) return GRADIENTS[0];

  const sum = initials
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return GRADIENTS[sum % GRADIENTS.length];
}
