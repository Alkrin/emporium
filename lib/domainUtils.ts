import { DomainClassification, DomainData } from "../serverAPI";

export function getMaxFrontierPopulationForDomain(domain: DomainData): number {
  switch (domain.classification) {
    case DomainClassification.Civilized:
      return domain.hex_ids.length * 780;
    case DomainClassification.Borderlands:
      return domain.hex_ids.length * 375;
    case DomainClassification.Outlands:
      return domain.hex_ids.length * 185;
  }
}

export function getRequiredFortificationValue(domain: DomainData): number {
  switch (domain.classification) {
    case DomainClassification.Civilized:
      return domain.hex_ids.length * 15000;
    case DomainClassification.Borderlands:
      return domain.hex_ids.length * 22500;
    case DomainClassification.Outlands:
      return domain.hex_ids.length * 30000;
  }
}
