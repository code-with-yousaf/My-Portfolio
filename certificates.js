document.addEventListener('DOMContentLoaded', function () {

  var STORAGE_KEY = 'myk_certs_v4';
  var certs        = load();
  var editingId    = null;
  var pendingB64   = null;
  var pendingName  = null;

  // Elements
  var grid        = document.getElementById('cert-grid');
  var empty       = document.getElementById('cert-empty');
  var overlay     = document.getElementById('modal-overlay');
  var modalTitle  = document.getElementById('modal-title');
  var form        = document.getElementById('cert-form');
  var openBtn     = document.getElementById('open-modal-btn');
  var closeBtn    = document.getElementById('modal-close');
  var cancelBtn   = document.getElementById('cancel-btn');
  var saveTxt     = document.getElementById('save-btn-text');
  var errEl       = document.getElementById('form-error');
  var fTitle      = document.getElementById('cert-title');
  var dropZone    = document.getElementById('pdf-drop-zone');
  var fileInput   = document.getElementById('cert-pdf');
  var pdfSelected = document.getElementById('pdf-selected');
  var pdfSelName  = document.getElementById('pdf-sel-name');
  var pdfRemove   = document.getElementById('pdf-remove');
  var editNote    = document.getElementById('pdf-edit-note');
  var viewOverlay = document.getElementById('view-overlay');
  var viewClose   = document.getElementById('view-close');
  var pdfIframe   = document.getElementById('pdf-iframe');
  var pdfTitle    = document.getElementById('pdf-view-title');
  var dlBtn       = document.getElementById('pdf-download-btn');

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
  dropZone.addEventListener('drop', function(e){ e.preventDefault(); dropZone.classList.remove('drag-over'); if(e.dataTransfer.files[0]) readPDF(e.dataTransfer.files[0]); });
  fileInput.addEventListener('change', function(){ if(fileInput.files[0]) readPDF(fileInput.files[0]); });
  pdfRemove.addEventListener('click', function(e){ e.stopPropagation(); clearPDF(); });

  function readPDF(file) {
    if(file.type !== 'application/pdf'){ err('Only PDF files are allowed!'); return; }
    if(file.size > 10*1024*1024){ err('PDF file exceeds 10MB limit!'); return; }
    err('');
    var r = new FileReader();
    r.onload = function(e){
      pendingB64  = e.target.result;
      pendingName = file.name;
      dropZone.style.display    = 'none';
      pdfSelected.style.display = 'flex';
      pdfSelName.textContent    = file.name;
      editNote.style.display    = 'none';
    };
    r.readAsDataURL(file);
  }
  function clearPDF(){
    pendingB64 = null; pendingName = null; fileInput.value = '';
    pdfSelected.style.display = 'none';
    dropZone.style.display    = 'block';
    if(editingId) editNote.style.display = 'block';
  }

  // ---- Generate thumbnail ----
  function genThumb(dataUrl, cb) {
    if(typeof pdfjsLib === 'undefined'){ cb(null); return; }
    pdfjsLib.getDocument(dataUrl).promise.then(function(pdf){
      pdf.getPage(1).then(function(page){
        var vp = page.getViewport({scale:1.5});
        var c  = document.createElement('canvas');
        c.width = vp.width; c.height = vp.height;
        page.render({canvasContext:c.getContext('2d'), viewport:vp}).promise.then(function(){
          cb(c.toDataURL('image/jpeg', 0.75));
        });
      });
    }).catch(function(){ cb(null); });
  }

  // ---- Render ----
  function render() {
    grid.innerHTML = '';
    if(certs.length === 0){
      empty.classList.add('show'); return;
    }
    empty.classList.remove('show');
    certs.forEach(function(c){ grid.appendChild(makeCard(c)); });
  }

  function makeCard(c) {
    var div = document.createElement('div');
    div.className = 'cert-card';
    var preview = c.thumb
      ? '<img class="cert-thumb-img" src="'+c.thumb+'" alt="preview" />'
      : '<div class="cert-no-thumb"><div class="big-emoji">📄</div><span>PDF Certificate</span></div>';
    div.innerHTML =
      '<div class="cert-card-preview" data-id="'+c.id+'" data-action="view">' +
        preview +
        '<div class="cert-preview-hover"><span>👁 View PDF</span></div>' +
      '</div>' +
      '<div class="cert-card-body">' +
        '<div class="cert-card-title">'+esc(c.title)+'</div>' +
        '<div class="cert-card-actions">' +
          '<button class="cert-action-btn view-btn"    data-id="'+c.id+'" data-action="view">👁 View PDF</button>' +
          '<button class="cert-action-btn edit-btn"    data-id="'+c.id+'" data-action="edit">✏️ Edit</button>' +
          '<button class="cert-action-btn delete-btn"  data-id="'+c.id+'" data-action="delete">🗑️</button>' +
        '</div>' +
      '</div>';
    return div;
  }

  grid.addEventListener('click', function(e){
    var b = e.target.closest('[data-action]'); if(!b) return;
    var id=b.dataset.id, ac=b.dataset.action;
    if(ac==='view')   viewCert(id);
    if(ac==='edit')   editCert(id);
    if(ac==='delete') delCert(id);
  });

  // ---- View ----
  function viewCert(id){
    var c = certs.find(function(x){return x.id===id;});
    if(!c||!c.pdf){ alert('PDF not found.'); return; }
    pdfTitle.textContent = c.title;
    pdfIframe.src        = c.pdf;
    dlBtn.href           = c.pdf;
    dlBtn.download       = c.title+'.pdf';
    viewOverlay.classList.add('open');
    document.body.style.overflow='hidden';
  }
  viewClose.addEventListener('click', closeViewer);
  viewOverlay.addEventListener('click', function(e){ if(e.target===viewOverlay) closeViewer(); });
  function closeViewer(){ viewOverlay.classList.remove('open'); document.body.style.overflow=''; pdfIframe.src=''; }

  // ---- Edit ----
  function editCert(id){
    var c = certs.find(function(x){return x.id===id;});
    if(!c) return;
    editingId=id; pendingB64=null; pendingName=null;
    modalTitle.textContent='Edit Certificate';
    fTitle.value=c.title;
    dropZone.style.display='block'; pdfSelected.style.display='none';
    editNote.style.display=c.pdf?'block':'none';
    fileInput.value=''; err(''); open_();
  }

  // ---- Delete ----
  function delCert(id){
    if(!confirm('Are you sure you want to delete this certificate?')) return;
    certs = certs.filter(function(x){return x.id!==id;});
    save(); render();
  }

  // ---- Open / Close ----
  openBtn.addEventListener('click', function(){
    editingId=null; pendingB64=null; pendingName=null;
    modalTitle.textContent='Add Certificate';
    form.reset();
    dropZone.style.display='block'; pdfSelected.style.display='none';
    editNote.style.display='none'; fileInput.value=''; err(''); open_();
  });
  closeBtn.addEventListener('click',  close_);
  cancelBtn.addEventListener('click', close_);
  overlay.addEventListener('click', function(e){ if(e.target===overlay) close_(); });
  function open_(){ overlay.classList.add('open'); document.body.style.overflow='hidden'; }
  function close_(){ overlay.classList.remove('open'); document.body.style.overflow=''; }

  // ---- Save ----
  form.addEventListener('submit', function(e){
    e.preventDefault(); err('');
    if(!fTitle.value.trim()){ err('Please enter the certificate title!'); return; }
    if(!editingId && !pendingB64){ err('Please select a PDF file!'); return; }
    saveTxt.textContent='Saving...';

    var old = editingId ? certs.find(function(x){return x.id===editingId;}) : null;
    var finalPdf   = pendingB64  || (old?old.pdf:null);
    var finalThumb = old?old.thumb:null;

    function finish(thumb){
      var obj = {
        id:    editingId||('cert_'+Date.now()),
        title: fTitle.value.trim(),
        pdf:   finalPdf,
        thumb: thumb||finalThumb
      };
      if(editingId){
        var i=certs.findIndex(function(x){return x.id===editingId;});
        if(i!==-1) certs[i]=obj;
      } else { certs.unshift(obj); }
      save(); close_(); render();
      saveTxt.textContent='Save Certificate';
    }

    if(pendingB64 && typeof pdfjsLib!=='undefined'){
      genThumb(pendingB64, finish);
    } else { finish(null); }
  });

  function err(msg){ errEl.textContent=msg; }
  function esc(s){
    return String(s||'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  render();
});

