// Tour du Mont Blanc 2026 - live trek log data.
// Append/edit day entries here; tmb-2026-log.html renders them.
// stats.source: "planned" (from the plan) or "garmin" (recorded track).
// When Garmin syncs, set source:"garmin" and fill moving/elapsed.
const LOG = {
  updated: "2026-07-30",
  days: [
    {
      n: 1, date: "2026-07-30", label: "Thu 30 July",
      stage: "Les Houches to Les Contamines", col: "#ff0000",
      status: "done",
      route: "Standard TMB up to the Col de Voza, then the <strong>Col de Tricot high variant (2,120 m)</strong> - across the Bionnassay suspension bridge, down to the Chalets de Miage and over Le Truc into Les Contamines.",
      stats: { km: 21.1, up: 1350, down: 1190, moving: "", elapsed: "", source: "planned" },
      notes: "Warm-up day, done the hard way. A steady pull out of Les Houches to the Col de Voza to find a rhythm, then instead of the easy drop we took the <strong>Col de Tricot (2,120 m)</strong>: over the suspension bridge under the Bionnassay glacier snout, up to the col, then a steep zigzag down to the Chalets de Miage and one more climb over Le Truc before Les Contamines and the pitch at Le Pontet. Half as much climbing again as the standard line, and the finest Day 1 there is. Calmer up high than forecast - none of the big gusts the app threatened. Garmin ran the whole way, breaks included, so moving time is the one to watch.",
      highlights: [
        "Col de Tricot (2,120 m) - the hard variant, not the easy line",
        "Suspension bridge under the Bionnassay glacier",
        "Chalets de Miage buvette and the pull over Le Truc"
      ],
      fixnote: "Two things for the route data: (1) the KMZ line is a little off the walked track between Les Aillouds and the Col de Voza; (2) the day followed the Col de Tricot variant after Voza, so Day 1 in the KMZ/GPX should be the Tricot line, not the standard descent. Flagged for a fix."
    },
    { n: 2, date: "2026-07-31", label: "Fri 31 July", stage: "Les Contamines to Les Chapieux (Col du Bonhomme)", col: "#ff8000", status: "coming" },
    { n: 3, date: "2026-08-01", label: "Sat 1 August", stage: "Les Chapieux to Val Veny (Col de la Seigne)", col: "#e6c200", status: "coming" },
    { n: 4, date: "2026-08-02", label: "Sun 2 August", stage: "Val Veny to Val Ferret (via Courmayeur)", col: "#00b300", status: "coming" },
    { n: 5, date: "2026-08-03", label: "Mon 3 August", stage: "Val Ferret to La Fouly (Grand Col Ferret, 2,537 m)", col: "#00b3b3", status: "coming" },
    { n: 6, date: "2026-08-04", label: "Tue 4 August", stage: "La Fouly to Champex-Lac", col: "#0000ff", status: "coming" },
    { n: 7, date: "2026-08-05", label: "Wed 5 August", stage: "Champex to Col de la Forclaz (Bovine)", col: "#8000ff", status: "coming" },
    { n: 8, date: "2026-08-06", label: "Thu 6 August", stage: "Col de la Forclaz to Argentiere (Col de Balme)", col: "#ff00ff", status: "coming" },
    { n: 9, date: "2026-08-07", label: "Fri 7 August", stage: "Argentiere to Les Houches (finish)", col: "#8b4513", status: "coming" }
  ]
};
