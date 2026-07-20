import { describe, expect, it } from "vitest";
import {
  debutPeriodeBilan,
  libelleFrequence,
  libellePeriode,
  libelleSemaine,
  lundiDeLaSemaine,
  normFrequence,
} from "@/lib/semaine";

describe("lundiDeLaSemaine", () => {
  it("renvoie le lundi de la semaine (UTC)", () => {
    // 2026-07-16 est un jeudi → lundi = 2026-07-13.
    expect(lundiDeLaSemaine(new Date("2026-07-16T09:30:00Z")).toISOString()).toBe(
      "2026-07-13T00:00:00.000Z",
    );
  });
  it("un lundi renvoie lui-même à minuit", () => {
    expect(lundiDeLaSemaine(new Date("2026-07-13T23:59:00Z")).toISOString()).toBe(
      "2026-07-13T00:00:00.000Z",
    );
  });
  it("un dimanche renvoie le lundi précédent", () => {
    // 2026-07-19 est un dimanche → lundi = 2026-07-13.
    expect(lundiDeLaSemaine(new Date("2026-07-19T12:00:00Z")).toISOString()).toBe(
      "2026-07-13T00:00:00.000Z",
    );
  });
});

describe("libelleSemaine", () => {
  it("formate le lundi", () => {
    expect(libelleSemaine(new Date("2026-07-13T00:00:00Z"))).toBe(
      "semaine du 13/07/2026",
    );
  });
});

describe("normFrequence", () => {
  it("borne les valeurs inconnues à HEBDO", () => {
    expect(normFrequence(null)).toBe("HEBDO");
    expect(normFrequence("n'importe quoi")).toBe("HEBDO");
    expect(normFrequence("BIMENSUEL")).toBe("BIMENSUEL");
    expect(normFrequence("MENSUEL")).toBe("MENSUEL");
  });
});

describe("debutPeriodeBilan", () => {
  const jeudi = new Date("2026-07-16T09:30:00Z"); // semaine du lundi 13/07

  it("HEBDO → lundi de la semaine", () => {
    expect(debutPeriodeBilan(jeudi, "HEBDO").toISOString()).toBe(
      "2026-07-13T00:00:00.000Z",
    );
  });

  it("MENSUEL → 1er du mois", () => {
    expect(debutPeriodeBilan(jeudi, "MENSUEL").toISOString()).toBe(
      "2026-07-01T00:00:00.000Z",
    );
  });

  it("BIMENSUEL → les deux semaines d'une même quinzaine partagent le début", () => {
    // La quinzaine regroupe {06/07, 13/07} (parité de semaine stable).
    const a = debutPeriodeBilan(new Date("2026-07-06T00:00:00Z"), "BIMENSUEL");
    const b = debutPeriodeBilan(new Date("2026-07-13T00:00:00Z"), "BIMENSUEL");
    expect(a.toISOString()).toBe(b.toISOString());
    expect(a.toISOString()).toBe("2026-07-06T00:00:00.000Z");
  });

  it("BIMENSUEL → deux quinzaines distinctes ont des débuts différents", () => {
    const q1 = debutPeriodeBilan(new Date("2026-07-13T00:00:00Z"), "BIMENSUEL");
    const q2 = debutPeriodeBilan(new Date("2026-07-20T00:00:00Z"), "BIMENSUEL");
    expect(q1.toISOString()).not.toBe(q2.toISOString());
  });
});

describe("libellePeriode / libelleFrequence", () => {
  it("adapte le libellé à la cadence", () => {
    const lundi = new Date("2026-07-13T00:00:00Z");
    expect(libellePeriode(lundi, "HEBDO")).toBe("semaine du 13/07/2026");
    expect(libellePeriode(lundi, "BIMENSUEL")).toBe("quinzaine du 13/07/2026");
    expect(libellePeriode(new Date("2026-07-01T00:00:00Z"), "MENSUEL")).toBe(
      "mois de juillet 2026",
    );
  });
  it("nomme chaque cadence", () => {
    expect(libelleFrequence("HEBDO")).toBe("Hebdomadaire");
    expect(libelleFrequence("BIMENSUEL")).toBe("Toutes les deux semaines");
    expect(libelleFrequence("MENSUEL")).toBe("Mensuel");
  });
});
