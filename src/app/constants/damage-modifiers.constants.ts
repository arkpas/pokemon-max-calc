import { Type } from '../types/types';

export interface Weather {
  name: string;
  boostedTypes: Type[];
}

export interface Modifier {
  name: string;
  value: number;
}

export const WEATHERS: Weather[] = [
  {
    name: 'No boost',
    boostedTypes: [],
  },
  {
    name: 'Sunny / Clear',
    boostedTypes: [Type.Fire, Type.Grass, Type.Ground],
  },
  {
    name: 'Partly Cloudy',
    boostedTypes: [Type.Normal, Type.Rock],
  },
  {
    name: 'Cloudy / Overcast',
    boostedTypes: [Type.Fairy, Type.Fighting, Type.Poison],
  },
  {
    name: 'Windy',
    boostedTypes: [Type.Dragon, Type.Flying, Type.Psychic],
  },
  {
    name: 'Rain',
    boostedTypes: [Type.Bug, Type.Electric, Type.Water],
  },
  {
    name: 'Fog',
    boostedTypes: [Type.Dark, Type.Ghost],
  },
  {
    name: 'Snow',
    boostedTypes: [Type.Ice, Type.Steel],
  },
  {
    name: 'All boosted',
    boostedTypes: [
      Type.Normal,
      Type.Fighting,
      Type.Flying,
      Type.Poison,
      Type.Ground,
      Type.Rock,
      Type.Bug,
      Type.Ghost,
      Type.Steel,
      Type.Fire,
      Type.Water,
      Type.Grass,
      Type.Electric,
      Type.Psychic,
      Type.Ice,
      Type.Dragon,
      Type.Dark,
      Type.Fairy,
    ],
  },
];

export const FRIENDSHIPS: Modifier[] = [
  {
    name: 'None',
    value: 1,
  },
  {
    name: 'Good Friends',
    value: 1.03,
  },
  {
    name: 'Great Friends',
    value: 1.05,
  },
  {
    name: 'Ultra Friends',
    value: 1.07,
  },
  {
    name: 'Best Friends',
    value: 1.1,
  },
  {
    name: 'Forever Friends',
    value: 1.12,
  },
];

export enum AdventureEffect {
  NONE = 'None',
  BEHEMOTH_BASH = 'Behemoth Bash',
  BEHEMOTH_BLADE = 'Behemoth Blade',
  DYNAMAX_CANNON = 'Dynamax Cannon',
}

export const BEHEMOTH_BASH_MAX_BATTLES_MODIFIER = 0.9523809524;
export const BEHEMOTH_BLADE_MAX_BATTLES_MODIFIER = 1.05;
export const DYNAMAX_CANNON_BONUS_POWER = 100;

export const HELPERS: Modifier[] = [
  { name: '0', value: 1.0 },
  { name: '1', value: 1.1 },
  { name: '2', value: 1.15 },
  { name: '3', value: 1.17 },
  { name: '4', value: 1.18 },
  { name: '5', value: 1.187 },
  { name: '6', value: 1.191 },
  { name: '7', value: 1.192 },
  { name: '8', value: 1.193 },
  { name: '9', value: 1.194 },
  { name: '10', value: 1.195 },
  { name: '11', value: 1.196 },
  { name: '12', value: 1.197 },
  { name: '13', value: 1.198 },
  { name: '14', value: 1.199 },
  { name: '15+', value: 1.2 },
];
