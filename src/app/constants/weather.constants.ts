import { Type } from '../types/types';

export interface Weather {
  name: string;
  boostedTypes: Type[];
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
