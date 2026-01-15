// You can safely delete this file once you added your own code. // DoNotSubmit
import {
  initTodoCheckboxes,
  initCopyButtons,
  initDomainInput,
  initCloudFormationButton,
} from "./toDelete";

/**
 * Initialize the theme toggle button.
 * You need to keep this function as it is if you want to use the theme toggle button.
 */
function initThemeToggle() {
  const root = document.documentElement;
  const btnLight = document.getElementById("theme-toggle-light"); // 🌚
  const btnDark = document.getElementById("theme-toggle-dark"); // 🌝

  function setTheme(theme) {
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }

  // Safety: ensure a theme exists
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    setTheme(savedTheme);
  }

  btnLight?.addEventListener("click", () => setTheme("dark"));
  btnDark?.addEventListener("click", () => setTheme("light"));
}

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  // DoNotSubmit // You can remove the functions below.
  initTodoCheckboxes();
  initCopyButtons();
  initDomainInput();
  initCloudFormationButton();
});
