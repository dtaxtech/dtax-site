/* DTAX – oldal és szervezeti felmérés. Nincs külső függőség, nincs hálózati hívás. */
(function () {
  'use strict';

  // ---- Beállítás ---------------------------------------------------------
  // A DTAX kapcsolati e-mail címe. Ha üres, az eredményoldalon nem jelenik meg
  // az „E-mail küldése" gomb; a másolás és a letöltés ettől még működik.
  var CONTACT_EMAIL = 'megkereses@dtax.hu';

  // ---- Mobilmenü és évszám -------------------------------------------------
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  var yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());

  // ---- Felmérés: tartalom --------------------------------------------------
  var FILTERS = [
    { id: 'service', label: 'Milyen jellegű a tevékenységetek?', options: [
      ['igen', 'Szolgáltatást nyújtunk'],
      ['reszben', 'Részben szolgáltatás, részben termék'],
      ['nem', 'Főleg termék, gyártás vagy kereskedelem']
    ] },
    { id: 'size', label: 'Hány főt foglalkoztattok?', options: [
      ['1-4', '1–4'], ['5-20', '5–20'], ['21-80', '21–80'], ['80+', '80 fölött']
    ] },
    { id: 'role', label: 'Mi a szereped?', options: [
      ['vezeto', 'Tulajdonos vagy vezető'], ['kozepvezeto', 'Középvezető'], ['egyeb', 'Egyéb']
    ] },
    { id: 'growth', label: 'Nőtt-e a cég az elmúlt évben?', options: [
      ['no', 'Igen, nő'], ['stagnal', 'Stagnál'], ['csokken', 'Csökken']
    ] }
  ];

  var AREAS = {
    ugyfel: 'Ügyfélélmény',
    mukodes: 'Működés',
    novekedes: 'Növekedés és változás'
  };

  var STATEMENTS = [
    { id: 's1', area: 'ugyfel', text: 'Tudjuk, hogy az ügyfeleink az utunk mely pontjain akadnak el.' },
    { id: 's2', area: 'ugyfel', text: 'Az ügyfélpanaszok és az ismétlődő problémák okát vissza tudjuk vezetni belső folyamatokra.' },
    { id: 's3', area: 'mukodes', text: 'Minden fontos folyamatnak van gazdája, és a csapat tudja a lépéseit.' },
    { id: 's4', area: 'mukodes', text: 'A működés nem egy-két kulcsember fejétől függ.' },
    { id: 's5', area: 'ugyfel', text: 'Mérjük az ügyfélélményt és a szolgáltatás minőségét, nem csak a bevételt.' },
    { id: 's6', area: 'mukodes', text: 'A csúszások és félreértések ritkák, ha pedig előfordulnak, tanulunk belőlük.' },
    { id: 's7', area: 'novekedes', text: 'Ahogy növekszünk, a folyamataink is velünk együtt fejlődnek, nem foltozgatjuk őket menet közben.' },
    { id: 's8', area: 'novekedes', text: 'A csapat nyitott a változásokra, és jut idő a bevezetésükre.' }
  ];

  var OPEN_QUESTIONS = [
    { id: 'o1', label: 'Mi viszi el most a legtöbb időt?' },
    { id: 'o2', label: 'Mi változna, ha ez rendben lenne?' },
    { id: 'o3', label: 'Mi történt mostanában, ami miatt ez fontossá vált?' }
  ];

  var ENTRIES = {
    ugyfel: {
      code: 'A',
      title: 'Ügyfélélményből induló szolgáltatásfejlesztés',
      text: 'Szeretnétek javítani az ügyfélélményt, de nem látjátok, hogyan kellene ehhez átalakítani a belső működést. Érdemes az ügyfélút feltárásával kezdeni: megnézzük, hol akad el az ügyfél, és milyen belső okok állnak ennek a hátterében.'
    },
    mukodes: {
      code: 'B',
      title: 'Működési problémából induló szolgáltatásfejlesztés',
      text: 'Csúszások, félreértések és koordinációs gondok vannak, amelyeket az ügyfelek is megéreznek. Az ügyfélút segít megtalálni a valódi okokat, a folyamatok rendbetétele pedig csökkenti őket.'
    },
    novekedes: {
      code: 'C',
      title: 'Növekedésből induló szervezetfejlesztés',
      text: 'Nőttetek, és meg szeretnétek őrizni a jó ügyfélélményt anélkül, hogy a működés egyre bonyolultabb és személyfüggőbb lenne. A cél az, hogy a folyamatok és a szerepek időben rendeződjenek, mielőtt a növekedés szétfeszítené a működést.'
    }
  };

  // Döntetlennél ez a sorrend: Működés, Ügyfélélmény, Növekedés.
  var TIE_ORDER = ['mukodes', 'ugyfel', 'novekedes'];

  // ---- Felmérés: űrlap felépítése ------------------------------------------
  var form = document.getElementById('assessment');
  var fields = document.getElementById('assessment-fields');
  var errorBox = document.getElementById('form-error');
  var resultBox = document.getElementById('result');
  if (!form || !fields || !resultBox) return;

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  }

  function radioOption(name, value, label, required) {
    var input = el('input', { type: 'radio', name: name, value: value });
    if (required) input.required = true;
    return el('label', { class: 'opt' }, [input, el('span', { text: label })]);
  }

  function buildForm() {
    fields.textContent = '';

    var f1 = el('fieldset');
    f1.appendChild(el('span', { class: 'fs-title', text: '1. A szervezetről' }));
    FILTERS.forEach(function (q) {
      var fs = el('fieldset', { class: 'q', 'data-q': q.id });
      fs.appendChild(el('legend', { text: q.label }));
      var opts = el('div', { class: 'opts' });
      q.options.forEach(function (o, i) { opts.appendChild(radioOption(q.id, o[0], o[1], i === 0)); });
      fs.appendChild(opts);
      f1.appendChild(fs);
    });
    fields.appendChild(f1);

    var f2 = el('fieldset');
    f2.appendChild(el('span', { class: 'fs-title', text: '2. Mennyire igaz ez rátok?' }));
    f2.appendChild(el('p', { class: 'section-lead', text: '1 = egyáltalán nem igaz, 4 = teljesen igaz.' }));
    STATEMENTS.forEach(function (s, idx) {
      var fs = el('fieldset', { class: 'q scale', 'data-q': s.id });
      fs.appendChild(el('legend', { text: (idx + 1) + '. ' + s.text }));
      var opts = el('div', { class: 'opts' });
      for (var v = 1; v <= 4; v++) opts.appendChild(radioOption(s.id, String(v), String(v), v === 1));
      fs.appendChild(opts);
      fs.appendChild(el('div', { class: 'scale-key', 'aria-hidden': 'true' }, [
        el('span', { text: 'egyáltalán nem' }), el('span', { text: 'teljesen igaz' })
      ]));
      f2.appendChild(fs);
    });
    fields.appendChild(f2);

    var f3 = el('fieldset');
    f3.appendChild(el('span', { class: 'fs-title', text: '3. Saját szavaitokkal (nem kötelező)' }));
    OPEN_QUESTIONS.forEach(function (q) {
      var wrap = el('div', { class: 'q' });
      wrap.appendChild(el('label', { class: 'q-label', for: q.id, text: q.label }));
      wrap.appendChild(el('textarea', { id: q.id, name: q.id, maxlength: '600', rows: '3' }));
      f3.appendChild(wrap);
    });
    fields.appendChild(f3);
  }

  function checkedValue(name) {
    var c = form.querySelector('input[name="' + name + '"]:checked');
    return c ? c.value : null;
  }

  function label(list, id, value) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        for (var j = 0; j < list[i].options.length; j++) {
          if (list[i].options[j][0] === value) return list[i].options[j][1];
        }
      }
    }
    return value;
  }

  // ---- Pontozás --------------------------------------------------------------
  function score(answers) {
    var sums = { ugyfel: 0, mukodes: 0, novekedes: 0 };
    var counts = { ugyfel: 0, mukodes: 0, novekedes: 0 };
    STATEMENTS.forEach(function (s) {
      sums[s.area] += Number(answers[s.id]);
      counts[s.area] += 1;
    });
    var out = {};
    Object.keys(sums).forEach(function (a) {
      var min = counts[a], max = counts[a] * 4;
      out[a] = Math.round(((sums[a] - min) / (max - min)) * 100);
    });
    return out;
  }

  function lowestArea(pct) {
    var best = null;
    TIE_ORDER.forEach(function (a) {
      if (best === null || pct[a] < pct[best]) best = a;
    });
    return best;
  }

  // ---- Összegzés szöveg -------------------------------------------------------
  function buildSummary(data, pct, low, contact) {
    var lines = [];
    lines.push('DTAX – szervezeti felmérés eredménye');
    lines.push('');
    lines.push('A szervezetről');
    FILTERS.forEach(function (q) { lines.push('- ' + q.label + ' ' + label(FILTERS, q.id, data[q.id])); });
    lines.push('');
    lines.push('Területek (0–100%)');
    Object.keys(AREAS).forEach(function (a) { lines.push('- ' + AREAS[a] + ': ' + pct[a] + '%'); });
    lines.push('Javasolt kiindulás: ' + ENTRIES[low].code + ' – ' + ENTRIES[low].title);
    lines.push('');
    lines.push('Állítások (1–4)');
    STATEMENTS.forEach(function (s, i) { lines.push((i + 1) + '. ' + s.text + ' → ' + data[s.id]); });
    var anyOpen = OPEN_QUESTIONS.some(function (q) { return data[q.id]; });
    if (anyOpen) {
      lines.push('');
      lines.push('Saját szavaikkal');
      OPEN_QUESTIONS.forEach(function (q) { if (data[q.id]) lines.push(q.label + ' ' + data[q.id]); });
    }
    if (contact) {
      lines.push('');
      lines.push('Elérhetőség / név: ' + contact);
    }
    return lines.join('\n');
  }

  // ---- Eredmény megjelenítése ---------------------------------------------------
  function renderResult(data, pct, low) {
    resultBox.textContent = '';
    resultBox.hidden = false;

    resultBox.appendChild(el('h3', { text: 'Az eredményetek' }));
    resultBox.appendChild(el('p', { text: 'Három területet vizsgáltunk. Minél alacsonyabb az érték, annál több a fejlődési lehetőség.' }));

    var bars = el('div', { class: 'bars' });
    Object.keys(AREAS).forEach(function (a) {
      var row = el('div', { class: 'bar-row' + (a === low ? ' low' : '') });
      row.appendChild(el('div', { class: 'bar-head' }, [
        el('span', { text: AREAS[a] }), el('span', { text: pct[a] + '%' })
      ]));
      var bar = el('div', { class: 'bar', role: 'img', 'aria-label': AREAS[a] + ': ' + pct[a] + '%' });
      var fill = el('i'); fill.style.width = pct[a] + '%';
      bar.appendChild(fill); row.appendChild(bar);
      bars.appendChild(row);
    });
    resultBox.appendChild(bars);

    var max = Math.max(pct.ugyfel, pct.mukodes, pct.novekedes);
    var min = Math.min(pct.ugyfel, pct.mukodes, pct.novekedes);

    if (min >= 75) {
      resultBox.appendChild(el('div', { class: 'entry' }, [
        el('p', {}, [el('strong', { text: 'Jó úton vagytok.' })]),
        el('p', { text: 'Mindhárom terület erős. Nincs sürgős teendő, de érdemes időnként újra kitölteni, főleg növekedés vagy nagyobb változás előtt.' })
      ]));
    } else {
      var e = ENTRIES[low];
      resultBox.appendChild(el('div', { class: 'entry' }, [
        el('p', {}, [el('strong', { text: 'Javasolt kiindulás: ' + e.code + ' – ' + e.title })]),
        el('p', { text: e.text })
      ]));
      if (max < 35) {
        resultBox.appendChild(el('p', { class: 'note', text: 'Mindhárom területen sok a fejlesztenivaló. Ilyenkor nem érdemes mindent egyszerre elkezdeni: a diagnosztikai csomag segít eldönteni, hol kezdjétek.' }));
      }
    }

    if (data.service !== 'igen') {
      resultBox.appendChild(el('p', { class: 'note', text: 'Megjegyzés: elsősorban szolgáltató vállalatoknak segítünk. Ha a tevékenységetek inkább termék- vagy gyártásközpontú, attól még érdemes beszélnünk, de előbb meg kell néznünk, tudunk-e valóban segíteni.' }));
    }
    if (data.size === '1-4' || data.size === '80+') {
      resultBox.appendChild(el('p', { class: 'note', text: 'Megjegyzés: a munkamódszerünk elsősorban 5–80 fős szervezetekre készült. Ha a ti méretetek ettől eltér, attól még érdemes beszélnünk, ha a helyzetetek illik valamelyik induló helyzethez.' }));
    }

    // Megosztás
    resultBox.appendChild(el('h4', { text: 'Megosztanád velünk?' }));
    resultBox.appendChild(el('p', { text: 'Az oldal semmit nem küldött el. Ha szeretnél beszélni az eredményről, elküldheted nekünk az összegzést, vagy elmentheted magadnak.' }));

    var share = el('div', { class: 'share' });
    var cLabel = el('label', { class: 'q-label', for: 'contact-field' });
    cLabel.appendChild(document.createTextNode('Név és elérhetőség, ha szeretnéd, hogy megkeressünk '));
    cLabel.appendChild(el('span', { class: 'opt-note', text: '(nem kötelező)' }));
    share.appendChild(cLabel);
    var contactInput = el('input', { type: 'text', id: 'contact-field', maxlength: '200', autocomplete: 'off' });
    share.appendChild(contactInput);

    var area = el('textarea', { id: 'summary-text', readonly: 'readonly', 'aria-label': 'Az eredmény összegzése' });
    area.style.marginTop = '14px';
    share.appendChild(area);

    function refresh() { area.value = buildSummary(data, pct, low, contactInput.value.trim()); }
    refresh();
    contactInput.addEventListener('input', refresh);

    var actions = el('div', { class: 'share-actions' });
    var copied = el('span', { class: 'copied', role: 'status' });

    var copyBtn = el('button', { type: 'button', class: 'btn btn-ink', text: 'Másolás vágólapra' });
    copyBtn.addEventListener('click', function () {
      function done(ok) { copied.textContent = ok ? 'Kimásolva.' : 'A másolás nem sikerült, jelöld ki a szöveget, és másold ki kézzel.'; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(area.value).then(function () { done(true); }, function () { fallbackCopy(); });
      } else { fallbackCopy(); }
      function fallbackCopy() {
        area.removeAttribute('readonly'); area.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        area.setAttribute('readonly', 'readonly');
        done(ok);
      }
    });
    actions.appendChild(copyBtn);

    var dlBtn = el('button', { type: 'button', class: 'btn btn-line', text: 'Letöltés szövegfájlként' });
    dlBtn.addEventListener('click', function () {
      var blob = new Blob([area.value], { type: 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = el('a', { href: url, download: 'dtax-felmeres.txt' });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
    actions.appendChild(dlBtn);

    if (CONTACT_EMAIL) {
      var mail = el('a', { class: 'btn btn-gold', text: 'E-mail küldése a DTAX-nek' });
      function setMail() {
        mail.setAttribute('href', 'mailto:' + CONTACT_EMAIL +
          '?subject=' + encodeURIComponent('DTAX felmérés eredménye') +
          '&body=' + encodeURIComponent(area.value));
      }
      setMail();
      contactInput.addEventListener('input', setMail);
      actions.appendChild(mail);
    }

    actions.appendChild(copied);
    share.appendChild(actions);
    resultBox.appendChild(share);

    resultBox.focus();
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---- Küldés és törlés -----------------------------------------------------------
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var missing = [];
    var data = {};
    FILTERS.concat(STATEMENTS).forEach(function (q) {
      var v = checkedValue(q.id);
      var box = form.querySelector('[data-q="' + q.id + '"]');
      if (v === null) { missing.push(q.id); if (box) box.classList.add('invalid'); }
      else { data[q.id] = v; if (box) box.classList.remove('invalid'); }
    });
    OPEN_QUESTIONS.forEach(function (q) {
      data[q.id] = (document.getElementById(q.id).value || '').trim();
    });

    if (missing.length) {
      errorBox.hidden = false;
      errorBox.textContent = 'Kérlek, válaszolj minden kérdésre (' + missing.length + ' hiányzik). A hiányzókat piros keret jelzi.';
      var first = form.querySelector('[data-q="' + missing[0] + '"] input');
      if (first) first.focus();
      return;
    }
    errorBox.hidden = true;
    var pct = score(data);
    renderResult(data, pct, lowestArea(pct));
  });

  form.addEventListener('change', function (e) {
    var q = e.target.closest && e.target.closest('.q');
    if (q) q.classList.remove('invalid');
  });

  form.addEventListener('reset', function () {
    resultBox.hidden = true;
    resultBox.textContent = '';
    errorBox.hidden = true;
    Array.prototype.forEach.call(form.querySelectorAll('.invalid'), function (n) { n.classList.remove('invalid'); });
  });

  buildForm();
})();
