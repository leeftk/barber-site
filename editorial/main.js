const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector("#menu");
const label = toggle.querySelector("span");

function closeMenu() {
  menu.hidden = true;
  toggle.setAttribute("aria-expanded", "false");
  label.textContent = "Menu";
  document.body.classList.remove("menu-open");
}

function openMenu() {
  menu.hidden = false;
  toggle.setAttribute("aria-expanded", "true");
  label.textContent = "Close";
  document.body.classList.add("menu-open");
}

toggle.addEventListener("click", () => {
  if (toggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
  } else {
    openMenu();
  }
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
    toggle.focus();
  }
});

const form = document.querySelector("#chair-form");
const confirm = document.querySelector(".confirm");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  form.hidden = true;
  confirm.hidden = false;
});
