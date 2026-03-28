const PLASTIC_LEVELS = [
  { digit: 1, code: "PET", name: "Polyethylene Terephthalate", recyclable: true, color: "#D5E7FF" },
  { digit: 2, code: "HDPE", name: "High-Density Polyethylene", recyclable: true, color: "#D7F6E5" },
  { digit: 3, code: "PVC", name: "Polyvinyl Chloride", recyclable: false, color: "#FFE4AF" },
  { digit: 4, code: "LDPE", name: "Low-Density Polyethylene", recyclable: true, color: "#E7D8FF" },
  { digit: 5, code: "PP", name: "Polypropylene", recyclable: true, color: "#F3D6E6" },
  { digit: 6, code: "PS", name: "Polystyrene", recyclable: false, color: "#FFD0CB" },
  { digit: 7, code: "OTHER", name: "Other Plastics", recyclable: false, color: "#D7D9DE" },
];

function getPlasticByDigit(digit) {
  return PLASTIC_LEVELS.find((plastic) => plastic.digit === Number(digit));
}

module.exports = {
  PLASTIC_LEVELS,
  getPlasticByDigit,
};
