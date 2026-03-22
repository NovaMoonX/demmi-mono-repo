import { MEASUREMENT_UNITS, MeasurementUnit } from '@lib/ingredients';
import type { OpenFoodFactsProduct } from '@store/api/openFoodFactsApi';

const SUPPORTED_SERVING_UNITS = MEASUREMENT_UNITS.filter(
  (unit) => unit !== 'other',
);

const SUPPORTED_SERVING_UNITS_PATTERN = SUPPORTED_SERVING_UNITS
  .slice()
  .sort((firstUnit, secondUnit) => secondUnit.length - firstUnit.length)
  .join('|');

const SERVING_INFO_REGEX = new RegExp(
  `(\\d+(?:\\.\\d+)?(?:\\/\\d+(?:\\.\\d+)?)?)\\s*(${SUPPORTED_SERVING_UNITS_PATTERN})\\b`,
  'gi',
);

type ServingInfoSource = 'imported' | 'label' | 'quantity' | 'fallback';

function isMeasurementUnit(value: string): value is MeasurementUnit {
  const result = MEASUREMENT_UNITS.includes(value as MeasurementUnit);
  return result;
}

function parseServingQuantity(value: string) {
  if (value.includes('/')) {
    const [numeratorText, denominatorText] = value.split('/');
    const numerator = Number(numeratorText);
    const denominator = Number(denominatorText);
    if (!Number.isNaN(numerator) && !Number.isNaN(denominator) && denominator !== 0) {
      const result = numerator / denominator;
      return result;
    }
  }

  const parsedValue = Number(value);
  if (Number.isNaN(parsedValue)) {
    return 0;
  }

  const result = parsedValue;
  return result;
}

function parseServingInfoFromText(servingText: string) {
  const matches = Array.from(servingText.matchAll(SERVING_INFO_REGEX));

  const parsedMatches: Array<{ servingSize: number; unit: MeasurementUnit }> = [];
  matches.forEach((match) => {
    const parsedSize = parseServingQuantity(match[1] ?? '0');
    const parsedUnit = (match[2] ?? '').toLowerCase();
    if (parsedSize <= 0 || !isMeasurementUnit(parsedUnit) || parsedUnit === 'other') {
      return;
    }

    parsedMatches.push({
      servingSize: parsedSize,
      unit: parsedUnit,
    });
  });

  const metricMatch = parsedMatches.find((match) => match.unit === 'g' || match.unit === 'ml');
  if (metricMatch != null) {
    const result = metricMatch;
    return result;
  }

  const firstMatch = parsedMatches[0] ?? null;
  if (firstMatch != null) {
    const result = firstMatch;
    return result;
  }

  const result = null;
  return result;
}

function roundToFirstDecimal(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0);
  if (Number.isNaN(numericValue)) {
    return 0;
  }

  const result = Math.round(numericValue * 10) / 10;
  return result;
}

interface ServingInfo {
  source: ServingInfoSource;
  servingSize: number;
  unit: MeasurementUnit;
  otherUnit: string | null;
}

interface BarcodePrefill {
  barcode: string | null;
  name: string;
  imageUrl: string;
  servingSize: number;
  unit: MeasurementUnit;
  otherUnit: string | null;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  calories: number;
}

interface BarcodePrefillOption {
  id: string;
  label: string;
  description: string;
  prefill: BarcodePrefill;
}

interface BarcodePrefillOptionsResult {
  options: BarcodePrefillOption[];
  defaultOptionId: string;
  hasMultipleOptions: boolean;
}

function getServingInfoFromProduct(
  product: OpenFoodFactsProduct | null | undefined,
): ServingInfo {
  const quantityServingInfo = getServingInfoFromQuantity(product);
  const labelServingInfo = getServingInfoFromLabel(product);
  const importedServingInfo = getServingInfoFromImported(product);

  const result =
    quantityServingInfo ??
    labelServingInfo ??
    importedServingInfo ?? {
      source: 'fallback',
      servingSize: 100,
      unit: 'g',
      otherUnit: null,
    };

  return result;
}

function getServingInfoFromImported(
  product: OpenFoodFactsProduct | null | undefined,
) {
  const importedServingSizeText = product?.serving_size_imported ?? '';
  const importedServingInfo = parseServingInfoFromText(importedServingSizeText);
  if (importedServingInfo != null) {
    const result: ServingInfo = {
      source: 'imported',
      servingSize: importedServingInfo.servingSize,
      unit: importedServingInfo.unit,
      otherUnit: null,
    };
    return result;
  }

  const result = null;
  return result;
}

function getServingInfoFromLabel(
  product: OpenFoodFactsProduct | null | undefined,
) {
  const servingSizeText = product?.serving_size ?? '';
  const labelServingInfo = parseServingInfoFromText(servingSizeText);
  if (labelServingInfo != null) {
    const result: ServingInfo = {
      source: 'label',
      servingSize: labelServingInfo.servingSize,
      unit: labelServingInfo.unit,
      otherUnit: null,
    };
    return result;
  }

  const result = null;
  return result;
}

function getServingInfoFromQuantity(
  product: OpenFoodFactsProduct | null | undefined,
) {
  const rawUnit = (product?.serving_quantity_unit ?? '').toLowerCase().trim();
  const explicitServingQuantity = Number(product?.serving_quantity ?? 0);
  if (explicitServingQuantity > 0 && isMeasurementUnit(rawUnit) && rawUnit !== 'other') {
    const result: ServingInfo = {
      source: 'quantity',
      servingSize: explicitServingQuantity,
      unit: rawUnit,
      otherUnit: null,
    };
    return result;
  }

  const result = null;
  return result;
}

function getServingNutrientValue(
  servingValue: number | undefined,
  per100Value: number | undefined,
  targetServingSize: number,
  referenceServingSize: number,
) {
  const safeReferenceServingSize = Number(referenceServingSize);
  const hasUsableReference =
    !Number.isNaN(safeReferenceServingSize) && safeReferenceServingSize > 0;

  if (servingValue != null && hasUsableReference) {
    const adjustedServingValue =
      Number(servingValue) * (targetServingSize / safeReferenceServingSize);
    const result = roundToFirstDecimal(adjustedServingValue);
    return result;
  }

  const normalizedPer100Value = Number(per100Value ?? 0);
  const computedServingValue = (normalizedPer100Value * targetServingSize) / 100;
  const result = roundToFirstDecimal(computedServingValue);
  return result;
}

function getServingInfoCandidates(product: OpenFoodFactsProduct | null | undefined) {
  const candidates: ServingInfo[] = [];

  const quantityServingInfo = getServingInfoFromQuantity(product);
  if (quantityServingInfo != null) {
    candidates.push(quantityServingInfo);
  }

  const importedServingInfo = getServingInfoFromImported(product);
  if (importedServingInfo != null) {
    candidates.push(importedServingInfo);
  }

  const labelServingInfo = getServingInfoFromLabel(product);
  if (labelServingInfo != null) {
    candidates.push(labelServingInfo);
  }

  const uniqueCandidates: ServingInfo[] = [];
  const seenCandidateKeys = new Set<string>();

  candidates.forEach((candidate) => {
    const candidateKey = `${candidate.servingSize}|${candidate.unit}|${candidate.otherUnit ?? ''}`;
    if (seenCandidateKeys.has(candidateKey)) {
      return;
    }
    seenCandidateKeys.add(candidateKey);
    uniqueCandidates.push(candidate);
  });

  if (uniqueCandidates.length === 0) {
    const fallbackCandidate: ServingInfo = {
      source: 'fallback',
      servingSize: 100,
      unit: 'g',
      otherUnit: null,
    };
    uniqueCandidates.push(fallbackCandidate);
  }

  const result = uniqueCandidates;
  return result;
}

function getServingOptionDescription(servingInfo: ServingInfo) {
  const sizeText = roundToFirstDecimal(servingInfo.servingSize).toString();
  const result = `${sizeText} ${servingInfo.unit} serving`;
  return result;
}

function buildPrefillFromServingInfo(
  product: OpenFoodFactsProduct | null | undefined,
  barcode: string | null,
  targetServingInfo: ServingInfo,
  referenceServingInfo: ServingInfo,
): BarcodePrefill {
  const nutrients = product?.nutriments;
  const sodiumServingInMg = Number(nutrients?.sodium_serving ?? 0) * 1000;
  const sodiumPer100InMg = Number(nutrients?.sodium_100g ?? 0) * 1000;

  const targetServingSize = targetServingInfo.servingSize;
  const referenceServingSize = referenceServingInfo.servingSize;

  const result: BarcodePrefill = {
    barcode,
    name: product?.product_name ?? '',
    imageUrl: product?.image_url ?? '',
    servingSize: roundToFirstDecimal(targetServingSize),
    unit: targetServingInfo.unit,
    otherUnit: targetServingInfo.otherUnit,
    protein: getServingNutrientValue(
      nutrients?.proteins_serving,
      nutrients?.proteins_100g,
      targetServingSize,
      referenceServingSize,
    ),
    carbs: getServingNutrientValue(
      nutrients?.carbohydrates_serving,
      nutrients?.carbohydrates_100g,
      targetServingSize,
      referenceServingSize,
    ),
    fat: getServingNutrientValue(
      nutrients?.fat_serving,
      nutrients?.fat_100g,
      targetServingSize,
      referenceServingSize,
    ),
    fiber: getServingNutrientValue(
      nutrients?.fiber_serving,
      nutrients?.fiber_100g,
      targetServingSize,
      referenceServingSize,
    ),
    sugar: getServingNutrientValue(
      nutrients?.sugars_serving,
      nutrients?.sugars_100g,
      targetServingSize,
      referenceServingSize,
    ),
    sodium: getServingNutrientValue(
      sodiumServingInMg,
      sodiumPer100InMg,
      targetServingSize,
      referenceServingSize,
    ),
    calories: getServingNutrientValue(
      nutrients?.['energy-kcal_serving'],
      nutrients?.['energy-kcal_100g'],
      targetServingSize,
      referenceServingSize,
    ),
  };

  return result;
}

export function getBarcodePrefillOptions(
  product: OpenFoodFactsProduct | null | undefined,
  barcode: string | null,
): BarcodePrefillOptionsResult {
  const candidates = getServingInfoCandidates(product);
  const referenceServingInfo = getServingInfoFromProduct(product);

  const options = candidates.map((candidate, index) => {
    const optionId = `${candidate.source}-${index}`;
    const alphabetLabel = String.fromCharCode(65 + index);
    const option: BarcodePrefillOption = {
      id: optionId,
      label: `Option ${alphabetLabel}`,
      description: getServingOptionDescription(candidate),
      prefill: buildPrefillFromServingInfo(
        product,
        barcode,
        candidate,
        referenceServingInfo,
      ),
    };

    return option;
  });

  const defaultOption =
    options.find((option) => option.id.startsWith(`${referenceServingInfo.source}-`)) ??
    options[0];

  const result: BarcodePrefillOptionsResult = {
    options,
    defaultOptionId: defaultOption?.id ?? '',
    hasMultipleOptions: options.length > 1,
  };

  return result;
}

export function getBarcodePrefillFromProduct(
  product: OpenFoodFactsProduct | null | undefined,
  barcode: string | null,
): BarcodePrefill {
  const optionsResult = getBarcodePrefillOptions(product, barcode);
  const fallbackPrefill = buildPrefillFromServingInfo(
    product,
    barcode,
    {
      source: 'fallback',
      servingSize: 100,
      unit: 'g',
      otherUnit: null,
    },
    getServingInfoFromProduct(product),
  );

  const selectedDefaultOption =
    optionsResult.options.find((option) => option.id === optionsResult.defaultOptionId) ??
    optionsResult.options[0] ??
    null;

  const result = selectedDefaultOption?.prefill ?? fallbackPrefill;

  return result;
}
