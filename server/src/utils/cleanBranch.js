function cleanBranch(branch) {

  const keywords = [
    "ARTIFICIAL",
    "COMPUTER",
    "INFORMATION",
    "ELECTRONICS",
    "ELECTRICAL",
    "MECHANICAL",
    "CIVIL",
    "CHEMICAL",
    "AERONAUTICAL",
    "AEROSPACE",
    "AGRICULTURE",
    "AUTOMOBILE",
    "ROBOTICS",
    "BIO",
    "INDUSTRIAL",
    "TEXTILE",
    "DESIGN",
    "CYBER",
    "DATA",
    "COMMUNICATION"
  ];

  for (const keyword of keywords) {

    const index = branch.indexOf(keyword);

    if (index !== -1) {
      branch = branch.substring(index);
      break;
    }
  }

  return branch
    .replace(/\s+/g, " ")
    .replace(/COMMUNICATIO N/g, "COMMUNICATION")
    .replace(/DAT A/g, "DATA")
    .replace(/ARTIFICIA L/g, "ARTIFICIAL")
    .replace(/INTERNE T/g, "INTERNET")
    .trim();
}

module.exports = cleanBranch;