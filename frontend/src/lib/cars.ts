export type BodyStyle = "sedan" | "wagon" | "hatch" | "suv" | "crossover";

export interface CarModel {
  make: string;
  model: string;
  defaultYear: number;
  fuel: string;
  body: BodyStyle;
  /** gradient identity for the art card */
  from: string;
  to: string;
  /** verified real photograph (Unsplash), where available */
  photo?: string;
}

/** The cars Bangladeshi workshops see every day. Picking from this list keeps
 *  make/model spelling consistent, which sharpens the diagnostics engine's
 *  fleet-history matching ("seen 3× on this model"). */
export const CAR_CATALOG: CarModel[] = [
  { make: "Toyota", model: "Premio", defaultYear: 2017, fuel: "petrol", body: "sedan", from: "#38bdf8", to: "#818cf8", photo: "https://images.unsplash.com/photo-1621846970446-5ca1afc09cc8?auto=format&fit=crop&w=1600&q=75" },
  { make: "Toyota", model: "Allion", defaultYear: 2016, fuel: "petrol", body: "sedan", from: "#22d3ee", to: "#34d399" },
  { make: "Toyota", model: "Corolla Axio", defaultYear: 2018, fuel: "hybrid", body: "sedan", from: "#4ade80", to: "#22d3ee" },
  { make: "Toyota", model: "Corolla Fielder", defaultYear: 2018, fuel: "hybrid", body: "wagon", from: "#2dd4bf", to: "#38bdf8" },
  { make: "Toyota", model: "Corolla Cross", defaultYear: 2021, fuel: "hybrid", body: "crossover", from: "#f472b6", to: "#818cf8", photo: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=1600&q=75" },
  { make: "Toyota", model: "Aqua", defaultYear: 2019, fuel: "hybrid", body: "hatch", from: "#38bdf8", to: "#2dd4bf" },
  { make: "Toyota", model: "Prius", defaultYear: 2018, fuel: "hybrid", body: "hatch", from: "#a3e635", to: "#2dd4bf" },
  { make: "Toyota", model: "Harrier", defaultYear: 2020, fuel: "hybrid", body: "suv", from: "#c084fc", to: "#38bdf8" },
  { make: "Toyota", model: "Land Cruiser 250", defaultYear: 2024, fuel: "diesel", body: "suv", from: "#fbbf24", to: "#f87171" },
  { make: "Toyota", model: "Land Cruiser 300", defaultYear: 2022, fuel: "petrol", body: "suv", from: "#f59e0b", to: "#84cc16" },
  { make: "Toyota", model: "Hiace", defaultYear: 2019, fuel: "diesel", body: "wagon", from: "#94a3b8", to: "#38bdf8" },
  { make: "Honda", model: "CR-V", defaultYear: 2019, fuel: "petrol", body: "suv", from: "#f87171", to: "#c084fc", photo: "https://images.unsplash.com/photo-1645099383164-319a0925f8bc?auto=format&fit=crop&w=1600&q=75" },
  { make: "Honda", model: "Civic", defaultYear: 2020, fuel: "petrol", body: "sedan", from: "#60a5fa", to: "#f472b6", photo: "https://images.unsplash.com/photo-1605816988069-b11383b50717?auto=format&fit=crop&w=1600&q=75" },
  { make: "Honda", model: "Vezel", defaultYear: 2019, fuel: "hybrid", body: "crossover", from: "#34d399", to: "#818cf8" },
  { make: "Nissan", model: "X-Trail", defaultYear: 2019, fuel: "petrol", body: "suv", from: "#fb923c", to: "#38bdf8" },
  { make: "Lexus", model: "LX570", defaultYear: 2019, fuel: "petrol", body: "suv", from: "#e879f9", to: "#fbbf24" },
  { make: "Lexus", model: "NX300", defaultYear: 2019, fuel: "petrol", body: "crossover", from: "#f43f5e", to: "#fb923c" },
  { make: "Mitsubishi", model: "Pajero", defaultYear: 2017, fuel: "diesel", body: "suv", from: "#4ade80", to: "#fbbf24" },
];

const DEFAULT_ART = { body: "sedan" as BodyStyle, from: "#64748b", to: "#38bdf8" };

/** Fuzzy-match a stored vehicle to its catalog art (falls back to a neutral sedan). */
export function carArtFor(make: string, model: string) {
  const m = `${make} ${model}`.toLowerCase();
  const hit = CAR_CATALOG.find(
    (c) =>
      m.includes(c.model.toLowerCase()) ||
      (c.model.toLowerCase().includes(model.trim().toLowerCase()) && model.trim().length >= 3)
  );
  return hit ?? { ...DEFAULT_ART, make, model, defaultYear: 2018, fuel: "petrol" };
}
