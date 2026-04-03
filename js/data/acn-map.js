/**
 * ACN Taxonomy Field Mapping
 * Maps form field names to their vector PREFIX:CODE notation.
 */
window.acnMap = {
  impact:               { prefix: 'BC', code: 'IM' },
  rootCause:            { prefix: 'BC', code: 'RO' },
  severity:             { prefix: 'BC', code: 'SE' },
  victimGeography:      { prefix: 'BC', code: 'VG' },
  activeScanning:       { prefix: 'TT', code: 'AS' },
  availability:         { prefix: 'TT', code: 'AV' },
  fraud:                { prefix: 'TT', code: 'FR' },
  brandAbuse:           { prefix: 'TT', code: 'BA' },
  dataExposure:         { prefix: 'TT', code: 'DE' },
  informationGathering: { prefix: 'TT', code: 'IG' },
  maliciousCode:        { prefix: 'TT', code: 'MA' },
  socialEngineering:    { prefix: 'TT', code: 'SO' },
  vulnerability:        { prefix: 'TT', code: 'VU' },
  adversaryMotivation:  { prefix: 'TA', code: 'AM' },
  adversaryType:        { prefix: 'TA', code: 'AD' },
  abusiveContent:       { prefix: 'AC', code: 'AB' },
  assetSourceGeography: { prefix: 'AC', code: 'AS' },
  involvedAsset:        { prefix: 'AC', code: 'IN' },
  outlook:              { prefix: 'AC', code: 'OU' },
  physicalSecurity:     { prefix: 'AC', code: 'PH' },
  vector:               { prefix: 'AC', code: 'VE' },
  operatingSystem:      { prefix: 'AC', code: 'OS' },
};

// Reverse map: { 'BC:IM': 'impact', ... }
window.acnReverseMap = {};
Object.entries(window.acnMap).forEach(([name, obj]) => {
  window.acnReverseMap[`${obj.prefix}:${obj.code}`] = name;
});
