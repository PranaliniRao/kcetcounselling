// src/utils/shortlistService.ts

export interface ShortlistItem {
  collegeCode: string;
  collegeName: string;
  branch: string;
  category: string;
  round: string;
  cutoff: string;
  status: string;
  shortlistType: "Dream" | "Target" | "Safe";
}

const SHORTLIST_KEY = "kcet_shortlist";

export const shortlistService = {
  get: (): ShortlistItem[] => {
    try {
      const data = localStorage.getItem(SHORTLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error("Failed to parse shortlist data:", err);
      return [];
    }
  },

  save: (item: Omit<ShortlistItem, "shortlistType">, type: "Dream" | "Target" | "Safe") => {
    const list = shortlistService.get();
    
    // Check if duplicate exists (same college, branch, category, and round)
    const index = list.findIndex(
      (i) =>
        i.collegeCode === item.collegeCode &&
        i.branch === item.branch &&
        i.category === item.category &&
        i.round === item.round
    );

    if (index !== -1) {
      // If it exists, update the type
      list[index].shortlistType = type;
    } else {
      // Add new item
      list.push({ ...item, shortlistType: type });
    }
    
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(list));
    // Dispatch storage event so other components (like Navbar) update their count immediately
    window.dispatchEvent(new Event("storage"));
  },

  remove: (collegeCode: string, branch: string, category: string, round: string) => {
    let list = shortlistService.get();
    list = list.filter(
      (i) =>
        !(
          i.collegeCode === collegeCode &&
          i.branch === branch &&
          i.category === category &&
          i.round === round
        )
    );
    
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("storage"));
  },

  getType: (collegeCode: string, branch: string, category: string, round: string): "Dream" | "Target" | "Safe" | null => {
    const list = shortlistService.get();
    const item = list.find(
      (i) =>
        i.collegeCode === collegeCode &&
        i.branch === branch &&
        i.category === category &&
        i.round === round
    );
    return item ? item.shortlistType : null;
  }
};
