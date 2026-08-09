import {
  findClosestIonContent,
  scrollToTop
} from "./chunk-MNCLH35A.js";
import {
  componentOnReady
} from "./chunk-ZHC4JGVQ.js";
import {
  readTask,
  writeTask
} from "./chunk-QKUTXZDQ.js";
import {
  __async
} from "./chunk-EGSMBJJY.js";

// node_modules/@ionic/core/dist/esm/status-tap-Kan2W7sh.js
var startStatusTap = () => {
  const win = window;
  win.addEventListener("statusTap", () => {
    readTask(() => {
      const width = win.innerWidth;
      const height = win.innerHeight;
      const el = document.elementFromPoint(width / 2, height / 2);
      if (!el) {
        return;
      }
      const contentEl = findClosestIonContent(el);
      if (contentEl) {
        new Promise((resolve) => componentOnReady(contentEl, resolve)).then(() => {
          writeTask(() => __async(null, null, function* () {
            contentEl.style.setProperty("--overflow", "hidden");
            yield scrollToTop(contentEl, 300);
            contentEl.style.removeProperty("--overflow");
          }));
        });
      }
    });
  });
};
export {
  startStatusTap
};
//# sourceMappingURL=status-tap-Kan2W7sh-TOUDRLNB.js.map
