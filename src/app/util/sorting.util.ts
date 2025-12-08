import { Candidate } from '../types/types';

export const sortAttackers = (a: Candidate, b: Candidate) => {
  const aTopDamage = Math.max(...a.maxPhaseDamageDetails.map(damageDetails => damageDetails.damage));
  const bTopDamage = Math.max(...b.maxPhaseDamageDetails.map(damageDetails => damageDetails.damage));

  return bTopDamage - aTopDamage;
};

export const sortTanks = (a: Candidate, b: Candidate) => {
  return a.avgDamageTaken - b.avgDamageTaken;
};

export const sortHealers = (a: Candidate, b: Candidate) => {
  const totalUnhealedDamagePercentageDiff = a.totalUnhealedDamagePercentage - b.totalUnhealedDamagePercentage;

  if (totalUnhealedDamagePercentageDiff == 0) {
    return b.heal - a.heal;
  }

  return a.totalUnhealedDamagePercentage - b.totalUnhealedDamagePercentage;
};
