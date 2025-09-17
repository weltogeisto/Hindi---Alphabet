/**
 * User Interface Components and Navigation
 * Handles rendering of all views and user interactions
 */

import { getStore, updateStore, addXP, incrementStreak, exportData, importData, showNotification } from './store';
import { getDueCards, getDueCount, getCard, rateCard, getSRSStats, resetCard, forceReviewAll, getAllCardsSorted } from './srs';
import { getAudioElement } from './tts';
import { renderStrokeAnimation } from './stroke';
import { createQuiz } from './quiz';

// Main App Container
export function initApp() {
  const app = document.getElementById('app');
  if (!app) return;
  
  // Render initial view
  renderDashboard();
  
  // Add event listeners for navigation
  setupNavigation();
  
  // Setup PWA install button
  setupPWAInstall();
  
  // Check for URL hash changes for deep linking
  window.addEventListener('hashchange', handleHashChange);
  handleHashChange(); // Initial check
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.navbar-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = (e.currentTarget as HTMLElement).dataset.target;
      if (target) {
        navigateTo(target);
      }
    });
  });
  
  // Back button functionality
  document.addEventListener('click', (e) => {
    const backButton = (e.target as HTMLElement).closest('[data-back]');
    if (backButton) {
      history.back();
    }
  });
}

function setupPWAInstall() {
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.addEventListener('click', () => {
      // Trigger the install prompt
      window.dispatchEvent(new Event('beforeinstallprompt'));
    });
  }
}

function navigateTo(view: string) {
  // Update URL hash
  window.location.hash = view;
  handleHashChange();
  
  // Mark active nav item
  document.querySelectorAll('.navbar-item').forEach(item => {
    item.classList.remove('active');
  });
  const activeNavItem = document.querySelector(`.navbar-item[data-target="${view}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }
}

function handleHashChange() {
  const hash = window.location.hash.substring(1) || 'dashboard';
  const app = document.getElementById('app');
  if (!app) return;
  
  // Clear previous content
  app.innerHTML = '';
  
  // Render the requested view
  switch (hash) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'learn':
      renderLearnView();
      break;
    case 'practice':
      renderPracticeView();
      break;
    case 'quizzes':
      renderQuizzesView();
      break;
    case 'progress':
      renderProgressView();
      break;
    case 'settings':
      renderSettingsView();
      break;
    default:
      renderDashboard();
  }
}

// Dashboard View
function renderDashboard() {
  const app = document.getElementById('app');
  if (!app) return;
  
  const state = getStore();
  const stats = getSRSStats();
  
  const html = `
    <div class="p-4 pb-20 pt-6 max-w-md mx-auto w-full">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">हिंदी वर्णमाला</h1>
        <p class="text-gray-600">Master the Hindi Alphabet</p>
        
        <!-- Streak & XP -->
        <div class="mt-4 flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 text-white">
          <div class="text-center">
            <div class="text-2xl font-bold">${state.streak}</div>
            <div class="text-sm opacity-90">Day Streak</div>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold">${state.xp}</div>
            <div class="text-sm opacity-90">XP</div>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold">${stats.dueCards}</div>
            <div class="text-sm opacity-90">Due</div>
          </div>
        </div>
      </header>
      
      <!-- Today's Goals -->
      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Today's Goals</h2>
        <div class="space-y-3">
          <div class="bg-white glass-card rounded-xl p-4 card-shadow">
            <div class="flex justify-between items-center">
              <span class="font-medium">Review due cards</span>
              <span class="text-indigo-600 font-bold">${stats.dueCards}/${stats.totalCards}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div class="bg-indigo-600 h-2 rounded-full" style="width: ${Math.min(100, Math.round((stats.dueCards / stats.totalCards) * 100))}%"></div>
            </div>
          </div>
          
          <div class="bg-white glass-card rounded-xl p-4 card-shadow">
            <div class="flex justify-between items-center">
              <span class="font-medium">Mastery Level</span>
              <span class="text-indigo-600 font-bold">${stats.completionRate}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div class="bg-indigo-600 h-2 rounded-full" style="width: ${stats.completionRate}%"></div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Quick Actions -->
      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 gap-3">
          <button onclick="navigateTo('practice')" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 px-3 rounded-xl card-shadow transition-all transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 00.707-.293l1.414-1.414a1 1 0 00-.707-1.707H9m0 10h1.586a1 1 0 00.707-.293l1.414-1.414a1 1 0 00-.707-1.707H9m-6 4h1.586a1 1 0 00.707-.293l1.414-1.414a1 1 0 00-.707-1.707H3m0 0h1.586a1 1 0 00.707-.293l1.414-1.414a1 1 0 00-.707-1.707H3" />
            </svg>
            Practice Now
          </button>
          
          <button onclick="navigateTo('learn')" class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 px-3 rounded-xl card-shadow transition-all transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Explore
          </button>
          
          <button onclick="navigateTo('progress')" class="bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-3 rounded-xl card-shadow transition-all transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Progress
          </button>
          
          <button onclick="navigateTo('settings')" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-3 rounded-xl card-shadow transition-all transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </section>
      
      <!-- Badges Carousel -->
      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Your Badges</h2>
        <div class="flex overflow-x-auto space-x-3 pb-3">
          ${state.badges.map(badgeId => `
            <div class="flex-shrink-0 bg-white glass-card rounded-xl p-4 card-shadow text-center min-w-[80px]">
              <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">
                ${getBadgeIcon(badgeId)}
              </div>
              <div class="text-xs font-medium text-gray-700 truncate">${getBadgeName(badgeId)}</div>
            </div>
          `).join('')}
        </div>
      </section>
      
      <!-- Export/Import -->
      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Data Management</h2>
        <div class="space-y-2">
          <button onclick="exportData()" class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl card-shadow transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Progress
          </button>
          
          <button onclick="importDataDialog()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl card-shadow transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Import Progress
          </button>
          
          <button onclick="resetProgress()" class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl card-shadow transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Progress
          </button>
        </div>
      </section>
    </div>
  `;
  
  app.innerHTML = html;
}

function getBadgeName(badgeId: string): string {
  const badgeNames: Record<string, string> = {
    'first-10': 'First 10 Letters',
    'full-vowels': 'Full Vowels Master',
    '7-day-streak': '7-Day Streak',
    '30-day-streak': '30-Day Streak',
    'master-all': 'Master All Letters',
    'perfect-session': 'Perfect Session',
    'quick-recall': 'Quick Recall',
    'no-errors': 'No Errors Today',
  };
  
  return badgeNames[badgeId] || badgeId;
}

function getBadgeIcon(badgeId: string): string {
  const icons: Record<string, string> = {
    'first-10': '🌟',
    'full-vowels': '👑',
    '7-day-streak': '🔥',
    '30-day-streak': '🏆',
    'master-all': '💯',
    'perfect-session': '✨',
    'quick-recall': '⚡',
    'no-errors': '🎯',
  };
  
  return icons[badgeId] || '💎';
}

function exportData() {
  const data = exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hindi-alphabet-progress.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('💾 Exported', 'Your progress has been exported successfully!');
}

async function importDataDialog() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event: any) => {
      const content = event.target.result;
      if (importData(content)) {
        showNotification('✅ Imported', 'Your progress has been imported successfully!');
        window.location.reload();
      } else {
        showNotification('❌ Error', 'Failed to import progress. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
}

// Learn View
function renderLearnView() {
  const app = document.getElementById('app');
  if (!app) return;
  
  const html = `
    <div class="p-4 pb-20 pt-6 max-w-md mx-auto w-full">
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Explore the Alphabet</h1>
        <p class="text-gray-600">Browse all letters with examples</p>
      </header>
      
      <div class="mb-6">
        <div class="flex space-x-2 overflow-x-auto pb-2">
          <button onclick="filterLetters('all')" class="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium whitespace-nowrap">All</button>
          <button onclick="filterLetters('vowel')" class="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium whitespace-nowrap">Vowels</button>
          <button onclick="filterLetters('consonant')" class="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium whitespace-nowrap">Consonants</button>
          <button onclick="filterLetters('matra')" class="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium whitespace-nowrap">Matras</button>
          <button onclick="filterLetters('conjunct')" class="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium whitespace-nowrap">Conjuncts</button>
        </div>
      </div>
      
      <div id="letters-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <!-- Letters will be rendered here -->
      </div>
    </div>
  `;
  
  app.innerHTML = html;
  
  // Load and render letters
  loadAndRenderLetters('all');
}

async function loadAndRenderLetters(filter: string) {
  const grid = document.getElementById('letters-grid');
  if (!grid) return;
  
  // Load all letter data
  const [core, matras, conjuncts] = await Promise.all([
    fetch('/data/letters.core.json').then(r => r.json()),
    fetch('/data/letters.matras.json').then(r => r.json()),
    fetch('/data/letters.conjuncts.json').then(r => r.json())
  ]);
  
  let allLetters = [];
  
  if (filter === 'all' || filter === 'vowel') {
    allLetters = [...allLetters, ...core.filter(item => item.category === 'vowel')];
  }
  
  if (filter === 'all' || filter === 'consonant') {
    allLetters = [...allLetters, ...core.filter(item => item.category === 'consonant')];
  }
  
  if (filter === 'all' || filter
