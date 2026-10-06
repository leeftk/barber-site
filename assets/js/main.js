(function () {
  "use strict";

  // O conteúdo editável fica em content/site.json (editado pelo painel Pages CMS).
  // O HTML já traz os mesmos textos, para o site funcionar mesmo se este arquivo não carregar.
  var CONTENT_URL = "content/site.json";

  function get(obj, path) {
    return path.split(".").reduce(function (value, key) {
      return value == null ? undefined : value[key];
    }, obj);
  }

  function filled(value) {
    return typeof value === "string" ? value.trim() !== "" : typeof value === "number";
  }

  function safeUrl(url) {
    return filled(url) && /^(https?:|tel:)/i.test(url.trim()) ? url.trim() : "";
  }

  function localPath(path) {
    return filled(path) ? path.trim().replace(/^\/+/, "") : "";
  }

  function create(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (filled(text)) node.textContent = text;
    return node;
  }

  function fullAddress(location) {
    var l = location || {};
    var cityLine = [l.city, l.state].filter(filled).join(" - ");
    return [l.street, l.district, cityLine, l.zip].filter(filled).join(", ");
  }

  function buildLinks(data) {
    var contact = data.contact || {};
    var number = String(contact.whatsappNumber || "").replace(/\D/g, "");
    var message = filled(contact.whatsappMessage) ? "?text=" + encodeURIComponent(contact.whatsappMessage.trim()) : "";
    var address = fullAddress(data.location);

    return {
      booking: safeUrl(contact.bookingUrl),
      whatsapp: number ? "https://wa.me/" + number + message : "",
      phone: number ? "tel:+" + number : "",
      instagram: safeUrl(contact.instagramUrl),
      google: safeUrl(contact.googleUrl),
      directions: address ? "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(address) : ""
    };
  }

  function applyText(data) {
    document.querySelectorAll("[data-text]").forEach(function (node) {
      var value = get(data, node.getAttribute("data-text"));
      if (filled(value)) node.textContent = value;
    });
  }

  // Uma linha em branco no texto separa os parágrafos.
  function applyParagraphs(data) {
    document.querySelectorAll("[data-paragraphs]").forEach(function (node) {
      var value = get(data, node.getAttribute("data-paragraphs"));
      if (!filled(value)) return;
      node.textContent = "";
      value.split(/\n\s*\n/).forEach(function (paragraph) {
        if (filled(paragraph)) node.appendChild(create("p", "lead", paragraph.trim()));
      });
    });
  }

  function applyLinks(links) {
    document.querySelectorAll("[data-link]").forEach(function (node) {
      var url = links[node.getAttribute("data-link")];
      if (url) {
        node.href = url;
        node.hidden = false;
      } else {
        // Link apagado no painel: esconde o botão em vez de deixar um link quebrado.
        node.hidden = true;
      }
    });
  }

  function applyImages(data) {
    document.querySelectorAll("[data-img]").forEach(function (img) {
      var src = localPath(get(data, img.getAttribute("data-img")));
      var alt = get(data, img.getAttribute("data-alt") || "");
      if (src) img.src = src;
      if (filled(alt)) img.alt = alt;
    });
  }

  var renderers = {
    services: function (list, items) {
      items.forEach(function (service) {
        if (!filled(service.name)) return;
        var item = create("li", "service");
        var copy = create("div");
        copy.appendChild(create("h3", "", service.name));
        if (filled(service.description)) copy.appendChild(create("p", "", service.description));

        var meta = create("p", "service-meta");
        if (filled(service.duration)) meta.appendChild(create("span", "service-duration", service.duration));
        if (filled(service.price)) {
          meta.appendChild(create("span", "service-price", service.price));
        } else {
          meta.appendChild(create("span", "service-price is-empty", "Consulte no Trinks"));
        }

        item.appendChild(copy);
        item.appendChild(meta);
        list.appendChild(item);
      });
    },

    gallery: function (list, items) {
      items.forEach(function (photo) {
        var src = localPath(photo.image);
        if (!src) return;
        var item = create("li");
        var figure = create("figure");
        var img = create("img");
        img.src = src;
        img.alt = filled(photo.alt) ? photo.alt : "";
        img.loading = "lazy";
        img.decoding = "async";
        img.addEventListener("error", function () {
          item.remove();
        });
        figure.appendChild(img);
        if (filled(photo.caption)) figure.appendChild(create("figcaption", "", photo.caption));
        item.appendChild(figure);
        list.appendChild(item);
      });
    },

    hours: function (list, items) {
      items.forEach(function (row) {
        if (!filled(row.days)) return;
        var line = create("div");
        line.appendChild(create("dt", "", row.days));
        line.appendChild(create("dd", "", row.time));
        list.appendChild(line);
      });
    }
  };

  function applyLists(data) {
    document.querySelectorAll("[data-list]").forEach(function (list) {
      var key = list.getAttribute("data-list");
      var items = data[key];
      if (!Array.isArray(items) || !items.length || !renderers[key]) return;
      list.textContent = "";
      renderers[key](list, items);
    });
  }

  function applyStructuredData(data, links) {
    var location = data.location || {};
    var canonical = document.querySelector('link[rel="canonical"]');
    var info = {
      "@context": "https://schema.org",
      "@type": "HairSalon",
      name: data.name,
      description: data.headline,
      url: canonical ? canonical.href : window.location.href.split("#")[0],
      image: new URL("images/og-image.jpg", document.baseURI).href,
      logo: new URL("images/logo.jpg", document.baseURI).href,
      address: {
        "@type": "PostalAddress",
        streetAddress: location.street,
        addressLocality: location.city,
        addressRegion: location.state,
        postalCode: location.zip,
        addressCountry: "BR"
      },
      sameAs: [links.instagram, links.google, links.booking].filter(Boolean)
    };
    if (links.phone) info.telephone = links.phone.replace("tel:", "");

    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(info);
    document.head.appendChild(script);
  }

  function loadContent() {
    if (!window.fetch) return;
    fetch(CONTENT_URL, { cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        var links = buildLinks(data);
        applyText(data);
        applyParagraphs(data);
        applyLinks(links);
        applyImages(data);
        applyLists(data);
        applyStructuredData(data, links);
      })
      .catch(function (error) {
        console.warn("Não foi possível carregar " + CONTENT_URL + ". Mostrando o conteúdo padrão do HTML.", error);
      });
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.getElementById("menu");
    var header = document.querySelector("[data-header]");
    if (!toggle || !menu) return;

    function setOpen(open) {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    }

    toggle.addEventListener("click", function () {
      setOpen(!menu.classList.contains("is-open"));
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!header.contains(event.target)) setOpen(false);
    });
  }

  function setupScrollEffects() {
    var header = document.querySelector("[data-header]");
    var hero = document.querySelector("[data-hero]");
    var bar = document.querySelector("[data-mobile-bar]");

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var reveals = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      reveals.forEach(function (node) { node.classList.add("is-visible"); });
      if (bar) bar.classList.add("is-visible");
      return;
    }

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (node) { revealObserver.observe(node); });

    // A barra fixa do celular aparece depois que os botões do topo saem da tela.
    if (hero && bar) {
      new IntersectionObserver(function (entries) {
        bar.classList.toggle("is-visible", !entries[0].isIntersecting);
      }, { rootMargin: "-40% 0px 0px 0px" }).observe(hero);
    }
  }

  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = new Date().getFullYear();
  });

  setupMenu();
  setupScrollEffects();
  loadContent();
})();
