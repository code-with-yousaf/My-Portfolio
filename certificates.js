document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("admin-lock")) return;

  var KEY     = "myk_certs_v5";
  var grid    = document.getElementById("cert-grid");
  var emptyEl = document.getElementById("cert-empty");
  var lightbox= document.getElementById("cert-lightbox");
  var lbBack  = document.getElementById("lightbox-backdrop");
  var lbClose = document.getElementById("lightbox-close");
  var lbTitle = document.getElementById("lightbox-title");
  var lbImg   = document.getElementById("lightbox-img");
  var lbLoad  = document.getElementById("lb-loading");

  // Try data.json first (for GitHub Pages / hosted version)
  // Fall back to localStorage (for local testing)
  fetch("data.json?t=" + Date.now())
    .then(function(r) {
      if (!r.ok) throw new Error("no data.json");
      return r.json();
    })
    .then(function(data) {
      if (data && data.length > 0) {
        render(data);
      } else {
        // data.json is empty, try localStorage
        render(loadLocal());
      }
    })
    .catch(function() {
      // No data.json (local file), use localStorage
      render(loadLocal());
    });

  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch(e) { return []; }
  }

  function render(certs) {
    grid.innerHTML = "";
    if (!certs || certs.length === 0) { emptyEl.style.display = "block"; return; }
    emptyEl.style.display = "none";
    certs.forEach(function(c, i) {
      var div = document.createElement("div");
      div.className = "cert-card reveal";
      div.style.animationDelay = (i * 80) + "ms";
      div.innerHTML =
        '<div class="cert-card-preview" style="cursor:pointer;">' +
          (c.img
            ? '<img class="cert-thumb-img" src="' + c.img + '" alt="' + xa(c.title) + '" />'
            : '<div class="cert-no-thumb"><div class="big-emoji">🏆</div><span>Certificate</span></div>') +
        '</div>' +
        '<div class="cert-card-body">' +
          '<div class="cert-card-title">' + xe(c.title) + '</div>' +
          (c.issuer ? '<div class="cert-card-issuer">' + xe(c.issuer) + '</div>' : '') +
          (c.date   ? '<div class="cert-card-date">'   + xe(c.date)   + '</div>' : '') +
        '</div>';

      div.querySelector(".cert-card-preview").addEventListener("click", function() {
        lbTitle.textContent  = c.title || "";
        lbImg.style.display  = "none";
        lbLoad.style.display = "flex";
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
        lbImg.onload  = function() { lbLoad.style.display = "none"; lbImg.style.display = "block"; };
        lbImg.onerror = function() { lbLoad.style.display = "none"; };
        lbImg.src = c.img || "";
      });
      grid.appendChild(div);
    });
  }

  lbClose.addEventListener("click", closeLB);
  lbBack.addEventListener("click",  closeLB);
  document.addEventListener("keydown", function(e) { if (e.key === "Escape") closeLB(); });
  lbImg.addEventListener("contextmenu", function(e) { e.preventDefault(); });
  function closeLB() { lightbox.classList.remove("open"); document.body.style.overflow = ""; lbImg.src = ""; }
  function xe(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function xa(s) { return String(s||"").replace(/"/g,"&quot;"); }
});
