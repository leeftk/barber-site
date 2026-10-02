(function () {
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector("#site-nav");
  var bar = document.querySelector(".nav-bar");

  function closeMenu() {
    if (!menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
  }

  function openMenu() {
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.textContent = "Close";
  }

  toggle.addEventListener("click", function () {
    if (menu.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", function (event) {
    if (!bar.contains(event.target)) closeMenu();
  });

  var form = document.querySelector("#book-form");
  var status = document.querySelector("#form-status");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    status.hidden = false;
  });
})();
