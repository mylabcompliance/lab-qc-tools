// Westgard QC rules + Levey-Jennings chart. No dependencies.
(function () {
  const $ = (id) => document.getElementById(id);
  const nums = (s) => String(s || "").split(/[\s,;]+/).map(Number).filter((x) => isFinite(x) && String(x) !== "");
  const f = (x, d = 2) => (isFinite(x) ? Number(x).toFixed(d) : "-");

  function stats(a) {
    const n = a.length; if (!n) return { n: 0 };
    const m = a.reduce((s, x) => s + x, 0) / n;
    const sd = n > 1 ? Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (n - 1)) : NaN;
    return { n, mean: m, sd, cv: (sd / m) * 100 };
  }

  // Returns [{i, rule, level:"reject"|"warning"}] for one series of z-scores.
  function rulesFor(z) {
    const out = [];
    z.forEach((v, i) => {
      if (Math.abs(v) > 3) out.push({ i, rule: "1-3s", level: "reject" });
      else if (Math.abs(v) > 2) out.push({ i, rule: "1-2s", level: "warning" });
      if (i >= 1 && ((z[i] > 2 && z[i - 1] > 2) || (z[i] < -2 && z[i - 1] < -2))) out.push({ i, rule: "2-2s", level: "reject" });
      if (i >= 3) { const w = z.slice(i - 3, i + 1); if (w.every((x) => x > 1) || w.every((x) => x < -1)) out.push({ i, rule: "4-1s", level: "reject" }); }
      if (i >= 9) { const w = z.slice(i - 9, i + 1); if (w.every((x) => x > 0) || w.every((x) => x < 0)) out.push({ i, rule: "10x", level: "reject" }); }
    });
    return out;
  }

  // Across two levels in the same run: 2-2s and R-4s across levels.
  function acrossLevels(z1, z2) {
    const out = [], n = Math.min(z1.length, z2.length);
    for (let i = 0; i < n; i++) {
      if ((z1[i] > 2 && z2[i] > 2) || (z1[i] < -2 && z2[i] < -2)) out.push({ i, rule: "2-2s (across levels)", level: "reject" });
      if ((z1[i] > 2 && z2[i] < -2) || (z1[i] < -2 && z2[i] > 2)) out.push({ i, rule: "R-4s (across levels)", level: "reject" });
    }
    return out;
  }

  function chart(series) {
    const W = 760, H = 300, pl = 44, pr = 12, pt = 12, pb = 28;
    const n = Math.max(...series.map((s) => s.z.length), 1);
    const x = (i) => pl + (n === 1 ? (W - pl - pr) / 2 : (i * (W - pl - pr)) / (n - 1));
    const y = (z) => pt + ((4 - Math.max(-4, Math.min(4, z))) * (H - pt - pb)) / 8;
    let g = "";
    [[3, "#c62828"], [2, "#ef6c00"], [1, "#9e9e9e"], [0, "#1f2937"], [-1, "#9e9e9e"], [-2, "#ef6c00"], [-3, "#c62828"]].forEach(([z, c]) => {
      g += `<line x1="${pl}" x2="${W - pr}" y1="${y(z)}" y2="${y(z)}" stroke="${c}" stroke-width="${z === 0 ? 1.5 : 1}" ${z && Math.abs(z) < 3 ? 'stroke-dasharray="4 4"' : ""}/>`;
      g += `<text x="${pl - 6}" y="${y(z) + 4}" text-anchor="end" font-size="11" fill="#5b6472">${z === 0 ? "mean" : (z > 0 ? "+" : "") + z + "SD"}</text>`;
    });
    const colors = ["#0f2a44", "#2e7d32"];
    series.forEach((s, k) => {
      const pts = s.z.map((v, i) => `${x(i)},${y(v)}`).join(" ");
      g += `<polyline points="${pts}" fill="none" stroke="${colors[k]}" stroke-width="1.5"/>`;
      s.z.forEach((v, i) => {
        const bad = s.flags.some((r) => r.i === i && r.level === "reject"), warn = s.flags.some((r) => r.i === i);
        g += `<circle cx="${x(i)}" cy="${y(v)}" r="${bad ? 5 : 3.5}" fill="${bad ? "#c62828" : warn ? "#ef6c00" : colors[k]}"><title>${s.name} run ${i + 1}: ${f(s.vals[i])} (z ${f(v)})</title></circle>`;
      });
    });
    for (let i = 0; i < n; i += Math.max(1, Math.ceil(n / 15))) g += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#5b6472">${i + 1}</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Levey-Jennings chart" style="width:100%;height:auto;background:#fff">${g}</svg>`;
  }

  function run() {
    const levels = [1, 2].map((k) => ({ name: $("name" + k).value || "Level " + k, vals: nums($("vals" + k).value), mean: parseFloat($("mean" + k).value), sd: parseFloat($("sd" + k).value) }))
      .filter((l) => l.vals.length);
    const out = $("out");
    if (!levels.length) { out.innerHTML = "<p>Enter at least one level of QC results.</p>"; return; }
    for (const l of levels) {
      if (!(l.sd > 0) || !isFinite(l.mean)) { const s = stats(l.vals); if (!isFinite(l.mean)) l.mean = s.mean; if (!(l.sd > 0)) l.sd = s.sd; l.estimated = true; }
      l.z = l.vals.map((v) => (v - l.mean) / l.sd);
      l.flags = rulesFor(l.z);
    }
    const cross = levels.length === 2 ? acrossLevels(levels[0].z, levels[1].z) : [];
    let html = chart(levels);
    html += `<table class="t"><tr><th>Level</th><th>n</th><th>Target mean</th><th>Target SD</th><th>Observed mean</th><th>Observed SD</th><th>Observed CV%</th></tr>`;
    for (const l of levels) { const s = stats(l.vals); html += `<tr><td>${l.name}${l.estimated ? " *" : ""}</td><td>${s.n}</td><td>${f(l.mean)}</td><td>${f(l.sd, 3)}</td><td>${f(s.mean)}</td><td>${f(s.sd, 3)}</td><td>${f(s.cv)}</td></tr>`; }
    html += `</table>`;
    if (levels.some((l) => l.estimated)) html += `<p class="fine">* No target mean/SD entered, so they were estimated from the data itself. Use your established target values for real QC review.</p>`;
    const all = levels.flatMap((l) => l.flags.map((r) => ({ ...r, who: l.name, v: l.vals[r.i], z: l.z[r.i] }))).concat(cross.map((r) => ({ ...r, who: "Both levels" })));
    all.sort((a, b) => a.i - b.i);
    const rej = all.filter((r) => r.level === "reject");
    html += rej.length
      ? `<div class="bad"><strong>${rej.length} rejection rule violation${rej.length > 1 ? "s" : ""}.</strong> Hold patient results for affected runs, investigate, correct and document before reporting.</div>`
      : `<div class="good"><strong>No rejection rules violated.</strong>${all.length ? " 1-2s warnings below: inspect the other rules before accepting the run." : ""}</div>`;
    if (all.length) html += `<table class="t"><tr><th>Run</th><th>Level</th><th>Rule</th><th>Value</th><th>z</th><th>Action</th></tr>` +
      all.map((r) => `<tr><td>${r.i + 1}</td><td>${r.who}</td><td>${r.rule}</td><td>${r.v == null ? "-" : f(r.v)}</td><td>${r.z == null ? "-" : f(r.z)}</td><td>${r.level === "reject" ? "Reject run" : "Warning"}</td></tr>`).join("") + `</table>`;
    out.innerHTML = html;
    try { gtag && gtag("event", "tool_run", { tool: "westgard" }); } catch (_) {}
  }
  $("go").onclick = run;
  $("demo").onclick = () => {
    $("name1").value = "Glucose L1"; $("mean1").value = "100"; $("sd1").value = "2.5";
    $("vals1").value = "101 99.5 98 102 100.4 103 97.8 100 105.2 105.5 101 99 108.1 100 98.6";
    $("name2").value = "Glucose L2"; $("mean2").value = "300"; $("sd2").value = "6";
    $("vals2").value = "302 296 299 305 301 298 297 303 311 313 300 298 302 299 301";
    run();
  };
})();
