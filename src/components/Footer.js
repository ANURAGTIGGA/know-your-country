// footer.js
import javascriptLogo from '../javascript.svg'
import viteLogo from '/vite.svg'
import tailwindLogo from '/tailwind.svg'

export function createFooter() {
  return `
    <footer>
      <p>&copy; 2025 Know Your Country. All rights reserved.</p>
      <div class="logos flex justify-center space-x-4">
        <span class="flex items-center">Powered by:</span>
        <img src="${viteLogo}" class="logo" alt="Vite logo" />
        <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
        <img src="${tailwindLogo}" class="logo tailwind" alt="Tailwind logo" />
      </div>
    </footer>
  `;
}