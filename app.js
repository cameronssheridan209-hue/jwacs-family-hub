/* Family hub frontend — standalone pages + activity sync */
(function () {
  'use strict';

  var POLL_MS = 5000;
  var activity = { version: 1, events: [], hidden: {}, done: {} };
  var pollTimer = null;
  var person = null; /* owen|yasmin|cameron|sonjia */

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /** Split prose into short chunks for bullet lists. */
  function splitChunks(text) {
    if (!text) return [];
    var s = String(text).replace(/\s+/g, ' ').trim();
    if (!s) return [];
    /* Sentence breaks, middle-dot lists; long semicolon clauses when needed. */
    var parts = [];
    var buf = '';
    var i, ch, next;
    for (i = 0; i < s.length; i++) {
      ch = s.charAt(i);
      buf += ch;
      if ((ch === '.' || ch === '!' || ch === '?') && i + 1 < s.length && s.charAt(i + 1) === ' ') {
        next = s.charAt(i + 2);
        if (next && /[A-Z0-9"'“]/.test(next)) {
          parts.push(buf.trim());
          buf = '';
          i += 1; /* skip space */
          continue;
        }
      }
    }
    if (buf.trim()) parts.push(buf.trim());
    if (parts.length <= 1 && s.indexOf(' · ') !== -1) {
      parts = s.split(/\s+·\s+/).map(function (p) { return p.trim(); }).filter(Boolean);
    }
    var out = [];
    parts.forEach(function (p) {
      if (!p) return;
      if (p.length > 140 && p.indexOf('; ') !== -1) {
        p.split(/;\s+/).forEach(function (q) {
          q = q.trim();
          if (q) out.push(q);
        });
      } else {
        out.push(p);
      }
    });
    return out.length ? out : [s];
  }

  /** <ul> of labeled and/or plain bullets. items: [{label, text}|string] */
  function bulletListHtml(items, className) {
    var lis = [];
    (items || []).forEach(function (it) {
      if (it == null) return;
      if (typeof it === 'string') {
        var t = it.trim();
        if (!t) return;
        lis.push('<li>' + escapeHtml(t) + '</li>');
        return;
      }
      var label = it.label;
      var text = (it.text == null ? '' : String(it.text)).trim();
      if (!text && !it.html) return;
      if (it.html) {
        lis.push('<li>' + (label ? '<strong>' + escapeHtml(label) + '</strong> ' : '') + it.html + '</li>');
      } else {
        lis.push('<li>' + (label ? '<strong>' + escapeHtml(label) + '</strong> ' : '') + escapeHtml(text) + '</li>');
      }
    });
    if (!lis.length) return '';
    return '<ul class="' + (className || 'card-bullets') + '">' + lis.join('') + '</ul>';
  }

  /** Gist/detail: single sentence stays plain; multi → bullets. */
  function proseAsBullets(text, className) {
    var chunks = splitChunks(text);
    if (!chunks.length) return '';
    if (chunks.length === 1) {
      return '<div class="gist-plain">' + escapeHtml(chunks[0]) + '</div>';
    }
    return bulletListHtml(chunks, className || 'card-bullets');
  }


  function parseISO(s) {
    if (!s) return null;
    var p = String(s).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function todayISO() {
    return (window.HUB && HUB.TODAY) || '2026-09-30';
  }

  function formatDue(iso) {
    if (!iso) return 'No due date';
    var d = parseISO(iso);
    return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  function daysBetween(aISO, bISO) {
    var a = parseISO(aISO);
    var b = parseISO(bISO);
    return Math.round((b - a) / 86400000);
  }

  /** Overdue banner only if due is within last 7 days of today (due >= today-7). */
  function isRecentOverdue(item) {
    if (!item.due) return false;
    if (item.submitted) {
      /* Submitted items: only flag if due within window AND still pending mark */
      var today = todayISO();
      var due = item.due;
      if (due > today) return false;
      var age = daysBetween(due, today);
      return age >= 0 && age <= (HUB.OVERDUE_WINDOW_DAYS || 7);
    }
    var today2 = todayISO();
    if (item.due > today2) return false;
    var age2 = daysBetween(item.due, today2);
    return age2 >= 0 && age2 <= (HUB.OVERDUE_WINDOW_DAYS || 7);
  }

  function isPastOutsideWindow(item) {
    if (!item.due || item.submitted) return false;
    var today = todayISO();
    if (item.due >= today) return false;
    return daysBetween(item.due, today) > (HUB.OVERDUE_WINDOW_DAYS || 7);
  }

  function isHidden(id) {
    return !!(activity.hidden && activity.hidden[id]);
  }

  function isDone(id) {
    return !!(activity.done && activity.done[id]);
  }

  /** Done, cleared, or parent-deleted → gone from task lists (feed keeps history). */
  function isOffList(id) {
    return isHidden(id) || isDone(id);
  }

  var activeTabByPerson = {};

  function tabStorageKey(who) {
    return 'family-hub-tab-' + who;
  }

  function getActiveTab(who, fallback) {
    if (activeTabByPerson[who]) return activeTabByPerson[who];
    try {
      var s = sessionStorage.getItem(tabStorageKey(who));
      if (s) return s;
    } catch (e) { /* ignore */ }
    return fallback;
  }

  function setActiveTab(who, tab) {
    activeTabByPerson[who] = tab;
    try { sessionStorage.setItem(tabStorageKey(who), tab); } catch (e) { /* ignore */ }
  }

  function tabsNavHtml(tabs, activeId) {
    var btns = tabs.map(function (t) {
      var on = t.id === activeId;
      return '<button type="button" class="hub-tab' + (on ? ' active' : '') +
        '" data-tab="' + escapeHtml(t.id) + '" role="tab" aria-selected="' +
        (on ? 'true' : 'false') + '">' + escapeHtml(t.label) +
        (t.count != null ? ' <span class="tab-count">' + t.count + '</span>' : '') +
        '</button>';
    }).join('');
    return '<nav class="hub-tabs" role="tablist" aria-label="Sections">' + btns + '</nav>';
  }

  function tabPanelHtml(id, activeId, inner) {
    return '<div class="tab-panel' + (id === activeId ? ' active' : '') +
      '" data-panel="' + escapeHtml(id) + '"' +
      (id === activeId ? '' : ' hidden') + '>' + (inner || '') + '</div>';
  }

  function bindTabs(root, who) {
    var nav = root.querySelector('.hub-tabs');
    if (!nav) return;
    nav.querySelectorAll('.hub-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-tab');
        setActiveTab(who, tab);
        nav.querySelectorAll('.hub-tab').forEach(function (b) {
          var on = b.getAttribute('data-tab') === tab;
          b.classList.toggle('active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        root.querySelectorAll('.tab-panel').forEach(function (p) {
          var on = p.getAttribute('data-panel') === tab;
          p.classList.toggle('active', on);
          if (on) p.removeAttribute('hidden');
          else p.setAttribute('hidden', '');
        });
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
      });
    });
  }

  function itemTitleLookup(id) {
    var items = (HUB.ITEMS || []).concat(HUB.PARENT_ATTENTION || []);
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) return items[i].title || id;
    }
    return id;
  }

  /* ---- API ---- */
  function fetchActivity() {
    return fetch('/api/activity', { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        activity = data || activity;
        setSync(true);
        return activity;
      })
      .catch(function (err) {
        setSync(false);
        console.warn('activity fetch failed', err);
        return activity;
      });
  }

  function postActivity(payload) {
    return fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok || !j.ok) throw new Error((j && j.error) || ('HTTP ' + r.status));
        activity = j.activity || activity;
        setSync(true);
        return j;
      });
    });
  }

  function setSync(ok) {
    var el = document.getElementById('syncStatus');
    if (!el) return;
    el.innerHTML = '<span class="sync-dot ' + (ok ? 'ok' : 'err') + '"></span>' +
      (ok ? 'Live sync' : 'Sync offline');
  }

  /* ---- Modal for clear / parent delete ---- */
  function askComment(opts) {
    return new Promise(function (resolve) {
      var requireComment = !!opts.requireComment;
      var backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.innerHTML =
        '<div class="modal" role="dialog" aria-modal="true">' +
        '<h3>' + escapeHtml(opts.title || 'Comment') + '</h3>' +
        '<p>' + escapeHtml(opts.hint || '') + '</p>' +
        '<textarea id="modalComment" placeholder="' + escapeHtml(opts.placeholder || '') + '"></textarea>' +
        '<div class="modal-error" id="modalErr"></div>' +
        '<div class="actions">' +
        '<button type="button" class="btn btn-ghost" id="modalCancel">Cancel</button>' +
        '<button type="button" class="btn ' + (opts.danger ? 'btn-danger' : '') + '" id="modalOk">' +
        escapeHtml(opts.okLabel || 'OK') + '</button>' +
        '</div></div>';
      document.body.appendChild(backdrop);
      var ta = backdrop.querySelector('#modalComment');
      var err = backdrop.querySelector('#modalErr');
      function close(val) {
        backdrop.remove();
        resolve(val);
      }
      backdrop.querySelector('#modalCancel').onclick = function () { close(null); };
      backdrop.querySelector('#modalOk').onclick = function () {
        var c = (ta.value || '').trim();
        if (requireComment && !c) {
          err.textContent = 'Please leave a short comment.';
          return;
        }
        close(c);
      };
      ta.focus();
    });
  }

  /* ---- Render helpers ---- */
  function pillsFor(item) {
    var html = '';
    if (item.sectionHint === 'results' || item.grade) {
      if (item.grade) html += '<span class="grade-badge" title="Grade">' + escapeHtml(item.grade) + '</span>';
      else html += '<span class="pill pill-grade">Marked</span>';
    }
    if (item.submitted && item.pending) {
      html += '<span class="pill pill-await">' + escapeHtml(item.pendingLabel || 'Awaiting marking') + '</span>';
      if (isRecentOverdue(item)) html += '<span class="pill pill-overdue">Portal overdue</span>';
    } else if (isRecentOverdue(item) && !item.submitted) {
      html += '<span class="pill pill-overdue">Overdue</span>';
    } else if (isPastOutsideWindow(item)) {
      html += '<span class="pill pill-open">Past due — finish when back</span>';
    } else if (item.sectionHint === 'homework') {
      html += '<span class="pill pill-hw">Homework</span>';
    } else if (item.sectionHint === 'upcoming' || (item.due && item.due > todayISO())) {
      html += '<span class="pill pill-soon">Upcoming</span>';
    }
    return html;
  }

  function dueHtml(item) {
    if (!item.due) return '<span class="due">No due date</span>';
    var label = formatDue(item.due);
    if (isRecentOverdue(item) && !item.submitted) {
      return '<span class="due overdue-text">Due ' + label + ' · overdue</span>';
    }
    if (isPastOutsideWindow(item)) {
      return '<span class="due warn-text">Was due ' + label + ' · finish when back</span>';
    }
    if (item.submitted && isRecentOverdue(item)) {
      return '<span class="due overdue-text">Due ' + label + ' · submitted (portal overdue until marked)</span>';
    }
    return '<span class="due">Due ' + label + '</span>';
  }

  function renderItemCard(item, opts) {
    opts = opts || {};
    if (isOffList(item.id)) return '';
    var done = isDone(item.id);
    var showCheck = opts.checkable !== false && item.sectionHint !== 'results';
    var showKidClear = opts.role === 'kid';
    var showParentDel = opts.role === 'parent';
    var kidTag = opts.showKid
      ? '<div class="item-meta">' + escapeHtml(item.kidLabel || item.kid) + ' · ' + escapeHtml(item.subject || '') + '</div>'
      : '<div class="item-meta">' + escapeHtml(item.subject || '') + (item.type ? ' · ' + escapeHtml(item.type) : '') + '</div>';

    var html = '<div class="item-card' + (done ? ' done' : '') + '" data-id="' + escapeHtml(item.id) + '">';
    html += '<div class="item-title">' + escapeHtml(item.title) + '</div>';
    html += kidTag;
    html += '<div class="pills">' + pillsFor(item) + '</div>';

    var bullets = [];
    if (item.due) {
      var dueLabel = formatDue(item.due);
      var dueExtra = '';
      if (isRecentOverdue(item) && !item.submitted) dueExtra = ' · overdue';
      else if (isPastOutsideWindow(item)) dueExtra = ' · finish when back';
      else if (item.submitted && isRecentOverdue(item)) dueExtra = ' · submitted (portal overdue until marked)';
      bullets.push({
        label: 'Due:',
        html: '<span class="' +
          ((isRecentOverdue(item) && !item.submitted) || (item.submitted && isRecentOverdue(item))
            ? 'due overdue-text'
            : isPastOutsideWindow(item) ? 'due warn-text' : 'due') +
          '">' + escapeHtml(dueLabel + dueExtra) + '</span>'
      });
    } else {
      bullets.push({ label: 'Due:', text: 'No due date' });
    }
    if (item.grade) {
      bullets.push({
        label: 'Grade:',
        html: '<span class="grade-badge grade-badge-inline">' + escapeHtml(item.grade) + '</span>'
      });
    }
    if (item.statusNote) {
      var notes = splitChunks(item.statusNote);
      notes.forEach(function (n, i) {
        bullets.push(i === 0 ? { label: 'Status:', text: n } : { text: n });
      });
    }
    if (item.required) {
      var reqLabel = (item.sectionHint === 'results' || item.grade)
        ? 'What we did:'
        : (item.sectionHint === 'homework' ? 'Homework:' : 'Task:');
      var reqs = splitChunks(item.required);
      reqs.forEach(function (n, i) {
        bullets.push(i === 0 ? { label: reqLabel, text: n } : { text: n });
      });
    }
    if (item.submission) {
      bullets.push({ label: 'Submission:', text: item.submission });
    }
    html += bulletListHtml(bullets);

    if (showCheck) {
      html += '<div class="check-row">' +
        '<input type="checkbox" id="chk-' + escapeHtml(item.id) + '" data-action="toggle-done" data-id="' + escapeHtml(item.id) + '"' +
        (done ? ' checked' : '') + '>' +
        '<label for="chk-' + escapeHtml(item.id) + '">' + (done ? 'Done' : 'Mark done') + '</label>' +
        '</div>';
    }
    html += '<div class="actions">';
    if (showKidClear) {
      html += '<button type="button" class="btn btn-ghost btn-sm" data-action="clear" data-id="' + escapeHtml(item.id) + '">Clear from my list</button>';
    }
    if (showParentDel) {
      html += '<button type="button" class="btn btn-ghost btn-sm" data-action="parent-delete" data-id="' + escapeHtml(item.id) + '">Remove for everyone</button>';
    }
    html += '</div></div>';
    return html;
  }

  function bucketKidItem(item) {
    if (item.sectionHint === 'results') return 'results';
    if (item.submitted && item.pending) return 'awaiting';
    if (isRecentOverdue(item) && !item.submitted) return 'overdue';
    if (isPastOutsideWindow(item) || item.sectionHint === 'still_open') return 'still_open';
    if (item.sectionHint === 'homework' || !item.due) return 'homework';
    if (item.due && item.due >= todayISO()) return 'upcoming';
    return 'homework';
  }

  function renderCourses(kid) {
    var list = (HUB.COURSES && HUB.COURSES[kid]) || [];
    if (!list.length) return '<div class="empty">Course outlines will appear when a deeper Courses scrape arrives.</div>';
    var cards = list.map(function (c) {
      var bullets = [];
      var outlineParts = splitChunks(c.outline);
      outlineParts.forEach(function (p, i) {
        bullets.push(i === 0 ? { label: 'What we did:', text: p } : { text: p });
      });
      if (c.homework) {
        var hwParts = splitChunks(c.homework);
        hwParts.forEach(function (p, i) {
          bullets.push(i === 0 ? { label: 'Homework:', text: p } : { text: p });
        });
      }
      if (c.status) {
        bullets.push({ label: 'Status:', text: c.status });
      }
      /* Surface grade letters from outline/status as badge when present */
      var gradeMatch = String(c.status || c.outline || '').match(/\bgraded\s+([A-F][+-]?)\b/i)
        || String(c.outline || '').match(/\bboth graded\s+([A-F][+-]?)\b/i);
      var gradeHtml = '';
      if (gradeMatch) {
        gradeHtml = '<div class="pills"><span class="grade-badge" title="Grade">' +
          escapeHtml(gradeMatch[1].toUpperCase()) + '</span></div>';
      }
      return '<div class="course-card" id="' + escapeHtml(c.id) + '">' +
        '<div class="subj"><span>' + escapeHtml(c.emoji || '') + '</span> ' + escapeHtml(c.subject) + '</div>' +
        gradeHtml +
        bulletListHtml(bullets) +
        '</div>';
    }).join('');
    return '<div class="course-grid">' + cards + '</div>';
  }

  function section(title, inner, count) {
    if (!inner) return '';
    return '<div class="section"><h2>' + escapeHtml(title) +
      (count != null ? ' <span class="count">' + count + '</span>' : '') +
      '</h2>' + inner + '</div>';
  }

  /* ---- Kid page ---- */
  function renderKid(kid) {
    person = kid;
    var items = (HUB.ITEMS || []).filter(function (it) {
      return it.kid === kid && !isOffList(it.id);
    });
    var buckets = { overdue: [], still_open: [], awaiting: [], homework: [], upcoming: [], results: [] };
    items.forEach(function (it) {
      var b = bucketKidItem(it);
      if (!buckets[b]) buckets[b] = [];
      buckets[b].push(it);
    });
    function sortDue(a, b) {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due < b.due ? -1 : a.due > b.due ? 1 : 0;
    }
    Object.keys(buckets).forEach(function (k) { buckets[k].sort(sortDue); });

    function cards(arr) {
      if (!arr.length) return '';
      return '<div class="item-grid">' + arr.map(function (it) {
        return renderItemCard(it, { role: 'kid', showKid: false });
      }).join('') + '</div>';
    }

    var dueHtmlInner = '';
    if (buckets.overdue.length) {
      dueHtmlInner += section('Overdue (last 7 days)', cards(buckets.overdue), buckets.overdue.length);
    }
    if (buckets.still_open.length) {
      dueHtmlInner += section('Still open / needs finish', cards(buckets.still_open), buckets.still_open.length);
    }
    if (buckets.awaiting.length) {
      dueHtmlInner += section('Submitted / awaiting mark', cards(buckets.awaiting), buckets.awaiting.length);
    }
    dueHtmlInner += section('Homework',
      buckets.homework.length ? cards(buckets.homework) : '<div class="empty">None separately labelled in SEQTA.</div>',
      buckets.homework.length);
    if (buckets.upcoming.length) {
      dueHtmlInner += section('Assignments due soon', cards(buckets.upcoming), buckets.upcoming.length);
    }
    if (buckets.results.length) {
      dueHtmlInner += section('Recent results', cards(buckets.results), buckets.results.length);
    }
    if (!dueHtmlInner) dueHtmlInner = '<div class="empty">Nothing open on your list.</div>';

    var kidDates = upcomingSchoolDates(function (d) {
      return d.kidAction && (d.kids === kid || d.kids === 'both');
    });
    var dueCount = buckets.overdue.length + buckets.still_open.length + buckets.awaiting.length +
      buckets.homework.length + buckets.upcoming.length;
    var tabs = [
      { id: 'courses', label: 'Courses' },
      { id: 'due', label: 'Due', count: dueCount },
      { id: 'dates', label: 'My dates', count: kidDates.length }
    ];
    var active = getActiveTab(kid, 'courses');
    if (!tabs.some(function (t) { return t.id === active; })) active = 'courses';

    var root = document.getElementById('content');
    var html = tabsNavHtml(tabs, active);
    html += tabPanelHtml('courses', active, section('My courses', renderCourses(kid)));
    html += tabPanelHtml('due', active, dueHtmlInner);
    html += tabPanelHtml('dates', active,
      section('My key dates', kidDates.length ? dateCardsHtml(kidDates) : '<div class="empty">No key dates right now.</div>', kidDates.length));

    root.innerHTML = html;
    bindTabs(root, kid);
    bindActions(root);
  }

  /* ---- Parent page ---- */
  function renderKidsUpdates() {
    var events = (activity.events || []).slice().reverse();
    var interesting = events.filter(function (e) {
      return e.type === 'done' || e.type === 'clear' || e.type === 'parent_delete' || e.type === 'undone';
    }).slice(0, 40);
    if (!interesting.length) {
      return '<div class="empty">No kid updates yet. When Owen or Yasmin tick done or clear an item (with a comment), it shows up here.</div>';
    }
    return interesting.map(function (e) {
      var label = e.type === 'done' ? 'marked done'
        : e.type === 'undone' ? 'unmarked'
        : e.type === 'clear' ? 'cleared from their list'
        : 'removed for everyone';
      var when = e.at || '';
      try {
        var d = new Date(e.at);
        if (!isNaN(d.getTime())) {
          when = d.toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        }
      } catch (err) { /* keep raw */ }
      return '<div class="update-card">' +
        '<div class="meta">' + escapeHtml((e.by || '').toUpperCase()) + ' · ' + escapeHtml(label) + ' · ' + escapeHtml(when) + '</div>' +
        '<div class="body"><strong>' + escapeHtml(itemTitleLookup(e.itemId)) + '</strong>' +
        (e.comment ? '<br>' + escapeHtml(e.comment) : '') +
        '</div></div>';
    }).join('');
  }

  function renderDireqt(who) {
    var msgs;
    if (who === 'cameron' && HUB.DIREQT_CAMERON) msgs = HUB.DIREQT_CAMERON;
    else if (who === 'sonjia' && HUB.DIREQT_SONJIA) msgs = HUB.DIREQT_SONJIA;
    else msgs = HUB.DIREQT || [];
    if (!msgs.length) return '<div class="empty">No recent Direqt messages.</div>';
    var cards = msgs.map(function (m) {
      return '<div class="msg-card">' +
        '<div class="from"><strong>' + escapeHtml(m.sender) + '</strong></div>' +
        '<div class="when">' + escapeHtml(formatDue(m.date)) + (m.time ? ' · ' + escapeHtml(m.time) : '') + '</div>' +
        '<div class="subj-line"><strong>' + escapeHtml(m.subject) + '</strong></div>' +
        '<div class="gist">' + proseAsBullets(m.gist) + '</div>' +
        '</div>';
    }).join('');
    return '<div class="msg-grid">' + cards + '</div>';
  }

  function upcomingSchoolDates(filterFn) {
    var today = todayISO();
    return (HUB.SCHOOL_DATES || []).slice().filter(function (d) {
      var live = !d.date || d.date >= today || (d.end && d.end >= today);
      return live && (!filterFn || filterFn(d));
    }).sort(function (a, b) {
      if (!a.date) return 1;
      if (!b.date) return -1;
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return (a.time || '') < (b.time || '') ? -1 : (a.time || '') > (b.time || '') ? 1 : 0;
    });
  }

  function dateCardsHtml(dates) {
    if (!dates.length) return '<div class="empty">No upcoming school dates.</div>';
    var cards = dates.map(function (d) {
      var when = d.date ? formatDue(d.date) : 'Ongoing';
      if (d.end) when += ' → ' + formatDue(d.end);
      if (d.time) when += ' · ' + d.time;
      var bullets = [{ label: 'When:', text: when }];
      var detailParts = splitChunks(d.detail || '');
      detailParts.forEach(function (p, i) {
        bullets.push(i === 0 ? { label: 'Details:', text: p } : { text: p });
      });
      if (d.kids && d.kids !== 'both') {
        bullets.push({ label: 'Who:', text: d.kids });
      }
      return '<div class="date-card">' +
        '<div class="item-title"><strong>' + escapeHtml(d.title) + '</strong></div>' +
        bulletListHtml(bullets) +
        '</div>';
    }).join('');
    return '<div class="dates-grid">' + cards + '</div>';
  }

  /* Full calendar for parents — never truncate. */
  function renderDates() {
    return dateCardsHtml(upcomingSchoolDates(null));
  }

  /* Kid pages: only kidAction dates for that child (or both). */
  function renderKidActionDates(kid) {
    return dateCardsHtml(upcomingSchoolDates(function (d) {
      if (!d.kidAction) return false;
      return d.kids === kid || d.kids === 'both';
    }));
  }

  function renderParent(who) {
    person = who;
    var root = document.getElementById('content');
    var items = (HUB.ITEMS || []).filter(function (it) { return !isOffList(it.id); });
    var attention = (HUB.PARENT_ATTENTION || []).filter(function (it) { return !isHidden(it.id); });

    var owenItems = items.filter(function (i) { return i.kid === 'owen'; });
    var yasItems = items.filter(function (i) { return i.kid === 'yasmin'; });

    function group(list) {
      var overdue = [], still = [], awaitM = [], hw = [], up = [], results = [];
      list.forEach(function (it) {
        var b = bucketKidItem(it);
        if (b === 'overdue') overdue.push(it);
        else if (b === 'still_open') still.push(it);
        else if (b === 'awaiting') awaitM.push(it);
        else if (b === 'homework') hw.push(it);
        else if (b === 'upcoming') up.push(it);
        else if (b === 'results') results.push(it);
      });
      return { overdue: overdue, still: still, awaitM: awaitM, hw: hw, up: up, results: results };
    }

    var o = group(owenItems);
    var y = group(yasItems);

    function cards(arr) {
      if (!arr.length) return '';
      return '<div class="item-grid">' + arr.map(function (it) {
        return renderItemCard(it, { role: 'parent', showKid: true, checkable: true });
      }).join('') + '</div>';
    }

    var owenWork = o.overdue.concat(o.still, o.awaitM, o.hw, o.up);
    var yasWork = y.overdue.concat(y.still, y.awaitM, y.hw, y.up);
    var dueCount = owenWork.length + yasWork.length;

    var attentionHtml = '<div class="section"><h2>Parent attention <span class="count">' + attention.length + '</span></h2>';
    if (!attention.length) attentionHtml += '<div class="empty">Nothing flagged.</div>';
    else {
      attentionHtml += '<div class="attention-grid">' + attention.map(function (a) {
        var bullets = [];
        if (a.due) bullets.push({ label: 'Due:', text: formatDue(a.due) });
        var detailParts = splitChunks(a.detail || '');
        detailParts.forEach(function (p, i) {
          bullets.push(i === 0 ? { label: 'Details:', text: p } : { text: p });
        });
        return '<div class="attention-card' + (a.urgent ? ' urgent' : '') + '" data-id="' + escapeHtml(a.id) + '">' +
          '<div class="who">' + escapeHtml(a.kidLabel) + '</div>' +
          '<div class="item-title"><strong>' + escapeHtml(a.title) + '</strong></div>' +
          bulletListHtml(bullets) +
          '<div class="actions"><button type="button" class="btn btn-ghost btn-sm" data-action="parent-delete" data-id="' + escapeHtml(a.id) + '">Remove for everyone</button></div>' +
          '</div>';
      }).join('') + '</div>';
    }
    attentionHtml += '</div>';

    var overviewExtra = '<div class="section"><h2>Open work snapshot</h2>' +
      '<ul class="card-bullets">' +
      '<li><strong>Owen:</strong> ' + owenWork.length + ' open item' + (owenWork.length === 1 ? '' : 's') +
      (o.overdue.length ? ' · ' + o.overdue.length + ' overdue' : '') + '</li>' +
      '<li><strong>Yasmin:</strong> ' + yasWork.length + ' open item' + (yasWork.length === 1 ? '' : 's') +
      (y.overdue.length ? ' · ' + y.overdue.length + ' overdue' : '') + '</li>' +
      '<li>Use the <strong>Due</strong> tab for full lists. Done / cleared items leave the lists and show under Kids updates.</li>' +
      '</ul></div>';

    var coursesHtml = '<div class="parent-kids-grid">' +
      '<div class="kid-col"><div class="section"><h2>Owen · courses</h2>' + renderCourses('owen') + '</div></div>' +
      '<div class="kid-col"><div class="section"><h2>Yasmin · courses</h2>' + renderCourses('yasmin') + '</div></div>' +
      '</div>';

    var dueHtmlInner = '<div class="parent-kids-grid">' +
      '<div class="kid-col">' + section('Owen · homework & due',
        owenWork.length ? cards(owenWork) : '<div class="empty">All clear for holiday break.</div>', owenWork.length) + '</div>' +
      '<div class="kid-col">' + section('Yasmin · homework & due',
        yasWork.length ? cards(yasWork) : '<div class="empty">Nothing open.</div>', yasWork.length) + '</div>' +
      '</div>';

    var direqtMsgs = (who === 'cameron' && HUB.DIREQT_CAMERON)
      ? HUB.DIREQT_CAMERON
      : (who === 'sonjia' && HUB.DIREQT_SONJIA)
        ? HUB.DIREQT_SONJIA
        : (HUB.DIREQT || []);
    var allDates = upcomingSchoolDates(null);

    var tabs = [
      { id: 'overview', label: 'Overview', count: attention.length },
      { id: 'courses', label: 'Courses' },
      { id: 'due', label: 'Due', count: dueCount },
      { id: 'direqt', label: 'Direqt', count: direqtMsgs.length },
      { id: 'dates', label: 'Dates', count: allDates.length },
      { id: 'updates', label: 'Kids updates' }
    ];
    var active = getActiveTab(who, 'overview');
    if (!tabs.some(function (t) { return t.id === active; })) active = 'overview';

    var html = tabsNavHtml(tabs, active);
    html += tabPanelHtml('overview', active, attentionHtml + overviewExtra);
    html += tabPanelHtml('courses', active, coursesHtml);
    html += tabPanelHtml('due', active, dueHtmlInner);
    html += tabPanelHtml('direqt', active, section('Direqt / SEQTA messages', renderDireqt(who), direqtMsgs.length));
    html += tabPanelHtml('dates', active, section('School dates (soonest first)', dateCardsHtml(allDates), allDates.length));
    html += tabPanelHtml('updates', active, section("Kids' updates", renderKidsUpdates()));

    root.innerHTML = html;
    bindTabs(root, who);
    bindActions(root);
  }

  function bindActions(root) {
    root.querySelectorAll('[data-action="toggle-done"]').forEach(function (el) {
      el.addEventListener('change', function () {
        var id = el.getAttribute('data-id');
        var typ = el.checked ? 'done' : 'undone';
        postActivity({ type: typ, itemId: id, by: person, comment: '' })
          .then(function () { refresh(); })
          .catch(function (err) {
            alert('Could not save: ' + err.message);
            el.checked = !el.checked;
          });
      });
    });
    root.querySelectorAll('[data-action="clear"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        askComment({
          title: 'Clear from your list',
          hint: 'Leave a short comment so Mum and Dad can see why you cleared it.',
          placeholder: 'e.g. Already handed in at school',
          okLabel: 'Clear item',
          requireComment: true,
          danger: true
        }).then(function (comment) {
          if (comment == null) return;
          return postActivity({ type: 'clear', itemId: id, by: person, comment: comment })
            .then(function () { refresh(); });
        }).catch(function (err) { alert('Could not clear: ' + err.message); });
      });
    });
    root.querySelectorAll('[data-action="parent-delete"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        askComment({
          title: 'Remove for everyone',
          hint: 'Optional comment (shown in Kids\' updates). This hides the item on all family pages.',
          placeholder: 'Optional note…',
          okLabel: 'Remove',
          requireComment: false,
          danger: true
        }).then(function (comment) {
          if (comment == null) return;
          return postActivity({ type: 'parent_delete', itemId: id, by: person, comment: comment || '' })
            .then(function () { refresh(); });
        }).catch(function (err) { alert('Could not remove: ' + err.message); });
      });
    });
  }

  function refresh() {
    if (person === 'owen' || person === 'yasmin') renderKid(person);
    else if (person === 'cameron' || person === 'sonjia') renderParent(person);
  }

  function start(who, kind) {
    person = who;
    /* Paint immediately so a slow/blocked /api/activity never leaves "Loading…". */
    try {
      if (kind === 'kid') renderKid(who);
      else renderParent(who);
    } catch (err) {
      var root = document.getElementById('content');
      if (root) {
        root.innerHTML = '<div class="empty">Could not render: ' + escapeHtml(err && err.message ? err.message : String(err)) + '</div>';
      }
      console.error(err);
    }
    fetchActivity().then(function () { refresh(); });
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function () {
      fetchActivity().then(function () { refresh(); });
    }, POLL_MS);
  }

  window.HubApp = { startKid: function (k) { start(k, 'kid'); }, startParent: function (p) { start(p, 'parent'); } };
})();
