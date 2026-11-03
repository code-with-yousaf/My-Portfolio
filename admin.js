document.addEventListener("DOMContentLoaded", function () {

  var PASS     = "myk2026";
  var KEY      = "myk_certs_v5";
  var lockEl   = document.getElementById("admin-lock");
  var panelEl  = document.getElementById("admin-panel");
  var pwdInput = document.getElementById("pwd-input");
  var pwdBtn   = document.getElementById("pwd-btn");
  var pwdError = document.getElementById("pwd-error");

  if (sessionStorage.getItem("myk_admin") === "1") { showPanel(); }
  pwdBtn.addEventListener("click", tryLogin);
  pwdInput.addEventListener("keydown", function(e) { if (e.key === "Enter") tryLogin(); });
  function tryLogin() {
    if (pwdInput.value === PASS) { sessionStorage.setItem("myk_admin","1"); showPanel(); }
    else { pwdError.textContent = "Wrong password!"; pwdInput.value = ""; }
  }
  function showPanel() {
    lockEl.style.display  = "none";
    panelEl.style.display = "block";
    render();
  }

  // ===== DATA =====
  function loadCerts() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e) { return []; } }
  function saveCerts(arr) { try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch(e) { alert("Storage full! Delete some certificates."); } }

  var certs      = loadCerts();
  var editId     = null;
  var activeTab  = "image";
  var pendingImg = null;  // final base64 image to save

  // ===== ELEMENTS =====
  var grid      = document.getElementById("cert-grid");
  var emptyEl   = document.getElementById("cert-empty");
  var overlay   = document.getElementById("modal-overlay");
  var mTitle    = document.getElementById("modal-title");
  var form      = document.getElementById("cert-form");
  var openBtn   = document.getElementById("open-modal-btn");
  var closeBtn  = document.getElementById("modal-close");
  var cancelBtn = document.getElementById("cancel-btn");
  var saveTxt   = document.getElementById("save-btn-text");
  var errEl     = document.getElementById("form-error");
  var fTitle    = document.getElementById("cert-title");
  var fIssuer   = document.getElementById("cert-issuer");
  var fDate     = document.getElementById("cert-date");

  var tabs      = document.querySelectorAll(".upload-tab");
  var secImg    = document.getElementById("section-image");
  var secPdf    = document.getElementById("section-pdf");

  var imgZone   = document.getElementById("img-drop-zone");
  var imgFile   = document.getElementById("cert-img-file");
  var imgSel    = document.getElementById("img-selected");
  var imgName   = document.getElementById("img-sel-name");
  var imgRm     = document.getElementById("img-remove");
  var imgNote   = document.getElementById("img-edit-note");

  var pdfZone   = document.getElementById("pdf-drop-zone");
  var pdfFile   = document.getElementById("cert-pdf-file");
  var pdfSel    = document.getElementById("pdf-selected");
  var pdfName   = document.getElementById("pdf-sel-name");
  var pdfRm     = document.getElementById("pdf-remove");
  var pdfNote   = document.getElementById("pdf-edit-note");

  var lightbox  = document.getElementById("cert-lightbox");
  var lbBack    = document.getElementById("lightbox-backdrop");
  var lbClose   = document.getElementById("lightbox-close");
  var lbTitle   = document.getElementById("lightbox-title");
  var lbImg     = document.getElementById("lightbox-img");
  var lbLoad    = document.getElementById("lb-loading");

  // ===== TABS =====
  tabs.forEach(function(t) {
    t.addEventListener("click", function() {
      tabs.forEach(function(x) { x.classList.remove("active"); });
      t.classList.add("active");
      activeTab = t.dataset.tab;
      secImg.style.display = activeTab === "image" ? "block" : "none";
      secPdf.style.display = activeTab === "pdf"   ? "block" : "none";
      pendingImg = null;
    });
  });

  // ===== IMAGE ZONE =====
  imgZone.addEventListener("click", function() { imgFile.click(); });
  imgZone.addEventListener("dragover",  function(e) { e.preventDefault(); imgZone.classList.add("drag-over"); });
  imgZone.addEventListener("dragleave", function() { imgZone.classList.remove("drag-over"); });
  imgZone.addEventListener("drop", function(e) { e.preventDefault(); imgZone.classList.remove("drag-over"); if (e.dataTransfer.files[0]) handleImg(e.dataTransfer.files[0]); });
  imgFile.addEventListener("change", function() { if (imgFile.files[0]) handleImg(imgFile.files[0]); });
  imgRm.addEventListener("click", function(e) {
    e.stopPropagation(); pendingImg = null; imgFile.value = "";
    imgSel.style.display = "none"; imgZone.style.display = "block";
    if (editId) imgNote.style.display = "block";
  });

  function handleImg(file) {
    if (!file.type.startsWith("image/")) { setErr("Only JPG/PNG image files!"); return; }
    if (file.size > 3*1024*1024) { setErr("Image too large! Max 3MB."); return; }
    setErr("");
    var r = new FileReader();
    r.onload = function(ev) {
      pendingImg = ev.target.result;
      showFileSelected(imgZone, imgSel, imgName, imgNote, file.name);
    };
    r.readAsDataURL(file);
  }

  // ===== PDF ZONE =====
  pdfZone.addEventListener("click", function() { pdfFile.click(); });
  pdfZone.addEventListener("dragover",  function(e) { e.preventDefault(); pdfZone.classList.add("drag-over"); });
  pdfZone.addEventListener("dragleave", function() { pdfZone.classList.remove("drag-over"); });
  pdfZone.addEventListener("drop", function(e) { e.preventDefault(); pdfZone.classList.remove("drag-over"); if (e.dataTransfer.files[0]) handlePdf(e.dataTransfer.files[0]); });
  pdfFile.addEventListener("change", function() { if (pdfFile.files[0]) handlePdf(pdfFile.files[0]); });
  pdfRm.addEventListener("click", function(e) {
    e.stopPropagation(); pendingImg = null; pdfFile.value = "";
    pdfSel.style.display = "none"; pdfZone.style.display = "block";
    if (editId) pdfNote.style.display = "block";
  });

  function handlePdf(file) {
    if (file.type !== "application/pdf") { setErr("Only PDF files!"); return; }
    setErr(""); saveTxt.textContent = "Processing PDF...";
    var r = new FileReader();
    r.onload = function(ev) {
      var dataUrl = ev.target.result;
      // Convert PDF page 1 to image using pdf.js
      if (typeof pdfjsLib === "undefined") {
        setErr("PDF.js not loaded. Please use JPG/PNG image instead.");
        saveTxt.textContent = "Save Certificate";
        return;
      }
      pdfjsLib.getDocument(dataUrl).promise.then(function(pdf) {
        pdf.getPage(1).then(function(page) {
          var vp = page.getViewport({ scale: 2.0 });
          var canvas = document.createElement("canvas");
          canvas.width  = vp.width;
          canvas.height = vp.height;
          page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise.then(function() {
            pendingImg = canvas.toDataURL("image/jpeg", 0.85);
            saveTxt.textContent = "Save Certificate";
            showFileSelected(pdfZone, pdfSel, pdfName, pdfNote, file.name);
          });
        });
      }).catch(function(err) {
        setErr("Could not read PDF. Try a different file.");
        saveTxt.textContent = "Save Certificate";
      });
    };
    r.readAsDataURL(file);
  }

  function showFileSelected(zone, sel, nameEl, note, fname) {
    zone.style.display = "none";
    sel.style.display  = "flex";
    nameEl.textContent = fname;
    note.style.display = "none";
  }

  // ===== RENDER =====
  function render() {
    grid.innerHTML = "";
    if (certs.length === 0) { emptyEl.style.display = "block"; return; }
    emptyEl.style.display = "none";
    certs.forEach(function(c) {
      var div = document.createElement("div");
      div.className = "cert-card";
      div.innerHTML =
        '<div class="cert-card-preview" style="cursor:pointer;">' +
          (c.img
            ? '<img class="cert-thumb-img" src="' + c.img + '" alt="' + xa(c.title) + '" />'
            : '<div class="cert-no-thumb"><div class="big-emoji">🏆</div><span>Certificate</span></div>') +
          '<div class="cert-hover-overlay">👁 View</div>' +
        '</div>' +
        '<div class="cert-card-body">' +
          '<div class="cert-card-title">' + xe(c.title) + '</div>' +
          (c.issuer ? '<div class="cert-card-issuer">' + xe(c.issuer) + '</div>' : '') +
          (c.date   ? '<div class="cert-card-date">'   + xe(c.date)   + '</div>' : '') +
          '<div class="cert-card-actions">' +
            '<button class="cert-action-btn edit-btn"   data-id="' + c.id + '" data-action="edit">✏️ Edit</button>' +
            '<button class="cert-action-btn delete-btn" data-id="' + c.id + '" data-action="delete">🗑️ Delete</button>' +
          '</div>' +
        '</div>';
      div.querySelector(".cert-card-preview").addEventListener("click", function() { openLB(c); });
      grid.appendChild(div);
    });
  }

  grid.addEventListener("click", function(e) {
    var b = e.target.closest("[data-action]"); if (!b) return;
    if (b.dataset.action === "edit")   doEdit(b.dataset.id);
    if (b.dataset.action === "delete") doDelete(b.dataset.id);
  });

  // ===== LIGHTBOX =====
  function openLB(c) {
    lbTitle.textContent  = c.title || "";
    lbImg.style.display  = "none";
    lbLoad.style.display = "flex";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    lbImg.onload  = function() { lbLoad.style.display = "none"; lbImg.style.display = "block"; };
    lbImg.onerror = function() { lbLoad.style.display = "none"; };
    lbImg.src = c.img || "";
  }
  lbClose.addEventListener("click", closeLB);
  lbBack.addEventListener("click",  closeLB);
  document.addEventListener("keydown", function(e) { if (e.key === "Escape") closeLB(); });
  lbImg.addEventListener("contextmenu", function(e) { e.preventDefault(); });
  function closeLB() { lightbox.classList.remove("open"); document.body.style.overflow = ""; lbImg.src = ""; }

  // ===== EDIT =====
  function doEdit(id) {
    var c = certs.find(function(x) { return x.id === id; }); if (!c) return;
    editId = id; pendingImg = null;
    mTitle.textContent = "Edit Certificate";
    fTitle.value = c.title; fIssuer.value = c.issuer||""; fDate.value = c.date||"";
    // reset to image tab
    tabs.forEach(function(t) { t.classList.toggle("active", t.dataset.tab === "image"); });
    activeTab = "image";
    secImg.style.display = "block"; secPdf.style.display = "none";
    imgZone.style.display = "block"; imgSel.style.display = "none";
    pdfZone.style.display = "block"; pdfSel.style.display = "none";
    imgNote.style.display = c.img ? "block" : "none";
    pdfNote.style.display = "none";
    imgFile.value = ""; pdfFile.value = "";
    setErr(""); openModal();
  }

  // ===== DELETE =====
  function doDelete(id) {
    if (!confirm("Delete this certificate?")) return;
    certs = certs.filter(function(x) { return x.id !== id; });
    saveCerts(certs); render();
  }

  // ===== OPEN MODAL =====
  // ===== EXPORT =====
  var exportBtn = document.getElementById("export-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", function() {
      var blob = new Blob([JSON.stringify(certs, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      alert("data.json downloaded!\n\n1. Copy it to your portfolio folder\n2. Upload everything to GitHub\n3. All visitors will see your certificates!");
    });
  }

  openBtn.addEventListener("click", function() {
    editId = null; pendingImg = null;
    mTitle.textContent = "Add Certificate"; form.reset();
    tabs.forEach(function(t) { t.classList.toggle("active", t.dataset.tab === "image"); });
    activeTab = "image";
    secImg.style.display = "block"; secPdf.style.display = "none";
    imgZone.style.display = "block"; imgSel.style.display = "none";
    pdfZone.style.display = "block"; pdfSel.style.display = "none";
    imgNote.style.display = "none";  pdfNote.style.display = "none";
    imgFile.value = ""; pdfFile.value = "";
    setErr(""); openModal();
  });
  closeBtn.addEventListener("click",  closeModal);
  cancelBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", function(e) { if (e.target === overlay) closeModal(); });
  function openModal()  { overlay.classList.add("open");    document.body.style.overflow = "hidden"; }
  function closeModal() { overlay.classList.remove("open"); document.body.style.overflow = ""; }

  // ===== SAVE =====
  form.addEventListener("submit", function(ev) {
    ev.preventDefault(); setErr("");
    if (!fTitle.value.trim()) { setErr("Please enter the certificate title!"); return; }
    var old = editId ? certs.find(function(x) { return x.id === editId; }) : null;
    if (!editId && !pendingImg) { setErr("Please upload an image or PDF!"); return; }

    var obj = {
      id:     editId || ("c" + Date.now()),
      title:  fTitle.value.trim(),
      issuer: fIssuer.value.trim(),
      date:   fDate.value.trim(),
      img:    pendingImg || (old ? old.img : null)
    };

    if (editId) {
      var i = certs.findIndex(function(x) { return x.id === editId; });
      if (i !== -1) certs[i] = obj;
    } else { certs.unshift(obj); }

    saveCerts(certs); closeModal(); render();
  });

  function setErr(m) { if (errEl) errEl.textContent = m; }
  function xe(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function xa(s) { return String(s||"").replace(/"/g,"&quot;"); }
});

