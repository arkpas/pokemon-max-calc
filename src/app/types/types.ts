export type Attack = {
  name: string;
  type: Type;
  power: number;
  duration: number;
  special: string | undefined;
};

export type PokemonBaseStats = {
  name: string;
  atk: number;
  def: number;
  hp: number;
};

export type Pokemon = PokemonBaseStats & {
  pokedexNumber: string;
  primaryType: string;
  secondaryType: string;
  isDynamax: boolean;
  isGigantamax: boolean;
  gigantamaxType: Type;
  hasHalfSecondAttack: boolean;
  fastAttacks: Attack[];
  chargedAttacks: Attack[];
};

export enum Type {
  Normal = 'Normal',
  Fighting = 'Fighting',
  Flying = 'Flying',
  Poison = 'Poison',
  Ground = 'Ground',
  Rock = 'Rock',
  Bug = 'Bug',
  Ghost = 'Ghost',
  Steel = 'Steel',
  Fire = 'Fire',
  Water = 'Water',
  Grass = 'Grass',
  Electric = 'Electric',
  Psychic = 'Psychic',
  Ice = 'Ice',
  Dragon = 'Dragon',
  Dark = 'Dark',
  Fairy = 'Fairy',
}

export type DamageConfiguration = {
  attacker: PokemonBaseStats;
  defender: PokemonBaseStats;
  power: number;
  move: string;
  moveType: string;
  typeEffectiveness: number;
  stab: number;
  damage: number;
  damagePercentage: number;
  unhealedDamagePercentage: number;
};

export type DamageDetails = {
  power: number;
  move: string;
  moveType: Type;
  typeEffectiveness: number;
  stab: number;
  damage: number;
  damagePercentage: number;
};

export type Candidate = {
  name: string;
  pokedexNumber: string;
  primaryType: Type;
  secondaryType: Type;
  def: number;
  hp: number;
  attacker: PokemonBaseStats;

  damageDetails: DamageDetails[];
};

export type TankCandidate = Candidate & {
  avgDamage: number;
  avgDamagePercentage: number;
};

export type HealerCandidate = Candidate & {
  totalUnhealedDamagePercentage: number;
  heal: number;
};
