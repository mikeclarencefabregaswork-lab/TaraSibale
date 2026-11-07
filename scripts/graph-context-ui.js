(() => {
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const groups = Object.values(TARA_CONTEXT.communities);
  const style = document.createElement('style');
  style.textContent = `
    #sidebar { width:420px; flex-shrink:0; display:block; overflow-y:auto; }
    #legend-wrap { max-height:390px; overflow:auto; }
    #info-panel { min-height:0; }
    .legend-label { white-space:normal; line-height:1.4; }
    .legend-item { align-items:center; padding:7px 0; }
    .tara-intro,.tara-context { padding:16px; border-bottom:1px solid var(--border); }
    .tara-intro h1 { font-size:19px; margin-bottom:6px; }
    .tara-intro p,.tara-context p,.tara-context li { font-size:13px; line-height:1.6; color:var(--text-3); }
    .tara-intro p { margin:6px 0 10px; }
    .tara-controls { display:flex; flex-wrap:wrap; gap:6px; margin:10px 0; }
    .tara-button { background:var(--bg); color:var(--text); border:1px solid var(--input-border); border-radius:5px; padding:7px 9px; cursor:pointer; font:inherit; font-size:12px; text-align:left; }
    .tara-button:hover,.tara-button:focus-visible { border-color:#5ba4e5; outline:2px solid transparent; background:var(--border); }
    .tara-button[aria-pressed=true] { border-color:#5ba4e5; background:#234364; color:white; }
    .tara-intro label { display:block; font-size:12px; margin:12px 0 5px; color:var(--text-2); }
    .tara-intro select { width:100%; padding:8px; color:var(--text); background:var(--bg); border:1px solid var(--input-border); border-radius:5px; }
    .tara-context h2 { font-size:17px; line-height:1.4; margin:0 0 8px; }
    .tara-context h3 { font-size:12px; text-transform:uppercase; color:var(--text-2); margin:15px 0 7px; }
    .tara-context ul { padding-left:18px; }
    .tara-entry { display:block; width:100%; margin:6px 0; }
    .tara-entry small { display:block; font-size:11px; line-height:1.5; margin-top:4px; color:var(--text-2); }
    .tara-context details { margin:12px 0; font-size:12px; line-height:1.5; }
    .tara-context summary { cursor:pointer; color:var(--text-2); }
    .tara-context code { overflow-wrap:anywhere; }
    .tara-context a,#info-content a { color:#74b5ed; }
    .tara-kicker { color:var(--text-2); font-size:11px; margin:0 0 7px; }
    .tara-node-purpose { border-left:3px solid #5ba4e5; padding:5px 9px; margin:10px 0; line-height:1.6; }
    .tara-about { padding:4px 6px; flex-shrink:0; }
    #tara-browser > summary { padding:14px; cursor:pointer; font-size:13px; border-top:1px solid var(--border); }
    #tara-mode-status,#tara-tour-status { font-size:11px; line-height:1.5; color:var(--text-2); }
    @media(max-width:720px) { #sidebar{width: min(68vw,420px)} .tara-intro,.tara-context {padding:12px} }
  `;
  document.head.appendChild(style);
  const sidebar = document.getElementById('sidebar');
  const intro = document.createElement('section');
  intro.className = 'tara-intro';
  intro.innerHTML = `<h1>TaraSibale codebase</h1>
    <p>Explore what each part does, where to start reading, and how it connects. Groups follow indexed relationships; they are not separate services.</p>
    <div class="tara-controls" role="group" aria-label="Graph view"><button class="tara-button" id="tara-app-view" type="button">Application view</button><button class="tara-button" id="tara-all-view" type="button">All communities</button></div>
    <div id="tara-mode-status" role="status"></div>
    <label for="tara-tour">Start with a question</label><select id="tara-tour"><option value="">Choose an investigation…</option>${TARA_CONTEXT.tours.map((tour, index) => `<option value="${index}">${escape(tour.name)}</option>`).join('')}</select>
    <div id="tara-tour-status"></div><div id="tara-tour-steps" class="tara-controls"></div>
    <label for="tara-group">Inspect a community</label><select id="tara-group">${groups.map((group) => `<option value="${escape(group.id)}">${escape(group.name)} (${group.count})</option>`).join('')}</select>`;
  sidebar.prepend(intro);
  const panel = document.createElement('section');
  panel.className = 'tara-context';
  panel.id = 'tara-community-context';
  panel.setAttribute('aria-live', 'polite');
  intro.after(panel);
  const browser = document.createElement('details');
  browser.id = 'tara-browser';
  browser.innerHTML = `<summary>Browse all ${groups.length} communities and visibility controls</summary>`;
  sidebar.insertBefore(browser, document.getElementById('legend-wrap'));
  browser.appendChild(document.getElementById('legend-wrap'));
  document.querySelector('#info-panel h3').textContent = 'Selected code entry';
  document.getElementById('search').setAttribute('aria-label', 'Search code symbols');

  function setVisible(id, visible) {
    const index = LEGEND.findIndex((item) => String(item.cid) === String(id));
    const row = document.querySelectorAll('.legend-item')[index];
    const checkbox = row?.querySelector('.legend-cb');
    if (checkbox && checkbox.checked !== visible) {
      checkbox.checked = visible;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  function showCommunity(id, focus = false) {
    const group = TARA_CONTEXT.communities[String(id)];
    if (!group) return;
    document.getElementById('tara-group').value = String(id);
    panel.innerHTML = `<div class="tara-kicker">${group.count} indexed entries · ${group.files.length} source files · ${escape(group.kind)}</div>
      <h2>${escape(group.name)}</h2><p>${escape(group.purpose)}</p>
      <h3>Questions this group helps answer</h3><ul>${group.questions.map((question) => `<li>${escape(question)}</li>`).join('')}</ul>
      <h3>Start reading here</h3>${group.entries.map((entry) => `<button class="tara-button tara-entry" type="button" data-entry="${escape(entry.id)}"><b>${escape(entry.label)}</b><small>${escape(entry.why)}</small></button>`).join('')}
      <details><summary>Source responsibilities (${group.files.length})</summary><ul>${group.files.map((file) => `<li><code>${escape(file.file)}</code> — ${escape(file.purpose)}</li>`).join('')}</ul></details>
      <details><summary>Related communities (${group.related.length})</summary>${group.related.map((other) => `<button class="tara-button tara-entry" type="button" data-community="${escape(other.id)}">${escape(other.name)} <small>${other.count} indexed links across the groups</small></button>`).join('') || '<p>No cross-community relationships were indexed.</p>'}</details>
      <p><a href="${escape(group.guideUrl)}">Read ${escape(group.guide.replace('TaraSibale - ', ''))} in Obsidian</a></p>`;
    if (focus) {
      network.unselectAll();
      document.getElementById('info-content').innerHTML = '<span class="empty">Choose a starting entry to inspect its responsibility and source.</span>';
      panel.after(document.getElementById('info-panel'));
      setVisible(id, true);
      network.fit({ nodes: group.members, animation: { duration: 350 } });
    }
  }
  const originalInfo = showInfo;
  let labelledNodes = [];
  showInfo = function (id) {
    originalInfo(id);
    const entry = TARA_CONTEXT.nodes[id];
    if (!entry) return;
    nodesDS.update(labelledNodes.map((nodeId) => ({ id: nodeId, font: { ...nodesDS.get(nodeId).font, size: 0 } })));
    labelledNodes = [id, ...network.getConnectedNodes(id).slice(0, 8)];
    nodesDS.update(labelledNodes.map((nodeId) => ({ id: nodeId, font: { ...nodesDS.get(nodeId).font, size: nodeId === id ? 16 : 12 } })));
    const explanation = document.createElement('div');
    explanation.className = 'tara-node-purpose';
    explanation.innerHTML = `<p>${escape(entry.purpose)}</p>${entry.sourceUrl ? `<p><a href="${escape(entry.sourceUrl)}">Open source</a> ${escape(entry.location)}</p>` : ''}`;
    document.getElementById('info-content').prepend(explanation);
    intro.after(document.getElementById('info-panel'));
    showCommunity(entry.community);
  };
  panel.addEventListener('click', (event) => {
    const entry = event.target.closest('[data-entry]');
    if (entry) { setVisible(TARA_CONTEXT.nodes[entry.dataset.entry].community, true); focusNode(entry.dataset.entry); }
    const community = event.target.closest('[data-community]');
    if (community) showCommunity(community.dataset.community, true);
  });
  function clearTour() {
    document.getElementById('tara-tour').value = '';
    document.getElementById('tara-tour-status').textContent = '';
    document.getElementById('tara-tour-steps').replaceChildren();
  }
  document.getElementById('tara-group').addEventListener('change', (event) => { clearTour(); showCommunity(event.target.value, true); });
  document.querySelectorAll('.legend-item').forEach((row, index) => {
    const group = TARA_CONTEXT.communities[String(LEGEND[index].cid)];
    const button = document.createElement('button');
    button.className = 'tara-button tara-about';
    button.type = 'button';
    button.textContent = 'About';
    button.setAttribute('aria-label', `About ${group.name}`);
    button.addEventListener('click', (event) => { event.stopPropagation(); clearTour(); showCommunity(group.id, true); panel.scrollIntoView({ block: 'start' }); });
    row.appendChild(button);
    row.querySelector('.legend-label').title = group.name;
  });
  function changeView(applicationOnly) {
    toggleAllCommunities(false);
    if (applicationOnly) for (const group of groups) if (group.kind === 'configuration' || group.kind === 'tooling') setVisible(group.id, false);
    document.getElementById('tara-app-view').setAttribute('aria-pressed', String(applicationOnly));
    document.getElementById('tara-all-view').setAttribute('aria-pressed', String(!applicationOnly));
    document.getElementById('tara-mode-status').textContent = applicationOnly ? 'Application view: startup, features, and schema. Configuration and maintenance groups are hidden; choose All communities to include them.' : 'All indexed communities are visible, including configuration and tooling.';
    network.fit({ animation: { duration: 350 } });
  }
  document.getElementById('tara-app-view').addEventListener('click', () => changeView(true));
  document.getElementById('tara-all-view').addEventListener('click', () => changeView(false));
  document.getElementById('tara-tour').addEventListener('change', (event) => {
    const tour = TARA_CONTEXT.tours[Number(event.target.value)];
    document.getElementById('tara-tour-status').textContent = event.target.value === '' ? '' : tour.why;
    const steps = document.getElementById('tara-tour-steps');
    steps.replaceChildren();
    if (event.target.value === '') return;
    tour.nodes.forEach((id, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'tara-button';
      button.textContent = `${index + 1}. ${TARA_CONTEXT.nodes[id].label}`;
      button.addEventListener('click', () => { setVisible(TARA_CONTEXT.nodes[id].community, true); focusNode(id); });
      steps.appendChild(button);
    });
    if (tour.nodes[0]) { setVisible(TARA_CONTEXT.nodes[tour.nodes[0]].community, true); focusNode(tour.nodes[0]); }
  });
  changeView(true);
  const initial = groups.find((group) => group.entries.some((entry) => entry.label === 'App()')) ?? groups[0];
  showCommunity(initial.id);
})();
