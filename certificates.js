document.addEventListener('DOMContentLoaded', function () {

  var STORAGE_KEY = 'myk_certs_v4';
  var certs       = load();
  var editingId   = null;
  var pendingB64  = null;
  var pendingName = null;

  var grid       = document.getElementById('cert-grid');
  var empty      = document.getElementById('cert-empty');
  var overlay    = document.getElementById('modal-overlay');
  var modalTitle = document.getElementById('modal-title');
  var form       = document.getElementById('cert-form');
  var openBtn    = document.getElementById('open-modal-btn');
  var closeBtn   = document.getElementById('modal-close');
  var cancelBtn  = document.getElementById('cancel-btn');
  var saveTxt    = document.getElementById('save-btn-text');
  var errEl      = document.getElementById('form-error');
  var fTitle     = document.getElementById('cert-title');
  var dropZone   = document.getElementById('pdf-drop-zone');
  var fileInput  = document.getElementById('cert-pdf');
  var pdfSel     = document.getElementById('pdf-selected');
  var pdfSelName = document.getElementById('pdf-sel-name');
  var pdfRemove  = document.getElementById('pdf-remove');
  var editNote   = document.getElementById('pdf-edit-note');

  // Lightbox
  var lightbox   = document.getElementById('cert-lightbox');
  var lbBackdrop = document.getElementById('lightbox-backdrop');
  var lbClose    = document.getElementById('lightbox-close');
  var lbTitle    = document.getElementById('lightbox-title');
  var lbCanvas   = document.getElementById('cert-canvas');
  var lbLoading  = document.getElementById('lightbox-loading');

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch(e) { return []; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(certs)); }
    catch(e) { alert('Storage full! Please delete an older certificate.'); }
  }

  // ---- Drop Zone ----
  dropZone.addEventListener('click', function(){ fileInput.click(); });
  dropZone.addEventListener('dragover', function(e){ e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', function(){ dropZone.classList.remove('drag-over'); });
  dropZone.addEventListener('drop', function(e){
    e.preventDefault(); dropZone.classList.remove('drag-over');
    if(e.dataTransfer.files[0]) readPDF(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', function(){
    if(fileInput.files[0]) readPDF(fileInput.files[0]);
  });
  pdfRemove.addEventListener('click', function(e){ e.stopPropagation(); clearPDF(); });

  function readPDF(file) {
    if(file.type !== 'application/pdf'){ err('Only PDF files are allowed!'); return; }
    if(file.size > 10*1024*1024){ err('PDF file exceeds 10MB limit!'); return; }
    err('');
    var r = new FileReader();
    r.onload = function(e){
      pendingB64  = e.target.result;
      pendingName = file.name;
      dropZone.style.display = 'none';
      pdfSel.style.display   = 'flex';
      pdfSelName.textContent = file.name;
      editNote.style.display = 'none';
    };
    r.readAsDataURL(file);
  }

  function clearPDF(){
    pendingB64 = null; pendingName = null; fileInput.value = '';
    pdfSel.style.display   = 'none';
    dropZone.style.display = 'block';
    if(editingId) editNote.style.display = 'block';
  }

  // ---- Render PDF page to canvas (returns dataURL) ----
  function renderPage(dataUrl, scale, cb) {
    if(typeof pdfjsLib === 'undefined'){ cb(null); return; }
    pdfjsLib.getDocument(dataUrl).promise.then(function(pdf){
      pdf.getPage(1).then(function(page){
        var vp = page.getViewport({ scale: scale });
        var canvas = document.createElement('canvas');
        canvas.width  = vp.width;
        canvas.height = vp.height;
        page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise.then(function(){
          cb(canvas.toDataURL('image/jpeg', 0.82));
        });
      });
    }).catch(function(){ cb(null); });
  }

  // ---- Render ----
  function render() {
    grid.innerHTML = '';
    if(certs.length === 0){ empty.classList.add('show'); return; }
    empty.classList.remove('show');
    certs.forEach(function(c){ grid.appendChild(makeCard(c)); });
  }

  function makeCard(c) {
    var div = document.createElement('div');
    div.className = 'cert-card';

    var preview = c.thumb
      ? '<img class="cert-thumb-img" src="' + c.thumb + '" alt="certificate preview" />'
      : '<div class="cert-no-thumb"><div class="big-emoji">🏆</div><span>Certificate</span></div>';

    div.innerHTML =
      '<div class="cert-card-preview" data-id="'+c.id+'" data-action="view" title="Click to view">' +
        preview +
        '<div class="cert-preview-hover"><span>👁 View</span></div>' +
      '</div>' +
      '<div class="cert-card-body">' +
        '<div class="cert-card-title">' + esc(c.title) + '</div>' +
        '<div class="cert-card-actions">' +
          '<button class="cert-action-btn view-btn"   data-id="'+c.id+'" data-action="view">👁 Open</button>' +
          '<button class="cert-action-btn edit-btn"   data-id="'+c.id+'" data-action="edit">✏️ Edit</button>' +
          '<button class="cert-action-btn delete-btn" data-id="'+c.id+'" data-action="delete">🗑️</button>' +
        '</div>' +
      '</div>';
    return div;
  }

  grid.addEventListener('click', function(e){
    var b = e.target.closest('[data-action]'); if(!b) return;
    if(b.dataset.action === 'view')   viewCert(b.dataset.id);
    if(b.dataset.action === 'edit')   editCert(b.dataset.id);
    if(b.dataset.action === 'delete') delCert(b.dataset.id);
  });

  // ---- Open Lightbox ----
  function viewCert(id){
    var c = certs.find(function(x){ return x.id === id; });
    if(!c || !c.pdf){ alert('PDF not found.'); return; }

    lbTitle.textContent = c.title;
    lbCanvas.style.display  = 'none';
    lbLoading.style.display = 'flex';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Render at high resolution for display
    var scale = Math.min(window.innerWidth / 600, window.innerHeight / 500, 2.2);
    renderPage(c.pdf, scale, function(dataUrl){
      lbLoading.style.display = 'none';
      if(dataUrl){
        var img = new Image();
        img.src = dataUrl;
        img.onload = function(){
          var ctx = lbCanvas.getContext('2d');
          lbCanvas.width  = img.width;
          lbCanvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          lbCanvas.style.display = 'block';
        };
      } else {
        // Fallback: no pdf.js, show message
        lbLoading.innerHTML = '<span style="color:var(--text-secondary)">Could not render PDF preview.</span>';
        lbLoading.style.display = 'flex';
      }
    });
  }

  lbClose.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeLightbox(); });

  function closeLightbox(){
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    var ctx = lbCanvas.getContext('2d');
    ctx.clearRect(0, 0, lbCanvas.width, lbCanvas.height);
  }

  // ---- Edit ----
  function editCert(id){
    var c = certs.find(function(x){ return x.id === id; });
    if(!c) return;
    editingId = id; pendingB64 = null; pendingName = null;
    modalTitle.textContent = 'Edit Certificate';
    fTitle.value = c.title;
    dropZone.style.display = 'block';
    pdfSel.style.display   = 'none';
    editNote.style.display = c.pdf ? 'block' : 'none';
    fileInput.value = ''; err(''); openModal();
  }

  // ---- Delete ----
  function delCert(id){
    if(!confirm('Are you sure you want to delete this certificate?')) return;
    certs = certs.filter(function(x){ return x.id !== id; });
    save(); render();
  }

  // ---- Add/Edit Modal ----
  openBtn.addEventListener('click', function(){
    editingId = null; pendingB64 = null; pendingName = null;
    modalTitle.textContent = 'Add Certificate';
    form.reset();
    dropZone.style.display = 'block';
    pdfSel.style.display   = 'none';
    editNote.style.display = 'none';
    fileInput.value = ''; err(''); openModal();
  });
  closeBtn.addEventListener('click',  closeModal);
  cancelBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeModal(); });
  function openModal(){  overlay.classList.add('open');    document.body.style.overflow = 'hidden'; }
  function closeModal(){ overlay.classList.remove('open'); document.body.style.overflow = ''; }

  // ---- Save ----
  form.addEventListener('submit', function(e){
    e.preventDefault(); err('');
    if(!fTitle.value.trim()){ err('Please enter the certificate title!'); return; }
    if(!editingId && !pendingB64){ err('Please select a PDF file!'); return; }

    saveTxt.textContent = 'Saving...';
    var old        = editingId ? certs.find(function(x){ return x.id === editingId; }) : null;
    var finalPdf   = pendingB64 || (old ? old.pdf   : null);
    var finalThumb = old ? old.thumb : null;

    function finish(thumb){
      var obj = {
        id:    editingId || ('cert_' + Date.now()),
        title: fTitle.value.trim(),
        pdf:   finalPdf,
        thumb: thumb || finalThumb
      };
      if(editingId){
        var i = certs.findIndex(function(x){ return x.id === editingId; });
        if(i !== -1) certs[i] = obj;
      } else {
        certs.unshift(obj);
      }
      save(); closeModal(); render();
      saveTxt.textContent = 'Save Certificate';
    }

    // Generate small thumbnail for card
    if(pendingB64 && typeof pdfjsLib !== 'undefined'){
      renderPage(pendingB64, 0.8, finish);
    } else {
      finish(null);
    }
  });

  function err(msg){ errEl.textContent = msg; }
  function esc(s){
    return String(s||'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  render();
});
