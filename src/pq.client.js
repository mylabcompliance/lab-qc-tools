// CLIA personnel qualification screener (42 CFR 493 Subpart M, as amended 88 FR 90039, Dec. 28, 2023;
// effective Dec. 28, 2024). Screening aid only: it does not replace reading the regulation.
(function () {
  const $ = (id) => document.getElementById(id);
  const ED = (k) => !!document.querySelector(`input[name=ed][value="${k}"]:checked`);
  const n = (id) => parseFloat($(id).value) || 0;
  const yes = (id) => $(id).checked;
  const any = (...ks) => ks.some(ED);
  const ECFR = "https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-493/subpart-M/section-493.";

  // Each pathway: cite, label, need: [[label, met]]
  function paths(role) {
    const MD = ED("md"), DPM = ED("dpm"), abp = yes("abp"), hhs = yes("hhs"), ce = yes("ce20");
    const nw = n("y_nw"), supnw = n("y_supnw"), hi = n("y_hi"), dirhi = n("y_dirhi");
    const phdLab = ED("phd_lab"), phdOther = ED("phd_other"), msLab = ED("ms_lab"), msEq = ED("ms_eq"), bsLab = ED("bs_lab"), bsEq = ED("bs_eq");
    const gf = yes("gf");
    const P = [];
    const add = (cite, label, need) => P.push({ cite, label, need });
    const G = (title) => add("(grandfather)", `Qualified and serving as ${title} in a CLIA-certified lab on Dec. 28, 2024, and continuously since`, [["Serving continuously since Dec. 28, 2024", gf]]);
    if (role === "dir_mod") {
      add("1405(b)(1)", "Pathologist", [["MD or DO licensed in the state", MD], ["Board certified in AP and/or CP (ABP or AOBP)", abp]]);
      add("1405(b)(2)", "Physician or podiatrist with lab experience", [["MD, DO or DPM licensed in the state", MD || DPM], ["1+ year directing or supervising nonwaived testing", supnw >= 1], ["20 CE hours covering director responsibilities", ce]]);
      add("1405(b)(3)", "Doctoral degree", [["Doctorate in a lab science, or other doctorate with 16 doctoral semester hours or a lab-related thesis", phdLab || phdOther], ["Certified by an HHS-approved board", hhs], ["1+ year directing or supervising nonwaived testing", supnw >= 1], ["20 CE hours covering director responsibilities", ce]]);
      add("1405(b)(4)", "Master's degree", [["Master's in a lab science, or bachelor's equivalency plus 16 graduate semester hours", msLab || msEq], ["1+ year lab training/experience in nonwaived testing", nw >= 1], ["1+ year supervisory experience in nonwaived testing", supnw >= 1], ["20 CE hours covering director responsibilities", ce]]);
      add("1405(b)(5)", "Bachelor's degree", [["Bachelor's in a lab science, or 120 semester hours meeting the 48-hour science rule", bsLab || bsEq], ["2+ years lab training/experience in nonwaived testing", nw >= 2], ["2+ years supervisory experience in nonwaived testing", supnw >= 2], ["20 CE hours covering director responsibilities", ce]]);
      G("a moderate complexity lab director"); P[P.length - 1].cite = "1405(b)(6)";
    }
    if (role === "dir_high") {
      add("1443(b)(1)", "Pathologist", [["MD or DO licensed in the state", MD], ["Board certified in AP and/or CP (ABP or AOBP)", abp]]);
      add("1443(b)(2)", "Physician or podiatrist with high complexity experience", [["MD, DO or DPM licensed in the state", MD || DPM], ["2+ years directing or supervising high complexity testing", dirhi >= 2], ["20 CE hours covering director responsibilities", ce]]);
      add("1443(b)(3)", "Doctoral degree", [["Doctorate in a lab science, or other doctorate with 16 doctoral semester hours or a lab-related thesis", phdLab || phdOther], ["Certified by an HHS-approved board", hhs], ["2+ years lab training/experience", Math.max(nw, hi) >= 2], ["2+ years directing or supervising high complexity testing", dirhi >= 2], ["20 CE hours covering director responsibilities", ce]]);
      G("a high complexity lab director"); P[P.length - 1].cite = "1443(b)(4)";
    }
    if (role === "tc") {
      add("1411(b)(1)", "Pathologist", [["MD or DO licensed in the state", MD], ["Board certified in AP and/or CP (ABP or AOBP)", abp]]);
      add("1411(b)(2)", "Physician or podiatrist", [["MD, DO or DPM licensed in the state", MD || DPM], ["1+ year training/experience in nonwaived testing in the specialty", nw >= 1]]);
      add("1411(b)(3)", "Doctoral or master's degree", [["Doctorate or master's in a lab science, or the doctoral/master's equivalency", phdLab || msLab || phdOther || msEq], ["1+ year training/experience in nonwaived testing in the specialty", nw >= 1]]);
      add("1411(b)(4)", "Bachelor's degree", [["Bachelor's in a lab science, or 120 semester hours meeting the 48-hour science rule", bsLab || bsEq], ["2+ years training/experience in nonwaived testing in the specialty", nw >= 2]]);
      add("1411(b)(5)", "Associate degree", [["Associate in MLT, MLS or CLS", ED("as_mlt")], ["4+ years training/experience in nonwaived testing in the specialty", nw >= 4]]);
      G("a technical consultant"); P[P.length - 1].cite = "1411(b)(7)";
    }
    if (role === "gs") {
      add("1461(c)(1)", "Physician or bachelor's or higher", [["MD, DO or DPM licensed in the state, or doctorate/master's/bachelor's in a lab science", MD || DPM || phdLab || msLab || bsLab], ["1+ year training/experience in high complexity testing", hi >= 1]]);
      add("1461(c)(2)", "Associate degree or equivalent", [["Qualifies as high complexity testing personnel under 1489(b)(3) (associate in lab science/MLT, or the 60-hour equivalency with training)", any("as_mlt", "as_sci", "eq60")], ["2+ years training/experience in high complexity testing", hi >= 2]]);
      add("1461(b)/(c)(3)", "Qualifies as high complexity director (or technical supervisor)", [["Meets a §493.1443 high complexity director pathway (b)(1) to (b)(3)", paths("dir_high").some((p) => p.cite !== "1443(b)(4)" && p.need.every((x) => x[1]))]]);
      G("a general supervisor"); P[P.length - 1].cite = "1461(c)(4)";
    }
    if (role === "tp_mod") {
      add("1423(b)(1)", "Physician", [["MD or DO licensed in the state", MD]]);
      add("1423(b)(2)/(3)", "Bachelor's or higher", [["Doctorate, master's or bachelor's in a lab science or nursing, or a degree equivalency", phdLab || msLab || bsLab || ED("bs_rn") || phdOther || msEq || bsEq]]);
      add("1423(b)(4)", "Associate degree", [["Associate in a lab science, MLT or nursing", any("as_mlt", "as_sci", "as_rn")]]);
      add("1423(b)(5)", "Military", [["High school plus a 50-week military lab course and the Medical Laboratory Specialist specialty", ED("mil")]]);
      add("1423(b)(6)", "High school with documented training", [["High school diploma or equivalent", ED("hs") || any("as_mlt", "as_sci", "as_rn", "eq60", "mil")], ["Documented training covering every element in 1423(b)(6)(ii) before testing patients", yes("trained")]]);
      G("moderate complexity testing personnel"); P[P.length - 1].cite = "1423(b)(8)";
    }
    if (role === "tp_high") {
      add("1489(b)(1)", "Physician or podiatrist", [["MD, DO or DPM licensed in the state", MD || DPM]]);
      add("1489(b)(2)", "Bachelor's or higher", [["Doctorate, master's or bachelor's in a lab science", phdLab || msLab || bsLab]]);
      add("1489(b)(3)(i)", "Associate degree", [["Associate in a laboratory science or MLT", any("as_mlt", "as_sci")]]);
      add("1489(b)(3)(ii)", "60-hour equivalency", [["60 semester hours with the 24-hour science/MLT rule", ED("eq60")], ["ABHES/CAAHEP-accredited training program, or 3+ months documented training in each specialty", yes("trained")]]);
      add("1489(b)(4)", "Military", [["50-week military lab course and the Medical Laboratory Specialist specialty", ED("mil")]]);
      G("high complexity testing personnel"); P[P.length - 1].cite = "1489(b)(5)";
    }
    return P;
  }

  const SEC = { dir_mod: "1405", dir_high: "1443", tc: "1411", gs: "1461", tp_mod: "1423", tp_high: "1489" };
  function run() {
    const role = $("role").value, P = paths(role);
    const met = P.filter((p) => p.need.every((x) => x[1]));
    const st = window.SLC_STATE || {};
    let h = met.length
      ? `<div class="good"><strong>Likely qualifies</strong> under ${met.map((p) => `§493.${p.cite} (${p.label})`).join("; ")}.</div>`
      : `<div class="bad"><strong>No pathway fully met</strong> with the answers given. The closest pathways and what is missing are below.</div>`;
    const ranked = P.map((p) => ({ ...p, miss: p.need.filter((x) => !x[1]).length })).sort((a, b) => a.miss - b.miss);
    h += ranked.map((p) => `<div class="path"><strong>§493.${p.cite}: ${p.label}</strong> ${p.miss ? `<span class="tag no">${p.miss} missing</span>` : `<span class="tag ok">met</span>`}<ul>${p.need.map(([l, ok]) => `<li class="${ok ? "ok" : "no"}">${ok ? "&#10003;" : "&#10007;"} ${l}</li>`).join("")}</ul></div>`).join("");
    if (role === "tp_high" && any("as_rn", "bs_rn") && !met.length) h += `<p class="note">A nursing degree qualifies for <em>moderate</em> complexity testing (§493.1423) but is not listed for <em>high</em> complexity testing (§493.1489).</p>`;
    if (st.personnel_license === "yes" || st.personnel_license === "directors") h += `<p class="note"><strong>${st.state}:</strong> ${st.personnel_summary || "This state licenses laboratory personnel."} CLIA also requires any state license that applies.</p>`;
    h += `<p class="fine">Screening aid, not a determination. Surveyors review transcripts, diplomas, board certificates and documented experience. Read <a href="${ECFR}${SEC[role]}" target="_blank" rel="noopener">42 CFR 493.${SEC[role]}</a>.</p>`;
    $("out").innerHTML = h;
    try { gtag && gtag("event", "tool_run", { tool: "personnel_" + role }); } catch (_) {}
  }
  $("go").onclick = run;
  $("role").onchange = () => { $("out").innerHTML = ""; };
})();
