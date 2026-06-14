function normalizeBranch(branch) {

  return branch

    // remove extra spaces
    .replace(/\s+/g, " ")

    // remove split words
    .replace(/COMMUNICATIO N/g, "COMMUNICATION")
    .replace(/INSTRUMENTATI ON/g, "INSTRUMENTATION")
    .replace(/TELECOMMUNIC ATION/g, "TELECOMMUNICATION")
    .replace(/ENVIRONMENTA L/g, "ENVIRONMENTAL")
    .replace(/DAT A/g, "DATA")
    .replace(/ARTIFICIA L/g, "ARTIFICIAL")

    // remove B TECH prefixes
    .replace(/^B TECH IN /, "")
    .replace(/^B\.TECH IN /, "")
    .replace(/^BTECH IN /, "")

    .trim();
}

module.exports = normalizeBranch;