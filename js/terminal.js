/**
 * Terminal Simulator for AI Portfolio Engine
 */

// Make logToTerminal available globally so other scripts can use it
window.logToTerminal = function(message, type = "info") {
  const terminalOutput = document.getElementById('terminal-output');
  if (!terminalOutput) return;

  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  
  let colorClass = "text-slate-500 dark:text-slate-400";
  if (type === "success") colorClass = "text-emerald-500";
  if (type === "error") colorClass = "text-rose-500";
  if (type === "warning") colorClass = "text-yellow-500";
  if (type === "system") colorClass = "text-indigo-500";

  const logEl = document.createElement('div');
  logEl.className = `mb-1 ${colorClass} text-[13px] opacity-90`;
  logEl.innerHTML = `<span class="text-slate-400 opacity-50 mr-2">[${timestamp}]</span> ${message}`;
  
  // Insert before the input line if it exists
  const inputLine = terminalOutput.lastElementChild;
  if(inputLine && inputLine.tagName === 'DIV' && inputLine.querySelector('input')) {
    terminalOutput.insertBefore(logEl, inputLine);
  } else {
    terminalOutput.appendChild(logEl);
  }
  
  // Scroll to bottom
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
};

document.addEventListener('DOMContentLoaded', () => {
  const terminalOutput = document.getElementById('terminal-output');
  const terminalInput = document.getElementById('terminal-input');
  
  if (!terminalOutput || !terminalInput) return;

  // Handle Enter key for custom commands
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput.value.trim();
      if (!command) return;

      // Echo command
      const cmdEl = document.createElement('div');
      cmdEl.className = 'mb-1 text-slate-800 dark:text-slate-200';
      cmdEl.innerHTML = `<span class="text-emerald-500">➜</span>  ${command}`;
      terminalOutput.insertBefore(cmdEl, terminalOutput.lastElementChild);

      // Process command
      processCommand(command);

      // Reset
      terminalInput.value = '';
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
  });

  function processCommand(cmd) {
    const args = cmd.toLowerCase().split(' ');
    
    switch (args[0]) {
      case 'help':
        window.logToTerminal("Available commands: help, clear, whoami, fetch --repos, cache --status", "system");
        break;
      case 'clear':
        // remove all children except the last one (input line)
        while (terminalOutput.children.length > 1) {
          terminalOutput.removeChild(terminalOutput.firstChild);
        }
        break;
      case 'whoami':
        window.logToTerminal(`Rishvin Reddy - ${window.ENGINE ? window.ENGINE.USERNAME : 'Developer'}`, "info");
        break;
      case 'fetch':
        if (args[1] === '--repos' && window.ENGINE) {
          window.logToTerminal("Triggering repo fetch...", "info");
          window.ENGINE.getRepos().then(repos => {
            window.logToTerminal(`Fetched ${repos.length} repositories.`, "success");
          });
        } else {
          window.logToTerminal("Usage: fetch --repos", "warning");
        }
        break;
      case 'cache':
        if (args[1] === '--status' && window.ENGINE) {
          const cache = window.ENGINE.getEngineCache();
          window.logToTerminal(`Cache status: ${cache.repos ? 'repos loaded' : 'repos empty'}`, "info");
        } else {
          window.logToTerminal("Usage: cache --status", "warning");
        }
        break;
      default:
        window.logToTerminal(`Command not found: ${args[0]}. Type 'help' for commands.`, "error");
    }
  }
});
