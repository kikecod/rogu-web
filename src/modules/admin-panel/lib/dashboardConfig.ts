import type { EntityCardData, MetricCardData } from '../types';

export const entityCardsConfig: EntityCardData[] = [];

export const metricsCardsConfig: MetricCardData[] = [];

export const getDashboardData = async () => ({
  entityCards: [],
  metricsCards: [],
});

export const updateEntityCardData = (
  cardId: string,
  updates: Partial<EntityCardData>
): EntityCardData | undefined => {
  const card = entityCardsConfig.find((c) => c.id === cardId);
  if (!card) return undefined;

  return { ...card, ...updates };
};

export const updateMetricCardData = (
  cardId: string,
  updates: Partial<MetricCardData>
): MetricCardData | undefined => {
  const card = metricsCardsConfig.find((c) => c.id === cardId);
  if (!card) return undefined;

  return { ...card, ...updates };
};
