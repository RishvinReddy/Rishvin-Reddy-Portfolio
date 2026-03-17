/**
 * UI Controller for Rishvin's AI Portfolio Engine (v4.0)
 * Handles the Explorer tree, Editor Tabs, and Content Rendering.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const ENGINE = window.ENGINE;
  if (!ENGINE) {
    console.error("Portfolio Engine not found.");
    return;
  }

  // DOM Elements
  const explorerTree = document.getElementById('explorer-tree');
  const editorTabs = document.getElementById('editor-tabs');
  const editorContentArea = document.getElementById('editor-content-area');
  const welcomeContentHtml = editorContentArea.innerHTML; // Save welcome screen

  // State
  let activeTab = null;
  let openTabs = new Map(); // name -> repo data

  // Initialize
  await initExplorer();

  /**
   * 1. Initialize the Explorer Sidebar
   */
  async function initExplorer() {
    try {
      explorerTree.innerHTML = `
        <div class="text-sm text-slate-400 px-2 py-2 flex items-center gap-2 rounded-md animate-pulse">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          <span class="truncate">Fetching from GitHub...</span>
        </div>
      `;

      // Log to our terminal
      window.logToTerminal && window.logToTerminal("Fetching repositories from GitHub API...", "info");
      
      const allRepos = await ENGINE.getRepos(); 
      const repos = ENGINE.getTopRepos(allRepos, 12); // Get top projects
      
      if (!repos || repos.length === 0) {
        explorerTree.innerHTML = '<div class="p-3 text-xs text-rose-500">Failed to load repos. Check API limit.</div>';
        window.logToTerminal && window.logToTerminal("Failed to fetch repositories. API rate limit?", "error");
        return;
      }

      window.logToTerminal && window.logToTerminal(`Successfully loaded ${repos.length} repositories.`, "success");

      explorerTree.innerHTML = '';

      // --- 1.a Appending "Codebase Map" Global Tab ---
      const mapItem = document.createElement('div');
      mapItem.className = 'text-[13px] text-slate-600 dark:text-slate-400 px-2 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 rounded-md transition-colors group select-none file-item font-bold mb-2 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm';
      mapItem.dataset.repo = 'Codebase Map';
      mapItem.innerHTML = `
        <svg class="w-4 h-4 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <span class="truncate w-full text-purple-700 dark:text-purple-400">Codebase Map</span>
      `;
      mapItem.addEventListener('click', () => openMapTab(repos));
      explorerTree.appendChild(mapItem);

      // --- 1.b Render Standard Repos ---
      repos.forEach(repo => {
        const item = document.createElement('div');
        item.className = 'text-[13px] text-slate-600 dark:text-slate-400 px-2 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-primary/10 hover:text-primary dark:hover:text-primary rounded-md transition-colors group select-none file-item';
        item.dataset.repo = repo.name;
        
        // Pick an icon based on primary language or classification
        const classification = ENGINE.classifyRepo(repo);
        let iconHtml = `<svg class="w-4 h-4 text-slate-400 group-hover:text-primary shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>`;
        
        if (classification === 'Web Project') {
          iconHtml = `<svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>`;
        } else if (classification === 'AI / Machine Learning Project') {
          iconHtml = `<svg class="w-4 h-4 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`;
        } else if (classification === 'Data Pipeline / Backend') {
          iconHtml = `<svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>`;
        }

        item.innerHTML = `
          ${iconHtml}
          <span class="truncate w-full">${repo.name}</span>
        `;
        
        item.addEventListener('click', () => openRepoTab(repo));
        explorerTree.appendChild(item);
      });

    } catch (err) {
      console.error(err);
      explorerTree.innerHTML = '<div class="p-3 text-xs text-rose-500">Error loading explorer.</div>';
    }
  }

  /**
   * 2. Tab Management
   */
  function openRepoTab(repo) {
    if (!openTabs.has(repo.name)) {
      openTabs.set(repo.name, repo);
      renderTab(repo.name);
    }
    
    // Switch to this tab
    activeTab = repo.name;
    updateTabUI();
    renderEditorContent(repo);
    updateExplorerSelection();
  }

  function closeRepoTab(repoName, event) {
    event.stopPropagation();
    openTabs.delete(repoName);
    
    // Remove tab DOM element
    const tabEl = document.getElementById(`tab-${repoName}`);
    if (tabEl) tabEl.remove();

    if (activeTab === repoName) {
      // Find another tab to open, or go back to Welcome
      const remainingTabs = Array.from(openTabs.keys());
      if (remainingTabs.length > 0) {
        openRepoTab(openTabs.get(remainingTabs[remainingTabs.length - 1]));
      } else {
        activeTab = null;
        updateTabUI();
        editorContentArea.innerHTML = welcomeContentHtml; // Show welcome
        updateExplorerSelection();
      }
    }
  }

  function renderTab(repoName) {
    const tab = document.createElement('div');
    tab.id = `tab-${repoName}`;
    tab.className = `editor-tab group flex items-center gap-2 px-4 border-r border-slate-200 dark:border-slate-800 border-t-2 text-[13px] min-w-max cursor-pointer transition-colors`;
    
    tab.innerHTML = `
      <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
      ${repoName}
      <button class="close-tab-btn w-5 h-5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;
    
    tab.addEventListener('click', () => openRepoTab(openTabs.get(repoName)));
    tab.querySelector('.close-tab-btn').addEventListener('click', (e) => closeRepoTab(repoName, e));
    
    editorTabs.appendChild(tab);
  }

  function updateTabUI() {
    document.querySelectorAll('.editor-tab').forEach(tab => {
      const repoName = tab.id.replace('tab-', '');
      if (repoName === activeTab) {
        tab.classList.add('bg-slate-50', 'dark:bg-[#0f172a]', 'border-t-primary', 'text-slate-700', 'dark:text-slate-200');
        tab.classList.remove('bg-white', 'dark:bg-slate-800', 'border-t-transparent', 'text-slate-500');
      } else {
        tab.classList.remove('bg-slate-50', 'dark:bg-[#0f172a]', 'border-t-primary', 'text-slate-700', 'dark:text-slate-200');
        tab.classList.add('bg-white', 'dark:bg-slate-800', 'border-t-transparent', 'text-slate-500');
      }
    });

    // Handle Welcome Tab manually since it's hardcoded for now, or we can just hide it
    const welcomeTab = editorTabs.firstElementChild;
    if (welcomeTab && welcomeTab.id !== 'tab-' + activeTab) {
      if (activeTab === null) {
        welcomeTab.classList.add('bg-slate-50', 'dark:bg-[#0f172a]', 'border-t-primary', 'text-slate-700', 'dark:text-slate-200');
        welcomeTab.classList.remove('bg-white', 'dark:bg-slate-800', 'border-t-transparent', 'text-slate-500');
      } else {
        welcomeTab.classList.remove('bg-slate-50', 'dark:bg-[#0f172a]', 'border-t-primary', 'text-slate-700', 'dark:text-slate-200');
        welcomeTab.classList.add('bg-white', 'dark:bg-slate-800', 'border-t-transparent', 'text-slate-500');
      }
    }
  }
  
  function updateExplorerSelection() {
    document.querySelectorAll('.file-item').forEach(item => {
      if (item.dataset.repo === activeTab) {
        item.classList.add('bg-primary/10', 'text-primary');
        item.classList.remove('text-slate-600', 'dark:text-slate-400');
        // If it's the map tab, re-add purple text explicitly
        if(item.dataset.repo === 'Codebase Map') { item.classList.add('text-purple-600', 'dark:text-purple-400', 'bg-purple-500/10'); item.classList.remove('text-primary','bg-primary/10'); }
      } else {
        item.classList.remove('bg-primary/10', 'text-primary', 'bg-purple-500/10', 'text-purple-600', 'dark:text-purple-400');
        item.classList.add('text-slate-600', 'dark:text-slate-400');
        // If it's the map tab, restore original base
        if(item.dataset.repo === 'Codebase Map') { item.classList.add('text-purple-700', 'dark:text-purple-400'); }
      }
    });
  }

  // --- Map specific tab management ---
  function openMapTab(repos) {
    const tabName = 'Codebase Map';
    if (!openTabs.has(tabName)) {
      openTabs.set(tabName, { isMap: true, repos }); // Mock repo object for map
      renderMapTabHeader(tabName);
    }
    
    activeTab = tabName;
    updateTabUI();
    renderMapContent(repos);
    updateExplorerSelection();
  }

  function renderMapTabHeader(repoName) {
    const tab = document.createElement('div');
    tab.id = `tab-${repoName.replace(/\s+/g, '-')}`;
    tab.className = `editor-tab group flex items-center gap-2 px-4 border-r border-slate-200 dark:border-slate-800 border-t-2 text-[13px] min-w-max cursor-pointer transition-colors`;
    
    tab.innerHTML = `
      <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      ${repoName}
      <button class="close-tab-btn w-5 h-5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;
    
    tab.addEventListener('click', () => {
       const tabData = openTabs.get(repoName);
       if(tabData && tabData.repos) openMapTab(tabData.repos);
    });
    
    tab.querySelector('.close-tab-btn').addEventListener('click', (e) => {
       e.stopPropagation();
       openTabs.delete(repoName);
       tab.remove();
       if (activeTab === repoName) {
         editorContentArea.innerHTML = welcomeContentHtml;
         activeTab = null;
         updateTabUI();
         updateExplorerSelection();
       }
    });
    
    editorTabs.appendChild(tab);
  }

  async function renderMapContent(repos) {
    window.logToTerminal && window.logToTerminal("Generating Force-Directed Knowledge Graph...", "info");
    
    editorContentArea.innerHTML = `
      <div class="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTQ4LCAxNjMsIDE4NCLCAwLjE1KSIvPjwvc3ZnPg==')] opacity-60 dark:opacity-30 pointer-events-none z-0"></div>
      <div class="relative z-10 w-full h-[85vh] flex flex-col p-4 lg:p-8">
        <div class="mb-4">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Interactive Codebase Map
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Scroll to zoom, drag to move nodes. This graph connects my projects to their underlying languages, tools, and domains dynamically.</p>
        </div>
        
        <div class="flex-1 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner relative overflow-hidden" id="viz-network-container">
           <!-- Network renders here -->
        </div>
      </div>
    `;

    setTimeout(() => {
      if (typeof vis === 'undefined') {
        window.logToTerminal && window.logToTerminal("vis-network library failed to load.", "error");
        return;
      }
      
      const graphData = window.ENGINE.buildCodebaseGraph(repos);
      
      // Setup dataset mapping visual config injected onto base data
      const mappedNodes = graphData.nodes.map(n => ({
        id: n.id,
        label: n.label,
        color: { background: n.color, border: 'rgba(255,255,255,0.2)' },
        font: { color: document.documentElement.classList.contains('dark') ? '#fff' : '#1e293b', size: 14, face: 'Inter, sans-serif' },
        shape: 'box',
        margin: 12,
        shadow: true,
        borderWidth: 1.5,
        borderWidthSelected: 3
      }));

      const mappedEdges = graphData.edges.map(e => ({
        from: e.source,
        to: e.target,
        label: e.type,
        color: { color: document.documentElement.classList.contains('dark') ? '#475569' : '#cbd5e1', highlight: '#f20d46' },
        font: { size: 10, align: 'horizontal', color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b', face: 'monaco, monospace' },
        arrows: { to: { enabled: true, scaleFactor: 0.5 } },
        smooth: { type: 'continuous' }
      }));

      const container = document.getElementById('viz-network-container');
      const data = { nodes: mappedNodes, edges: mappedEdges };
      const options = {
        interaction: { hover: true, tooltipDelay: 200 },
        physics: {
          forceAtlas2Based: { gravitationalConstant: -100, centralGravity: 0.005, springLength: 200, springConstant: 0.05 },
          maxVelocity: 50,
          solver: 'forceAtlas2Based',
          timestep: 0.35,
          stabilization: { iterations: 150 }
        }
      };

      const network = new vis.Network(container, data, options);
      
      network.on("click", function (params) {
        if (params.nodes.length > 0) {
           const nodeId = params.nodes[0];
           const node = graphData.nodes.find(n => n.id === nodeId);
           if(node && window.logToTerminal) {
              window.logToTerminal(`[Map] Selected Node: ${node.label} (${node.type})`, "info");
              // Check if project, if so attempt to open tab
              if(node.type === "project") {
                 const matchingRepo = repos.find(r => r.name === node.label);
                 if(matchingRepo) {
                    window.logToTerminal(`Navigating to ${node.label} editor...`, "system");
                    setTimeout(() => openRepoTab(matchingRepo), 600);
                 }
              }
           }
        }
      });

      window.logToTerminal && window.logToTerminal(`Codebase Map built with ${graphData.nodes.length} nodes and ${graphData.edges.length} edges.`, "success");
    }, 100); // give DOM time to render container
  }

  /**
   * 3. Render Editor Content (Readme + Architecture)
   */
  async function renderEditorContent(repo) {
    window.logToTerminal && window.logToTerminal(`Opening editor tab: ${repo.name}`, "info");

    // Loading State
    editorContentArea.innerHTML = `
      <div class="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTQ4LCAxNjMsIDE4NCLCAwLjE1KSIvPjwvc3ZnPg==')] opacity-60 dark:opacity-30 pointer-events-none z-0"></div>
      <div class="relative z-10 w-full max-w-4xl mx-auto p-6 lg:p-12 flex flex-col items-center justify-center min-h-[50vh]">
        <div class="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
        <p class="text-slate-500 font-mono text-xs">Cloning repository data...</p>
      </div>
    `;

    try {
      // Fetch data in parallel
      const [readmeData, filesData] = await Promise.all([
        window.ENGINE.fetchReadme(repo.name),
        window.ENGINE.fetchRepoTree(repo.name)
      ]);

      let htmlContent = '';
      
      // 3.1 Header / Overview
      htmlContent += `
        <div class="mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-3 mb-4">
            <h1 class="text-3xl font-bold font-sans text-slate-900 dark:text-white">${repo.name}</h1>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">${repo.language || 'Code'}</span>
          </div>
          <p class="text-slate-600 dark:text-slate-400 max-w-3xl">${repo.description || 'No description provided.'}</p>
          
          <div class="flex gap-4 mt-6">
            <a href="${repo.html_url}" target="_blank" class="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              View on GitHub
            </a>
            ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg> Live Demo</a>` : ''}
          </div>
        </div>
      `;

      // 3.2 Architecture Diagram
      if (filesData && filesData.length > 0) {
        window.logToTerminal && window.logToTerminal("Generating architecture diagram from file tree...", "info");
        const rawArchitecture = window.ENGINE.generateArchitecture(filesData);
        let mermaidSyntax = "graph TD\n";
        mermaidSyntax += "  Root((Repository))\n";
        
        let counter = 0;
        Object.keys(rawArchitecture).forEach(folder => {
          if (folder !== "root") {
             // Create folder node linking to Root
             mermaidSyntax += `  Root --> F${counter}[${folder}]\n`;
             
             // Create file nodes linking to the folder
             // Show max 5 files per folder to keep diagram readable
             rawArchitecture[folder].slice(0, 5).forEach((file, idx) => {
               const fileName = file.split('/').pop().replace(/[^a-zA-Z0-9_.]/g, ''); // safe chars only
               mermaidSyntax += `  F${counter} -.-> f${counter}_${idx}(${fileName})\n`;
             });
             counter++;
          }
        });
        
        htmlContent += `
          <div class="mb-12">
            <h2 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 font-mono">System Architecture</h2>
            <div class="glass-card dark:glass-card-dark p-6 rounded-2xl flex items-center justify-center overflow-x-auto">
              <pre class="mermaid bg-transparent mx-auto m-0 !font-mono">${mermaidSyntax}</pre>
            </div>
          </div>
        `;
      }

      // 3.3 Readme Rendering
      if (readmeData) {
        window.logToTerminal && window.logToTerminal("Parsing README markdown...", "info");
        const parsedReadme = marked.parse(readmeData);
        
        htmlContent += `
          <div>
            <h2 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 font-mono">
              <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> 
              README.md
            </h2>
            <div class="prose dark:prose-invert prose-slate prose-a:text-primary hover:prose-a:text-rose-500 max-w-none bg-white/50 dark:bg-slate-900/50 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm" id="markdown-body">
              ${parsedReadme}
            </div>
          </div>
        `;
      } else {
        htmlContent += `
          <div class="p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500">
            No README.md found in repository root.
          </div>
        `;
      }

      // Final Assembly
      editorContentArea.innerHTML = `
        <div class="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTQ4LCAxNjMsIDE4NCLCAwLjE1KSIvPjwvc3ZnPg==')] opacity-60 dark:opacity-30 pointer-events-none z-0"></div>
        <div class="relative z-10 w-full max-w-4xl mx-auto p-6 lg:p-12">
          ${htmlContent}
        </div>
      `;

      // Trigger PrismJS for syntax highlighting in README
      if (window.Prism) {
        window.Prism.highlightAllUnder(editorContentArea);
      }

      // Trigger Mermaid Rendering
      if (window.mermaid) {
        window.mermaid.run({
          nodes: editorContentArea.querySelectorAll('.mermaid')
        }).catch(e => {
          console.warn("Mermaid rendering warning: ", e);
        });
      }
      
      window.logToTerminal && window.logToTerminal(`Render complete for ${repo.name}.`, "success");

    } catch (err) {
      console.error(err);
      editorContentArea.innerHTML = `
        <div class="p-8">
          <div class="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl border border-rose-200 dark:border-rose-800/50 flex flex-col gap-2">
            <h3 class="font-bold flex items-center gap-2">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> 
              Failed to load repository data
            </h3>
            <p class="text-sm">Could not fetch files or README. GitHub API might be rate limited.</p>
          </div>
        </div>
      `;
      window.logToTerminal && window.logToTerminal(`Failed to load data for ${repo.name}. Error: ${err.message}`, "error");
    }
  }
});
