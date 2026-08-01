// Tour du Mont Blanc 2026 - live trek log data.
// Append/edit day entries here; tmb-2026-log.html renders them.
// stats.source: "planned" (from the plan) or "garmin" (recorded track).
// When Garmin syncs, set source:"garmin" and fill moving/elapsed.
const LOG = {
  updated: "2026-08-01",
  days: [
    {
      n: 1, date: "2026-07-30", label: "Thu 30 July",
      stage: "Les Houches to Les Contamines", col: "#ff0000",
      status: "done",
      route: "Standard TMB up to the Col de Voza, then the <strong>Col de Tricot high variant (2,120 m)</strong> - across the Bionnassay suspension bridge, down to the Chalets de Miage and over Le Truc into Les Contamines.",
      stats: { km: 23.9, up: 1597, down: 1408, moving: "3h47m", elapsed: "9h10m", source: "garmin" },
      notes: "Warm-up day, done the hard way. A steady pull out of Les Houches to the Col de Voza to find a rhythm, then instead of the easy drop we took the <strong>Col de Tricot (2,120 m)</strong>: over the suspension bridge under the Bionnassay glacier snout, up to the col, then a steep zigzag down to the Chalets de Miage and one more climb over Le Truc before Les Contamines and the pitch at Le Pontet. Half as much climbing again as the standard line, and the finest Day 1 there is. Calmer up high than forecast - none of the big gusts the app threatened. Garmin ran the whole way, breaks included, so moving time is the one to watch.",
      highlights: [
        "Col de Tricot (2,120 m) - the hard variant, not the easy line",
        "Suspension bridge under the Bionnassay glacier",
        "Chalets de Miage buvette and the pull over Le Truc"
      ],
      fixnote: "Two things for the route data: (1) the KMZ line is a little off the walked track between Les Aillouds and the Col de Voza; (2) the day followed the Col de Tricot variant after Voza, so Day 1 in the KMZ/GPX should be the Tricot line, not the standard descent. Flagged for a fix."
    },
    {
      n: 2, date: "2026-07-31", label: "Fri 31 July",
      stage: "Les Contamines to Les Chapieux (Col du Bonhomme)", col: "#ff8000",
      status: "done",
      route: "Standard TMB: the Roman road past Notre Dame de la Gorge, up over the Col du Bonhomme (2,329 m) and the Croix du Bonhomme (topped out ~2,500 m), then the descent to Les Chapieux. The Col des Fours was dropped for the storm risk.",
      stats: { km: 18.0, up: 1336, down: 979, moving: "2h51m", elapsed: "7h15m", source: "garmin" },
      notes: "The switch day. With thunder forecast up high we took the standard line over the Bonhomme rather than the Col des Fours - and it was the right call, the tops were thundery. A long steady climb from Les Contamines to the Croix du Bonhomme, then down into Les Chapieux and a proper bed at Les Chambres du Soleil. Off a late 09:24 start we were in by about 16:40, well ahead of the 19:00 dinner - the first night of the trip under a roof rather than canvas.",
      highlights: [
        "Col du Bonhomme (2,329 m) and the Croix du Bonhomme",
        "Storm-safe call paid off - thundery on the tops",
        "First night in a real bed, half-board at Les Chambres du Soleil"
      ]
    },
    {
      n: 3, date: "2026-08-01", label: "Sat 1 August",
      stage: "Les Chapieux to Val Veny (Col de la Seigne)", col: "#e6c200",
      status: "done",
      route: "The longer Chapieux stage: up the Vallee des Glaciers past Ville des Glaciers and the Refuge des Mottets to the Col de la Seigne (2,516 m) and the Italian border, then down past Lac Combal to the Val Veny base.",
      stats: { km: 23.7, up: 1155, down: 1178, moving: "4h34m", elapsed: "7h11m", source: "garmin" },
      notes: "The trade-off for Friday's bed: the long way to the Col de la Seigne. Out of Chapieux at 08:14, up the valley past the Mottets to the col (2,516 m) and into Italy, with the whole Mont Blanc massif opening down Val Veny - then the long drop past Lac Combal to the campsite and Nicole. Nearly 24 km, done in about 7 hours, in by mid-afternoon.",
      highlights: [
        "Col de la Seigne (2,516 m) - the border into Italy",
        "The Mont Blanc massif laid out down Val Veny",
        "Back to the van and Nicole at the Val Veny base"
      ]
    },
    { n: 4, date: "2026-08-02", label: "Sun 2 August", stage: "Val Veny to Val Ferret (via Courmayeur)", col: "#00b300", status: "coming" },
    { n: 5, date: "2026-08-03", label: "Mon 3 August", stage: "Val Ferret to La Fouly (Grand Col Ferret, 2,537 m)", col: "#00b3b3", status: "coming" },
    { n: 6, date: "2026-08-04", label: "Tue 4 August", stage: "La Fouly to Champex-Lac", col: "#0000ff", status: "coming" },
    { n: 7, date: "2026-08-05", label: "Wed 5 August", stage: "Champex to Col de la Forclaz (Bovine)", col: "#8000ff", status: "coming" },
    { n: 8, date: "2026-08-06", label: "Thu 6 August", stage: "Col de la Forclaz to Argentiere (Col de Balme)", col: "#ff00ff", status: "coming" },
    { n: 9, date: "2026-08-07", label: "Fri 7 August", stage: "Argentiere to Les Houches (finish)", col: "#8b4513", status: "coming" }
  ]
};
