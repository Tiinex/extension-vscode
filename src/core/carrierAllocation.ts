export interface QualifiedCarrierAllocation {
  state: 'qualified';
  allocationMode: string;
  siblingIndex: number | null;
  childDimension: string;
  projectionDimension: string;
  reasonCode: string;
}

/**
 * Consume Core's exact carrier-allocation projection without re-deriving any
 * Pointer ordinal, Parent route, or lineage mechanics in the VS Code host.
 */
export function qualifiedCarrierAllocationFromManufactureReceipt(receipt: any): QualifiedCarrierAllocation {
  const raw = receipt?.carrierAllocation || receipt?.manufacturingEvidence?.carrierAllocation || null;
  const state = String(raw?.state || '').trim();
  const reasonCode = String(raw?.reasonCode || '').trim();
  if (state !== 'qualified') {
    throw new Error(`tiinex.package-builder.carrier-allocation-not-qualified:${reasonCode || state || 'unavailable'}`);
  }
  const childDimension = String(raw?.childDimension || '').trim();
  const projectionDimension = String(receipt?.carrierProjection?.lineage?.dimension || receipt?.carrierLineage?.dimension || '').trim();
  if (childDimension && projectionDimension && childDimension !== projectionDimension) {
    throw new Error(`tiinex.package-builder.carrier-allocation-projection-mismatch:allocation=${childDimension};projection=${projectionDimension}`);
  }
  return {
    state: 'qualified',
    allocationMode: String(raw?.allocationMode || '').trim(),
    siblingIndex: Number.isInteger(raw?.siblingIndex) ? Number(raw.siblingIndex) : null,
    childDimension,
    projectionDimension,
    reasonCode
  };
}

export function assertStableQualifiedCarrierAllocation(preview: any, built: any): void {
  const expected = qualifiedCarrierAllocationFromManufactureReceipt(preview);
  const actual = qualifiedCarrierAllocationFromManufactureReceipt(built);
  const fields: Array<keyof QualifiedCarrierAllocation> = ['allocationMode', 'siblingIndex', 'childDimension', 'projectionDimension'];
  for (const field of fields) {
    if (actual[field] !== expected[field]) {
      throw new Error(`tiinex.package-builder.carrier-allocation-preview-build-mismatch:${String(field)}:preview=${String(expected[field] ?? '')};built=${String(actual[field] ?? '')}`);
    }
  }
}
