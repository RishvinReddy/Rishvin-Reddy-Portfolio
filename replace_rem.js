const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const regex = /<div\s+class="bg-white\/10 backdrop-blur-md border border-white\/20 rounded-2xl p-2 sm:p-3 flex flex-col sm:flex-row gap-2 shadow-2xl">\s*<div class="flex-grow flex items-center px-4">[\s\S]*?<input type="email" placeholder="Subscribe to newsletter for updates\.\.\."[\s\S]*?<\/div>[\s\S]*?<button[^>]*>[\s\S]*?Join Now[\s\S]*?<\/button>\s*<\/div>\s*<p class="text-slate-400 text-xs mt-4">\s*Join 500\+ engineers\. No spam, unsubscribe anytime\.\s*<\/p>/g;

const replacement = `<form id="newsletter-form" class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 sm:p-3 flex flex-col sm:flex-row gap-2 shadow-2xl relative">
          <div class="flex-grow flex items-center px-4">
            <svg class="w-6 h-6 text-slate-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <input type="email" id="newsletter-email" placeholder="Subscribe to newsletter for updates..." class="bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 w-full outline-none h-12" required />
          </div>
          <button id="newsletter-submit-btn" type="submit" class="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary/20 whitespace-nowrap btn-shine">
            Join Now
          </button>
          <div id="newsletter-status" class="absolute -bottom-8 left-0 right-0 text-center text-sm font-medium opacity-0 transition-opacity"></div>
        </form>
        <p class="text-slate-400 text-xs mt-10">
          Join 500+ engineers. No spam, unsubscribe anytime.
        </p>`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
