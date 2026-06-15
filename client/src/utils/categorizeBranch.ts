import { BRANCH_CATEGORIES } from "../constants/branchCategories";

export function categorizeBranch(branch: string) {

  for (const [category, keywords] of Object.entries(BRANCH_CATEGORIES)) {

    const match = keywords.some(keyword =>
      branch.toUpperCase().includes(keyword)
    );

    if (match) {
      return category;
    }
  }

  return "Design & Others";
}