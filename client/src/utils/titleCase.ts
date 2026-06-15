// src/utils/titleCase.ts

export function toTitleCase(str: string): string {
  if (!str) return "";
  
  const abbreviations = ["AI", "ML", "IOT", "VLSI", "DEVOPS", "CSE", "ECE", "EEE", "IT", "AR/VR"];
  
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => {
      // Keep brackets intact but check word content
      const cleaned = word.replace(/[()]/g, "").toUpperCase();
      if (abbreviations.includes(cleaned)) {
        // preserve parentheses if they exist around the abbreviation
        return word.toUpperCase();
      }
      
      // Keep minor words lowercase unless they are at the start
      const minorWords = ["and", "or", "but", "in", "on", "for", "with", "of", "to", "by", "a", "an", "the"];
      if (minorWords.includes(word.toLowerCase()) && word !== str.split(" ")[0]) {
        return word.toLowerCase();
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
