import { Moment } from 'moment';

export interface OpponentConfiguration {
  opponentName: string;
  opponentCpm: number;
  opponentHp: number;
  opponentAtkMod: number;
  opponentDefMod: number;
}

export interface BattleConfiguration extends OpponentConfiguration {
  date: Moment;
  allyCpm: number;
  allyAtkIV: number;
  allyDefIV: number;
  allyHpIV: number;
}

export interface SimulationResults {
  opponent: Pokemon;
  attackers: DamageConfiguration[];
  tanks: TankCandidate[];
  sponges: TankCandidate[];
  healers: HealerCandidate[];
}

export interface Attack {
  name: string;
  type: Type;
  power: number;
  energy: number;
  duration: number;
  special: string | undefined;
}

export interface PokemonBaseStats {
  name: string;
  atk: number;
  def: number;
  hp: number;
}

export interface Pokemon extends PokemonBaseStats {
  pokedexNumber: string;
  primaryType: Type;
  secondaryType: Type;
  dynamaxDate: Moment;
  gigantamaxDate: Moment;
  dynamaxType: Type;
  gigantamaxType: Type;
  hasHalfSecondAttack: boolean;
  fastAttacks: Attack[];
  chargedAttacks: Attack[];
}

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

export interface DamageConfiguration {
  attacker: PokemonBaseStats;
  defender: PokemonBaseStats;
  move: Attack;
  typeEffectiveness: number;
  stab: number;
  damage: number;
  damagePercentage: number;
  unhealedDamagePercentage: number;
  maxEnergy: number;
  dphs: number;
  mephs: number;
}

export interface ComboDamageConfiguration {
  pokemon: string;
  faName: string;
  faDmg: number;
  faMaxEnergy: number;
  faCount: number;
  caName: string;
  caDmg: number;
  caMaxEnergy: number;
  caCount: number;
  totalMaxEnergy: number;
  totalDmg: number;
  totalDuration: number;
  dphs: number;
  mephs: number;
}

export interface DamageDetails {
  power: number;
  move: string;
  moveType: Type;
  duration: number;
  typeEffectiveness: number;
  stab: number;
  damage: number;
  damagePercentage: number;
}

export interface Candidate {
  name: string;
  pokedexNumber: string;
  primaryType: Type;
  secondaryType: Type;
  def: number;
  hp: number;
  attacker: PokemonBaseStats;

  damageDetails: DamageDetails[];
  fastAttacks: DamageDetails[];
}

export interface TankCandidate extends Candidate {
  avgDamage: number;
  avgDamagePercentage: number;
  hasHalfSecondAttack: boolean;
}

export interface HealerCandidate extends Candidate {
  totalUnhealedDamagePercentage: number;
  heal: number;
}
