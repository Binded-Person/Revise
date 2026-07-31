/* Revise — main.js */
(function () {
  "use strict";

  var CONTACT_EMAIL = "contactrevise12@gmail.com";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouchLayout = window.matchMedia("(max-width: 700px)").matches;

  /* ---------- nav scroll state ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- nav: mark the section you're in ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav-links a, .menu-panel a")
  );
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(function (el, i, all) { return el && all.indexOf(el) === i; });

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (a) {
            a.classList.toggle("is-current", a.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- hero canvas: drifting warm gradient ---------- */
  var canvas = document.getElementById("hero-canvas");
  if (canvas) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w, h;

    var blobs = [
      { x: 0.82, y: 0.18, r: 0.62, hue: "245, 222, 200", a: 0.8, sx: 0.09, sy: 0.07, px: 0.0, py: 1.4 },
      { x: 0.15, y: 0.75, r: 0.55, hue: "241, 199, 174", a: 0.5, sx: 0.07, sy: 0.1, px: 2.1, py: 3.6 },
      { x: 0.55, y: 0.95, r: 0.6, hue: "239, 231, 214", a: 0.9, sx: 0.05, sy: 0.06, px: 4.2, py: 0.8 },
      { x: 0.92, y: 0.78, r: 0.42, hue: "238, 190, 166", a: 0.35, sx: 0.1, sy: 0.08, px: 1.0, py: 5.1 },
      { x: 0.3, y: 0.1, r: 0.4, hue: "233, 155, 132", a: 0.18, sx: 0.08, sy: 0.09, px: 3.3, py: 2.2 }
    ];

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#F6F4EE";
      ctx.fillRect(0, 0, w, h);
      var time = t * 0.00016;
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        var bx = (b.x + Math.sin(time * (1 + b.sx * 6) + b.px) * b.sx) * w;
        var by = (b.y + Math.cos(time * (1 + b.sy * 6) + b.py) * b.sy) * h;
        var br = b.r * Math.max(w, h);
        var g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, "rgba(" + b.hue + ", " + b.a + ")");
        g.addColorStop(1, "rgba(" + b.hue + ", 0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    }

    resize();
    window.addEventListener("resize", function () {
      resize();
      if (reducedMotion) frame(4000);
    });

    if (reducedMotion) {
      frame(4000);
    } else {
      var running = true;
      var loop = function (t) {
        if (running) {
          frame(t);
          requestAnimationFrame(loop);
        }
      };
      requestAnimationFrame(loop);
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          var visible = entries[0].isIntersecting;
          if (visible && !running) {
            running = true;
            requestAnimationFrame(loop);
          } else {
            running = visible;
          }
        }).observe(canvas);
      }
    }
  }

  /* ---------- before/after comparisons ---------- */
  function describe(v) {
    if (v >= 85) return "Showing the original site";
    if (v >= 60) return "Mostly the original site";
    if (v > 40) return "Half original, half redesign";
    if (v > 15) return "Mostly the redesign";
    return "Showing the redesign";
  }

  document.querySelectorAll(".compare").forEach(function (compare) {
    var range = compare.querySelector(".compare-range");
    var frame = compare.closest(".frame");
    var toggle = frame ? frame.querySelector(".compare-toggle") : null;
    var name = range ? range.dataset.name || "this site" : "this site";

    /* Built in JS so they never exist as dead controls when the script
       doesn't run; the CSS fallback shows the redesign in full instead. */
    if (toggle) {
      [["Before", 100], ["After", 0]].forEach(function (pair) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = pair[0];
        b.dataset.pos = pair[1];
        b.setAttribute("aria-label", pair[0] + ": " + name);
        b.setAttribute("aria-pressed", "false");
        toggle.appendChild(b);
      });
    }

    function setPos(v) {
      compare.style.setProperty("--pos", v + "%");
      if (range) {
        range.value = v;
        range.setAttribute("aria-valuetext", describe(v));
      }
      if (toggle) {
        toggle.querySelectorAll("button").forEach(function (b) {
          var on = Number(b.dataset.pos) === Number(v);
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
      }
    }

    if (range) {
      range.addEventListener("input", function () {
        compare.classList.remove("is-demo");
        setPos(Number(range.value));
      });
      range.setAttribute("aria-valuetext", describe(Number(range.value)));
    }

    /* On touch, open on the redesign: it's the proof, and a visitor who
       never taps should still see the finished work. */
    if (isTouchLayout) setPos(0);

    if (toggle) {
      toggle.querySelectorAll("button").forEach(function (btn) {
        btn.addEventListener("click", function () {
          compare.classList.add("is-demo");
          setPos(Number(btn.dataset.pos));
        });
      });
    }

    /* Teach the interaction once: sweep to the redesign and back,
       so a visitor who never drags still sees the finished work. */
    if (!reducedMotion && !isTouchLayout && "IntersectionObserver" in window) {
      var taught = false;
      var io = new IntersectionObserver(
        function (entries) {
          if (!entries[0].isIntersecting || taught) return;
          taught = true;
          io.disconnect();
          /* Sweep to the redesign and rest there — the demo should end on
             the proof, not back on the dated site. */
          compare.classList.add("is-demo");
          setTimeout(function () { setPos(20); }, 420);
        },
        { threshold: 0.55 }
      );
      io.observe(compare);
    }
  });

  /* ---------- pricing CTA carries the choice to the form ---------- */
  var packageField = document.getElementById("f-package");
  var picked = document.getElementById("plan-picked");
  document.querySelectorAll(".plan-cta").forEach(function (cta) {
    cta.addEventListener("click", function () {
      var choice = cta.dataset.package;
      if (!packageField || !choice) return;
      packageField.value = choice;
      /* Confirm the handoff — otherwise the choice vanishes into a
         hidden select 4,000px from where it was made. */
      if (picked) {
        picked.textContent = "";
        picked.appendChild(document.createTextNode("You picked "));
        var s = document.createElement("strong");
        s.textContent = "The " + choice;
        picked.appendChild(s);
        picked.appendChild(document.createTextNode(". "));
        var n = document.createElement("span");
        n.textContent = "You can change it below, or leave it to us.";
        picked.appendChild(n);
        picked.hidden = false;
      }
    });
  });

  /* ---------- marquee: pause control (WCAG 2.2.2) ---------- */
  var marquee = document.querySelector(".marquee");
  var pauseBtn = document.getElementById("marquee-pause");
  if (marquee && pauseBtn) {
    pauseBtn.addEventListener("click", function () {
      var paused = marquee.classList.toggle("is-paused");
      pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      pauseBtn.querySelector(".sr-only").textContent = paused
        ? "Resume the scrolling neighborhood list"
        : "Pause the scrolling neighborhood list";
    });
  }

  /* ---------- contact form ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var note = document.getElementById("form-note");
    var submitBtn = document.getElementById("form-submit");
    var wrap = document.getElementById("form-region");
    var attempted = false;

    /* Suppress native validation only now that JS is confirmed running.
       Without this script the browser's own checks stay in force. */
    form.noValidate = true;

    var RULES = [
      {
        id: "f-name",
        test: function (v) { return v.length > 0; },
        message: "Please add your name so we know who we're writing back to."
      },
      {
        id: "f-email",
        test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); },
        message: "We need a working email address to send the audit back to."
      },
      {
        id: "f-biz",
        test: function (v) { return v.length > 0; },
        message: "Please add your business name so we can look up your site."
      },
      {
        id: "f-url",
        optional: true,
        test: function (v) { return /^([a-z][a-z0-9+.-]*:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(v); },
        message: "That doesn't look like a web address. Something like yoursite.com works."
      }
    ];

    function fieldOf(id) { return document.getElementById(id); }

    function setError(id, message) {
      var input = fieldOf(id);
      var wrapper = input.closest(".field");
      var slot = document.getElementById("e-" + id.slice(2));
      if (message) {
        wrapper.classList.add("has-error");
        input.setAttribute("aria-invalid", "true");
        if (slot) slot.textContent = message;
      } else {
        wrapper.classList.remove("has-error");
        input.removeAttribute("aria-invalid");
        if (slot) slot.textContent = "";
      }
    }

    /* Validate every field in one pass so two problems cost one round trip. */
    function validate() {
      var failed = [];
      RULES.forEach(function (rule) {
        var input = fieldOf(rule.id);
        if (!input) return;
        var value = input.value.trim();
        var empty = value.length === 0;
        var ok = rule.optional && empty ? true : rule.test(value);
        setError(rule.id, ok ? "" : rule.message);
        if (!ok) failed.push(rule.id);
      });
      return failed;
    }

    RULES.forEach(function (rule) {
      var input = fieldOf(rule.id);
      if (!input) return;

      function recheck() {
        if (!attempted) return;
        var value = input.value.trim();
        var empty = value.length === 0;
        var ok = rule.optional && empty ? true : rule.test(value);
        setError(rule.id, ok ? "" : rule.message);
      }

      input.addEventListener("blur", recheck);
      /* Clear a resolved error as they type, rather than making them
         guess whether the fix took. */
      input.addEventListener("input", function () {
        if (!attempted) return;
        if (input.closest(".field").classList.contains("has-error")) recheck();
      });
    });

    function showThanks(email) {
      var box = document.createElement("div");
      box.className = "form-sent";

      var h = document.createElement("h3");
      h.textContent = "Got it — thank you.";

      var p = document.createElement("p");
      p.appendChild(document.createTextNode("We'll look at your site properly and reply to "));
      var strong = document.createElement("strong");
      strong.textContent = email;
      p.appendChild(strong);
      p.appendChild(document.createTextNode(" within a day. No pressure after that."));

      var p2 = document.createElement("p");
      p2.textContent = "Wrong address, or thought of something else? Just email us and we'll pick it up there.";

      box.appendChild(h);
      box.appendChild(p);
      box.appendChild(p2);

      /* Hide rather than remove, so nothing that had focus is destroyed
         mid-interaction, then move focus to the confirmation so it's
         announced and the keyboard position stays sensible. */
      form.hidden = true;
      (wrap || form.parentNode).appendChild(box);
      box.setAttribute("tabindex", "-1");
      box.focus();
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      attempted = true;

      var failed = validate();
      if (failed.length) {
        note.textContent =
          failed.length === 1
            ? "One field needs a look before this can send."
            : failed.length + " fields need a look before this can send.";
        var first = fieldOf(failed[0]);
        if (first) first.focus();
        return;
      }

      var email = fieldOf("f-email").value.trim();
      var biz = fieldOf("f-biz").value.trim();
      var subject = form.elements._subject;
      if (subject) subject.value = "Free audit request — " + biz;

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      note.textContent = "Sending your request…";

      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("rejected");
          showThanks(email);
        })
        .catch(function () {
          /* Never surface the raw exception — name the problem and the way out. */
          submitBtn.disabled = false;
          submitBtn.textContent = "Send it over";
          note.textContent =
            "That didn't send — your connection may have dropped. Try again, or email us at " +
            CONTACT_EMAIL + " and we'll pick it up there.";
        });
    });

    if (wrap) wrap.setAttribute("data-ready", "true");
  }

  /* ---------- footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
