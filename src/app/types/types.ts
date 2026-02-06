import { Moment } from 'moment';

export interface OpponentConfiguration {
  opponentName: string;
  opponentCpm: number;
  opponentHp: number;
  opponentAtkMod: number;
  opponentDefMod: number;
}

export interface AllyConfiguration {
  allyCpm: number;
  allyAtkIV: number;
  allyDefIV: number;
  allyHpIV: number;
}

export interface BattleConfiguration extends OpponentConfiguration, AllyConfiguration {
  date: Moment;
  teamOption: TeamOption;
  weatherBoostedTypes: Type[];
}

export interface Attack {
  name: string;
  type: Type;
  power: number;
  energy: number;
  duration: number;
  damageWindowStart: number;
  special: string;
}

export interface PokemonBase {
  pokedexNumber: string;
  primaryType: Type;
  secondaryType: Type;
  cpm: number;
}

export interface PokemonStats {
  name: string;
  atk: number;
  def: number;
  hp: number;
}

export interface PokemonIV {
  atkIV: number;
  defIV: number;
  hpIV: number;
}

export interface Pokemon extends PokemonBase, PokemonStats, PokemonIV {
  dynamaxDate: Moment;
  gigantamaxDate: Moment;
  dynamaxType: Type;
  gigantamaxType: Type;
  hasHalfSecondAttack: boolean;
  fastAttacks: Attack[];
  chargedAttacks: Attack[];
  myPokemonId: string;
}

export interface MyPokemon extends PokemonIV {
  id: string;
  name: string;
  cpm: number;
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

export enum TeamOption {
  allPokemons = 'Use all Pokemon',
  onlyMyPokemons = 'Use only My Pokemon',
  onlyDefaultPokemons = 'Use only default Pokemon',
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

export interface StaticDamageModifiers {
  friendship: number;
  dodged: number;
  mega: number;
  trainer: number;
  charged: number;
  party: number;
  support: number;
  spread: number;
}

export interface DynamicDamageModifiers {
  typeEffectiveness: number;
  stab: number;
  weather: number;
}

export interface DamageModifiers extends StaticDamageModifiers, DynamicDamageModifiers {}

export interface DamageDetails {
  move: Attack;
  damageModifiers: DamageModifiers;
  damage: number;
  damagePercentage: number;
  unhealedDamagePercentage: number;
  maxEnergy: number;
  damagePerTurn: number;
  maxEnergyPerTurn: number;
}

export interface Candidate extends Pokemon {
  fastAttackDamageDetails: DamageDetails[];
  chargedAttackDamageDetails: DamageDetails[];
  maxPhaseDamageDetails: DamageDetails[];
  damageTakenDetails: DamageDetails[];
  avgDamageTaken: number;
  avgDamageTakenPercentage: number;
  heal: number;
  totalUnhealedDamagePercentage: number;
}
