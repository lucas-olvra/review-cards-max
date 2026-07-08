import { repairData } from './storage.js';
import './modal.js';
import './sections.js';
import './cards.js';
import './quiz.js';
import './export-import.js';
import { home } from './home.js';
import { initAddSectionButton } from './sections.js';
import { maybeShowTourOnFirstVisit, initHelpButton } from './onboarding.js';

repairData();
initAddSectionButton();
initHelpButton();
home();
maybeShowTourOnFirstVisit();
