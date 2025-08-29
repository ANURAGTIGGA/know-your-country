// footer.js
import javascriptLogo from '../javascript.svg'
import viteLogo from '/vite.svg'
import tailwindLogo from '/tailwind.svg'

export function createFooter() {
  return `
    <footer class="flex items-center justify-center p-4 border-t">
      <p class="mr-5">&copy; 2025 Know Your Country. </p>
      <div class="logos flex justify-center space-x-4">
        <span class="flex items-center mr-0">Powered by:</span>
        <img src="${viteLogo}" class="logo" alt="Vite logo" />
        <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
        <img src="${tailwindLogo}" class="logo tailwind" alt="Tailwind logo" />
      </div>
    </footer>
  `;
}