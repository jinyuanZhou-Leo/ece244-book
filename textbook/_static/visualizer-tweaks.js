// Tweaks for every <c-visualizer> (the Python Tutor memory visualizer).
//
// 1. Show the highlighted line next to the step counter, e.g.
//    "Next line to run: 33  Student y = x;". The memory view sits below the
//    code panel, so readers looking at the memory can't see the highlighted line.
//
// 2. The highlighted line has NOT run yet: the memory shown is the state before
//    it (trace steps store the line about to execute). The visualizer's legend
//    says "line that has just executed", so we correct it.
//
// 3. Keep the height fixed while stepping. Stack frames and heap blocks come
//    and go, which would make the page below jump. On load (and when the width
//    changes) we step through the whole trace once and set min-height to the
//    tallest step.
(function () {
  const WRONG_LEGEND = "line that has just executed";
  const LEGEND = "next line to run";

  function fixLegend(viz) {
    const walker = document.createTreeWalker(viz, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeValue.trim() === WRONG_LEGEND) n.nodeValue = LEGEND;
    }
  }

  function showCurrentLine(viz, counter) {
    let box = viz.querySelector(".viz-curline");
    if (!box) {
      box = document.createElement("div");
      box.className = "viz-curline";
      box.setAttribute("aria-live", "polite");
      counter.after(box);
    }
    const cell = viz.querySelector("td.cod.executed-highlight");
    const num = cell && cell.previousElementSibling;
    const text = cell
      ? bookI18n.t("visualizer.nextLine") + " " + num.textContent.trim() + "  " + cell.textContent.replace(/\u00a0/g, " ").trim()
      : "";
    if (box.textContent !== text) box.textContent = text;
  }

  // The counter reads "Step N of M", or "Done running (M steps)" at the end.
  function currentStep(viz, fwd) {
    if (fwd.disabled) return Infinity;
    const s = viz.querySelector("#curInstr").textContent.match(/Step (\d+) of/);
    return s ? Number(s[1]) : 1;
  }

  // Stepping queues a jQuery scroll animation of the code panel per step;
  // finish them at once so the panel doesn't keep scrolling after the lock.
  function finishScrolls(viz) {
    if (window.jQuery) window.jQuery(viz).find("#pyCodeOutputDiv").stop(true, true);
  }

  function lockHeight(viz, root) {
    const fwd = viz.querySelector("#jmpStepFwd");
    const first = viz.querySelector("#jmpFirstInstr");
    if (!fwd || !first) return;
    const step = currentStep(viz, fwd);
    root.style.boxSizing = "border-box";
    root.style.minHeight = "";
    first.click();
    let max = root.offsetHeight;
    for (let guard = 0; !fwd.disabled && guard < 5000; guard++) {
      fwd.click();
      max = Math.max(max, root.offsetHeight);
    }
    finishScrolls(viz);
    first.click();
    for (let i = 1; i < step && !fwd.disabled; i++) fwd.click();
    finishScrolls(viz);
    root.style.minHeight = max + "px";
    viz.dataset.heightLocked = String(root.offsetWidth);
  }

  function update(viz) {
    fixLegend(viz);
    const counter = viz.querySelector("#curInstr");
    const root = viz.querySelector(".ExecutionVisualizer");
    if (!counter || !root) return;
    showCurrentLine(viz, counter);
    if (viz.dataset.heightLocked !== String(root.offsetWidth)) lockHeight(viz, root);
  }

  let queued = false;
  function updateAll() {
    queued = false;
    document.querySelectorAll("c-visualizer").forEach(update);
  }
  function queue() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(updateAll);
    }
  }

  function start() {
    if (!document.querySelector("c-visualizer")) return;
    new MutationObserver(queue).observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class"],
    });
    let timer;
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(queue, 300);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
