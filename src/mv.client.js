// Method verification: precision, accuracy (method comparison), reportable range. No dependencies.
(function () {
  const $ = (id) => document.getElementById(id);
  const f = (x, d = 2) => (isFinite(x) ? Number(x).toFixed(d) : "-");
  const nums = (s) => String(s || "").split(/[\s,;]+/).filter(Boolean).map(Number).filter(isFinite);
  const pairs = (s) => String(s || "").split(/\n+/).map((l) => l.trim().split(/[\s,;\t]+/).map(Number)).filter((p) => p.length >= 2 && isFinite(p[0]) && isFinite(p[1]));
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
  const verdict = (ok, msg) => `<div class="${ok ? "good" : "bad"}"><strong>${ok ? "Meets" : "Does not meet"} your criterion.</strong> ${msg}</div>`;
  const track = (t) => { try { gtag && gtag("event", "tool_run", { tool: t }); } catch (_) {} };

  document.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => {
    document.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("on", x === b));
    document.querySelectorAll(".pane").forEach((p) => (p.hidden = p.id !== b.dataset.tab));
  }));

  $("p-go").onclick = () => {
    const a = nums($("p-vals").value), lim = parseFloat($("p-lim").value);
    if (a.length < 2) return ($("p-out").innerHTML = "<p>Enter at least 2 replicate results (20 is typical).</p>");
    const m = mean(a), s = sd(a), cv = (s / m) * 100;
    let h = `<table class="t"><tr><th>n</th><th>Mean</th><th>SD</th><th>CV%</th><th>Min</th><th>Max</th></tr><tr><td>${a.length}</td><td>${f(m, 3)}</td><td>${f(s, 3)}</td><td>${f(cv)}</td><td>${f(Math.min(...a), 3)}</td><td>${f(Math.max(...a), 3)}</td></tr></table>`;
    if (isFinite(lim)) h += verdict(cv <= lim, `Observed CV ${f(cv)}% vs. allowable ${f(lim)}%.`);
    if (a.length < 20) h += `<p class="fine">Fewer than 20 replicates: many labs use 20 (for example, 2 levels over 10 to 20 days) for a defensible precision estimate. Follow your lab's verification plan.</p>`;
    $("p-out").innerHTML = h; track("precision");
  };

  $("a-go").onclick = () => {
    const p = pairs($("a-vals").value), tea = parseFloat($("a-tea").value), need = parseFloat($("a-need").value) || 90;
    if (p.length < 3) return ($("a-out").innerHTML = "<p>Enter at least 3 pairs, one per line: comparison result, new method result (20 or more is typical).</p>");
    const x = p.map((q) => q[0]), y = p.map((q) => q[1]), mx = mean(x), my = mean(y);
    const sxx = x.reduce((s, v) => s + (v - mx) ** 2, 0), sxy = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0), syy = y.reduce((s, v) => s + (v - my) ** 2, 0);
    const slope = sxy / sxx, icpt = my - slope * mx, r = sxy / Math.sqrt(sxx * syy);
    const d = p.map(([a, b]) => b - a), pd = p.map(([a, b]) => (a ? ((b - a) / a) * 100 : NaN));
    const within = isFinite(tea) ? p.filter(([a, b]) => a && Math.abs((b - a) / a) * 100 <= tea).length : NaN;
    let h = `<table class="t"><tr><th>n</th><th>Mean bias</th><th>Mean % bias</th><th>Slope</th><th>Intercept</th><th>r</th></tr><tr><td>${p.length}</td><td>${f(mean(d), 3)}</td><td>${f(mean(pd.filter(isFinite)))}%</td><td>${f(slope, 3)}</td><td>${f(icpt, 3)}</td><td>${f(r, 4)}</td></tr></table>`;
    if (isFinite(tea)) h += verdict((within / p.length) * 100 >= need, `${within} of ${p.length} results (${f((within / p.length) * 100, 1)}%) are within ±${f(tea, 1)}% of the comparison method; your criterion is ${f(need, 0)}%.`);
    h += `<p class="fine">Slope and intercept use ordinary least squares. If r is below about 0.975, the range is too narrow for reliable regression; judge by bias and the % within limits instead.</p>`;
    $("a-out").innerHTML = h; track("accuracy");
  };

  $("r-go").onclick = () => {
    const p = pairs($("r-vals").value), tol = parseFloat($("r-tol").value);
    if (p.length < 3) return ($("r-out").innerHTML = "<p>Enter at least 3 levels, one per line: expected value, measured value (5 levels across the claimed range is typical).</p>");
    p.sort((a, b) => a[0] - b[0]);
    const rows = p.map(([e, m]) => { const rec = e ? (m / e) * 100 : NaN; return { e, m, rec, ok: isFinite(tol) ? Math.abs(rec - 100) <= tol : true }; });
    let h = `<table class="t"><tr><th>Expected</th><th>Measured</th><th>Recovery</th><th>Result</th></tr>` + rows.map((q) => `<tr><td>${f(q.e, 3)}</td><td>${f(q.m, 3)}</td><td>${f(q.rec, 1)}%</td><td>${isFinite(tol) ? (q.ok ? "Pass" : "Fail") : "-"}</td></tr>`).join("") + `</table>`;
    if (isFinite(tol)) {
      const ok = rows.every((q) => q.ok);
      h += verdict(ok, ok ? `Every level recovered within 100 ± ${f(tol, 1)}%. The verified reportable range is ${f(rows[0].e, 3)} to ${f(rows[rows.length - 1].e, 3)}.` : `Levels outside 100 ± ${f(tol, 1)}% fall outside the verified range. Report only within the levels that passed, or investigate.`);
    }
    $("r-out").innerHTML = h; track("reportable_range");
  };

  $("demo").onclick = () => {
    $("p-vals").value = "98.1 99.4 100.2 101.0 99.8 100.5 98.9 99.6 100.9 101.3 99.2 100.0 98.7 100.8 99.9 100.3 101.1 99.5 100.6 99.0"; $("p-lim").value = "3";
    $("a-vals").value = "52 53.1\n75 76.0\n98 97.2\n120 122.5\n145 147.0\n180 178.9\n210 214.1\n260 258.0\n300 305.2\n350 352.8";
    $("a-tea").value = "8"; $("a-need").value = "90";
    $("r-vals").value = "20 19.6\n100 101.5\n250 248.0\n400 404.1\n600 589.0"; $("r-tol").value = "5";
    $("p-go").onclick(); $("a-go").onclick(); $("r-go").onclick();
  };
})();
