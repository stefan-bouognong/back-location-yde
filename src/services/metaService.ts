const DEFAULT_NEIGHBORHOODS = [
  "Bastos",
  "Mvan",
  "Nsimeyong",
  "Biyem-Assi",
  "Mendong",
  "Essos",
  "Mvog-Mbi",
  "Nkolbisson",
  "Mimboman",
  "Omnisport",
  "Santa Barbara",
  "Emana",
  "Odza",
  "Ngousso",
  "Messa",
];

export function metaService(distinctFromDb: () => Promise<string[]>) {
  return {
    async neighborhoods(): Promise<string[]> {
      const fromDb = await distinctFromDb();
      const set = new Set([...DEFAULT_NEIGHBORHOODS, ...fromDb]);
      return [...set].sort((a, b) => a.localeCompare(b, "fr"));
    },
  };
}
