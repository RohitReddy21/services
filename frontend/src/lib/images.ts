/**
 * Curated Unsplash photo IDs (verified to resolve on images.unsplash.com).
 * Reuse these across service pages instead of guessing new IDs.
 */
export const stockImages = {
  heroEngineer: "1621905251189-08b45d6a269e",
  wallMountedAC: "1544603396-e4a163c7c658",
  cassetteAC: "1647936900381-d5df29d055a5",
  outdoorCondenserUnits: "1667983453881-4992fe86ab1b",
  acInstallation: "1642749776312-aa42ce20c9f5",
  hvacRepairTechnician: "1561400555-786780284b67",
  coldStorage: "1610945475106-eff153bd5b31",
  commercialRefrigeration: "1784039534969-26e424548f3e",
  commercialFridge: "1782750161991-23529c9462bb",
  commercialFreezer: "1741739813128-cb658a9a0f9a",
  iceMachine: "1727947417960-cb361b15dc71",
  industrialRefrigeration: "1620203853151-496c7228306c",
  displayFridge: "1777372341797-50582873038a",
  reviewerAvatarFemale: "1544005313-94ddf0286df2",
} as const;

export function unsplash(id: string, width = 1200) {
  return `https://images.unsplash.com/photo-${id}?q=80&w=${width}&auto=format&fit=crop`;
}
