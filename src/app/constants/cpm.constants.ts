export type Cpm = {
  value: number;
  description: string;
};

// TODO: update with
// Dynamax Boss          | Tier     | Category | CPM     | HP        | Atk Mult | Def Mult
// Venusaur              | 6        | G        | 0.85    | 90000     | 1        | 1
// Charizard             | 6        | G        | 0.85    | 90000     | 1        | 1
// Blastoise             | 6        | G        | 0.85    | 90000     | 1        | 1
// Machamp               | 6        | G        | 0.72    | 115000    | 1        | 1
// Gengar                | 6        | G        | 0.765   | 90000     | 1        | 1
// Kingler               | 6        | G        | 0.765   | 115000    | 1        | 1
// Lapras                | 6        | G        | 0.765   | 90000     | 1        | 1
// Snorlax               | 6        | G        | 0.765   | 115000    | 1        | 1
// Articuno              | 5        | D        | 0.7     | 17500     | 2        | 1
// Zapdos                | 5        | D        | 0.7     | 13000     | 2        | 1
// Moltres               | 5        | D        | 0.7     | 17500     | 2        | 1
// Raikou                | 5        | D        | 0.8     | 23000     | 2        | 1
// Entei                 | 5        | D        | 0.8     | 23000     | 2        | 1
// Suicune               | 5        | D        | 0.8     | 22000     | 2        | 1
// Rillaboom             | 6        | G        | 0.9     | 135000    | 1        | 1
// Toxtricity (Amped Form)| 6       | G        | 0.765   | 180000    | 1.3333   | 1
// Toxtricity (Low Key Form)| 6     | G        | 0.765   | 180000    | 1.3333   | 1
export const CPMS: Cpm[] = [
  {
    value: 0.6,
    description: 'T4 Dynamax',
  },
  {
    value: 0.7,
    description: 'T5 Dynamax (Kanto Birds)',
  },
  {
    value: 0.8,
    description: 'T5 Dynamax (Johto Beasts)',
  },
  {
    value: 0.72,
    description: 'T6 Gigantamax (Machamp, Cinderace)',
  },
  {
    value: 0.765,
    description: 'T6 Gigantamax (Tox, Gengar, Kingler, Lapras, Snorlax)',
  },
    {
    value: 0.81,
    description: 'T6 Gigantamax (Inteleon)',
  },
  {
    value: 0.85,
    description: 'T6 Gigantamax (Kanto Starters)',
  },
  {
    value: 0.9,
    description: 'T6 Gigantamax (Rillaboom)',
  },
];

export const POKEMON_CPMS = [
  { value: 0.84529999, description: '51 lvl' },
  { value: 0.84279999, description: '50.5 lvl' },
  { value: 0.84029999, description: '50 lvl' },
  { value: 0.83779999, description: '49.5 lvl' },
  { value: 0.83529999, description: '49 lvl' },
  { value: 0.83279999, description: '48.5 lvl' },
  { value: 0.83029999, description: '48 lvl' },
  { value: 0.82779999, description: '47.5 lvl' },
  { value: 0.82529999, description: '47 lvl' },
  { value: 0.82279999, description: '46.5 lvl' },
  { value: 0.82029999, description: '46 lvl' },
  { value: 0.81779999, description: '45.5 lvl' },
  { value: 0.81529999, description: '45 lvl' },
  { value: 0.812799985, description: '44.5 lvl' },
  { value: 0.81029999, description: '44 lvl' },
  { value: 0.8078, description: '43.5 lvl' },
  { value: 0.8053, description: '43 lvl' },
  { value: 0.802799995, description: '42.5 lvl' },
  { value: 0.8003, description: '42 lvl' },
  { value: 0.797800015, description: '41.5 lvl' },
  { value: 0.79530001, description: '41 lvl' },
  { value: 0.792803968, description: '40.5 lvl' },
  { value: 0.7903, description: '40 lvl' },
  { value: 0.7874736075, description: '39.5 lvl' },
  { value: 0.784637, description: '39 lvl' },
  { value: 0.7817900548, description: '38.5 lvl' },
  { value: 0.77893275, description: '38 lvl' },
  { value: 0.7760649616, description: '37.5 lvl' },
  { value: 0.7731865, description: '37 lvl' },
  { value: 0.7702972656, description: '36.5 lvl' },
  { value: 0.76739717, description: '36 lvl' },
  { value: 0.7644860647, description: '35.5 lvl' },
  { value: 0.76156384, description: '35 lvl' },
  { value: 0.7586303683, description: '34.5 lvl' },
  { value: 0.7556855, description: '34 lvl' },
  { value: 0.7527290867, description: '33.5 lvl' },
  { value: 0.74976104, description: '33 lvl' },
  { value: 0.7467812109, description: '32.5 lvl' },
  { value: 0.74378943, description: '32 lvl' },
  { value: 0.7407855938, description: '31.5 lvl' },
  { value: 0.7377695, description: '31 lvl' },
  { value: 0.7347410093, description: '30.5 lvl' },
  { value: 0.7317, description: '30 lvl' },
  { value: 0.7255756136, description: '29.5 lvl' },
  { value: 0.7193991, description: '29 lvl' },
  { value: 0.7131691091, description: '28.5 lvl' },
  { value: 0.7068842, description: '28 lvl' },
  { value: 0.70054287, description: '27.5 lvl' },
  { value: 0.69414365, description: '27 lvl' },
  { value: 0.6876849038, description: '26.5 lvl' },
  { value: 0.6811649, description: '26 lvl' },
  { value: 0.6745818959, description: '25.5 lvl' },
  { value: 0.667934, description: '25 lvl' },
  { value: 0.6612192524, description: '24.5 lvl' },
  { value: 0.65443563, description: '24 lvl' },
  { value: 0.6475809666, description: '23.5 lvl' },
  { value: 0.64065295, description: '23 lvl' },
  { value: 0.6336491432, description: '22.5 lvl' },
  { value: 0.6265671, description: '22 lvl' },
  { value: 0.6194041216, description: '21.5 lvl' },
  { value: 0.6121573, description: '21 lvl' },
  { value: 0.6048236651, description: '20.5 lvl' },
  { value: 0.5974, description: '20 lvl' },
  { value: 0.5898879072, description: '19.5 lvl' },
  { value: 0.5822789, description: '19 lvl' },
  { value: 0.5745691333, description: '18.5 lvl' },
  { value: 0.5667545, description: '18 lvl' },
  { value: 0.5588305862, description: '17.5 lvl' },
  { value: 0.5507927, description: '17 lvl' },
  { value: 0.5426357375, description: '16.5 lvl' },
  { value: 0.5343543, description: '16 lvl' },
  { value: 0.5259425113, description: '15.5 lvl' },
  { value: 0.51739395, description: '15 lvl' },
  { value: 0.508701765, description: '14.5 lvl' },
  { value: 0.49985844, description: '14 lvl' },
  { value: 0.4908558003, description: '13.5 lvl' },
  { value: 0.48168495, description: '13 lvl' },
  { value: 0.472336093, description: '12.5 lvl' },
  { value: 0.4627984, description: '12 lvl' },
  { value: 0.4530599591, description: '11.5 lvl' },
  { value: 0.44310755, description: '11 lvl' },
  { value: 0.4329264091, description: '10.5 lvl' },
  { value: 0.4225, description: '10 lvl' },
  { value: 0.4111935514, description: '9.5 lvl' },
  { value: 0.39956728, description: '9 lvl' },
  { value: 0.387592416, description: '8.5 lvl' },
  { value: 0.3752356, description: '8 lvl' },
  { value: 0.3624577511, description: '7.5 lvl' },
  { value: 0.34921268, description: '7 lvl' },
  { value: 0.3354450362, description: '6.5 lvl' },
  { value: 0.3210876, description: '6 lvl' },
  { value: 0.3060573775, description: '5.5 lvl' },
  { value: 0.29024988, description: '5 lvl' },
  { value: 0.2735303812, description: '4.5 lvl' },
  { value: 0.25572005, description: '4 lvl' },
  { value: 0.2365726613, description: '3.5 lvl' },
  { value: 0.21573247, description: '3 lvl' },
  { value: 0.192650919, description: '2.5 lvl' },
  { value: 0.16639787, description: '2 lvl' },
  { value: 0.1351374318, description: '1.5 lvl' },
  { value: 0.094, description: '1 lvl' },
];
