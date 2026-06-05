export const CATEGORY_COLORS: Record<string, string> = {
  banane:      '#ca8a04',
  tomate:      '#dc2626',
  pommier:     '#ea580c',
  olive:       '#84823a',
  vigne:       '#7c3aed',
  mais:        '#d97706',
  fongicide:   '#16a34a',
  insecticide: '#b45309',
  herbicide:   '#0369a1',
  palmier:     '#92400e',
  fruits:      '#ca8a04',
  legumes:     '#16a34a',
};

const FOREST_DEFAULT = '#2d6a4f';

export function getCategoryColor(category: string): string {
  const key = category.toLowerCase();
  return CATEGORY_COLORS[key] ?? FOREST_DEFAULT;
}
