export interface TopN {
  key: string;
  count: number;
}

export interface ChapterNarrative {
  fr: string;
  ar: string;
  en: string;
}

export interface DependencyInsights {
  total_records: number;
  top_seed_countries: TopN[];
  top_plant_countries: TopN[];
  plant_category_breakdown: Record<string, number>;
  seed_material_breakdown: Record<string, number>;
  fruit_count: number;
  banana_count: number;
  banana_share_pct: number;
  xx_count: number;
  multi_origin_count: number;
  top_companies: TopN[];
  narrative?: ChapterNarrative;
}

export interface ChemicalsInsights {
  total: number;
  top_countries: TopN[];
  category_breakdown: Record<string, number>;
  top_companies: TopN[];
  top_active_substances: TopN[];
  hhi_companies: number;
  spain_count: number;
  italy_count: number;
  china_count: number;
  narrative?: ChapterNarrative;
}

export interface PlayersInsights {
  total_permits: number;
  unique_companies: number;
  top_10_share_pct: number;
  top_companies: TopN[];
  hhi_index: number;
  narrative?: ChapterNarrative;
}

export interface VeterinaryInsights {
  auth_count: number;
  distributor_count: number;
  importer_count: number;
  wilayas_covered: number;
  wilayas_absent: number;
  top_wilayas: TopN[];
  product_type_breakdown: Record<string, number>;
  product_type_labels: Record<string, ChapterNarrative>;
  narrative?: ChapterNarrative;
}

export interface Insights {
  dependency: DependencyInsights;
  chemicals: ChemicalsInsights;
  players: PlayersInsights;
  veterinary: VeterinaryInsights;
  generated_at: string;
}
