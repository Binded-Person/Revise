/* Revise — main.js */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Contact form delivery.
     Sign up at formspree.io, create a form, and paste its endpoint below
     (it looks like https://formspree.io/f/abcdwxyz). Until you do, the form
     falls back to opening the visitor's email app so it still works.
     ------------------------------------------------------------------ */
  var FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";
  var CONTACT_EMAIL = "hello@revisechicago.com";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav scroll state ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

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
        if (running) frame(t);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
      // pause when the hero is offscreen
      new IntersectionObserver(function (entries) {
        running = entries[0].isIntersecting;
      }).observe(canvas);
    }
  }

  /* ---------- scroll reveals ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- before/after compare sliders ---------- */
  document.querySelectorAll(".compare").forEach(function (compare) {
    var range = compare.querySelector(".compare-range");
    function setPos(v) {
      compare.style.setProperty("--pos", v + "%");
    }
    range.addEventListener("input", function () {
      setPos(range.value);
    });
    setPos(range.value);
  });

  /* ---------- contact form ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var note = document.getElementById("form-note");
    var submitBtn = document.getElementById("form-submit");
    var configured = FORMSPREE_ENDPOINT.indexOf("YOUR_FORM_ID") === -1;

    if (configured) form.action = FORMSPREE_ENDPOINT;

    function val(fieldName) {
      var el = form.elements[fieldName];
      return el && el.value ? el.value.trim() : "";
    }

    function say(msg, ok) {
      note.textContent = msg;
      note.className = ok ? "form-note ok" : "form-note";
    }

    function showThanks() {
      var box = document.createElement("div");
      box.className = "form-sent";
      var h = document.createElement("h3");
      h.textContent = "Got it — thank you.";
      var p = document.createElement("p");
      p.textContent =
        "We'll look at your site properly and reply within a day with the audit. No pressure after that.";
      box.appendChild(h);
      box.appendChild(p);
      form.parentNode.replaceChild(box, form);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var who = val("name");
      var email = val("email");
      var biz = val("business");

      if (!who || !biz) {
        say("Just your name and business name and we're good to go.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        say("We need a working email address to send the audit back to.");
        return;
      }

      // No Formspree ID yet — hand off to the visitor's email app instead.
      if (!configured) {
        var body =
          "Name: " + who + "\n" +
          "Email: " + email + "\n" +
          "Business: " + biz +
          (val("website") ? "\nCurrent site: " + val("website") : "") +
          (val("message") ? "\n\n" + val("message") : "") + "\n";
        window.location.href =
          "mailto:" + CONTACT_EMAIL +
          "?subject=" + encodeURIComponent("Free audit request — " + biz) +
          "&body=" + encodeURIComponent(body);
        say("Opening your email app — hit send and we'll take it from there.", true);
        return;
      }

      if (form.elements._subject) {
        form.elements._subject.value = "Free audit request — " + biz;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      say("");

      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (res) {
          if (res.ok) {
            showThanks();
            return;
          }
          return res.json().then(function (data) {
            var errs = data && data.errors;
            throw new Error(
              errs && errs.length
                ? errs
                    .map(function (x) { return x.message; })
                    .join(", ")
                : "That didn't go through."
            );
          });
        })
        .catch(function (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send it over";
          say(
            (err && err.message ? err.message + " " : "") +
              "Email us directly at " + CONTACT_EMAIL + " and we'll pick it up there."
          );
        });
    });
  }

  /* ---------- footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
