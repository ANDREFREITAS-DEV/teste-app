export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function show(el) { el?.classList.remove("hidden"); }
export function hide(el) { el?.classList.add("hidden"); }

export function toast(text, ok = true) {
  Toastify({
    text,
    duration: 2200,
    gravity: "bottom",
    position: "center",
    style: { background: ok ? "#22c55e" : "#ef4444", borderRadius: "50px" }
  }).showToast();
}
