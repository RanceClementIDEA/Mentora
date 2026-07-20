import { describe, expect, it } from "vitest";
import {
  echeancesContrat,
  finPeriodeProbatoire,
  JOURS_PERIODE_PROBATOIRE,
  messageEcheanceContrat,
  rappelsContrat,
} from "@/lib/contrat";

describe("finPeriodeProbatoire", () => {
  it("ajoute 45 jours à la date de début", () => {
    expect(JOURS_PERIODE_PROBATOIRE).toBe(45);
    expect(finPeriodeProbatoire("2026-09-01")).toBe("2026-10-16");
  });
  it("franchit correctement les mois", () => {
    expect(finPeriodeProbatoire("2026-01-20")).toBe("2026-03-06");
  });
});

describe("echeancesContrat", () => {
  it("calcule période probatoire et fin de contrat avec jours restants", () => {
    const e = echeancesContrat(
      { debutIso: "2026-09-01", finIso: "2027-08-31" },
      "2026-10-10",
    );
    const prob = e.find((x) => x.type === "PERIODE_PROBATOIRE")!;
    const fin = e.find((x) => x.type === "FIN_CONTRAT")!;
    expect(prob.dateIso).toBe("2026-10-16");
    expect(prob.joursRestants).toBe(6);
    expect(fin.dateIso).toBe("2027-08-31");
    expect(fin.joursRestants).toBeGreaterThan(300);
  });
  it("n'inclut que ce qui est renseigné", () => {
    expect(echeancesContrat({ debutIso: null, finIso: null }, "2026-10-10")).toEqual(
      [],
    );
    expect(
      echeancesContrat({ finIso: "2027-08-31" }, "2026-10-10").map((x) => x.type),
    ).toEqual(["FIN_CONTRAT"]);
  });
});

describe("rappelsContrat", () => {
  it("alerte quand la fin de période probatoire entre dans la fenêtre (7 j)", () => {
    // fin probatoire = 2026-10-16 ; today = 2026-10-10 → 6 j restants ≤ 7
    const msgs = rappelsContrat(
      { nom: "Léa Moreau", debutIso: "2026-09-01" },
      "2026-10-10",
    );
    expect(msgs).toContain("Fin de période probatoire pour Léa Moreau le 2026-10-16.");
  });

  it("n'alerte pas hors de la fenêtre", () => {
    // 15 j restants > 7
    expect(
      rappelsContrat({ nom: "Léa", debutIso: "2026-09-01" }, "2026-10-01"),
    ).toEqual([]);
  });

  it("n'alerte pas pour une échéance déjà passée", () => {
    // fin probatoire passée
    expect(
      rappelsContrat({ nom: "Léa", debutIso: "2026-09-01" }, "2026-11-01"),
    ).toEqual([]);
  });

  it("alerte pour la fin de contrat dans la fenêtre de 30 j", () => {
    const msgs = rappelsContrat(
      { nom: "Noah Petit", finIso: "2027-08-31" },
      "2027-08-10",
    );
    expect(msgs).toContain("Fin de contrat pour Noah Petit le 2027-08-31.");
  });

  it("produit des messages stables (clé de déduplication)", () => {
    const a = rappelsContrat({ nom: "X", debutIso: "2026-09-01" }, "2026-10-10");
    const b = rappelsContrat({ nom: "X", debutIso: "2026-09-01" }, "2026-10-11");
    // même échéance → même message, indépendant du jour d'exécution
    expect(a[0]).toBe(b[0]);
  });
});

describe("messageEcheanceContrat", () => {
  it("distingue les deux types", () => {
    expect(messageEcheanceContrat("PERIODE_PROBATOIRE", "A", "2026-10-16")).toContain(
      "période probatoire",
    );
    expect(messageEcheanceContrat("FIN_CONTRAT", "A", "2027-08-31")).toContain(
      "Fin de contrat",
    );
  });
});
