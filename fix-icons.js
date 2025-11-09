const fs = require('fs');
const path = require('path');

const iconMapping = {
  'Users': 'FiUsers',
  'Ticket': 'FiTag',
  'UserCircle': 'FiUser',
  'ArrowLeft': 'FiArrowLeft',
  'Clock': 'FiClock',
  'Gift': 'FiGift',
  'TrendingDown': 'FiTrendingDown',
  'Calendar': 'FiCalendar',
  'CalendarIcon': 'FiCalendar',
  'MapPin': 'FiMapPin',
  'Share2': 'FiShare2',
  'ChevronDown': 'FiChevronDown',
  'ChevronDownIcon': 'FiChevronDown',
  'ChevronRight': 'FiChevronRight',
  'ChevronRightIcon': 'FiChevronRight',
  'ChevronLeft': 'FiChevronLeft',
  'ChevronLeftIcon': 'FiChevronLeft',
  'ChevronUp': 'FiChevronUp',
  'ChevronUpIcon': 'FiChevronUp',
  'MoreHorizontal': 'FiMoreHorizontal',
  'MoreHorizontalIcon': 'FiMoreHorizontal',
  'ArrowRight': 'FiArrowRight',
  'Check': 'FiCheck',
  'CheckIcon': 'FiCheck',
  'X': 'FiX',
  'XIcon': 'FiX',
  'Search': 'FiSearch',
  'SearchIcon': 'FiSearch',
  'Circle': 'FiCircle',
  'CircleIcon': 'FiCircle',
  'Minus': 'FiMinus',
  'MinusIcon': 'FiMinus',
  'GripVertical': 'FiMoreVertical',
  'GripVerticalIcon': 'FiMoreVertical',
  'PanelLeft': 'FiSidebar',
  'PanelLeftIcon': 'FiSidebar',
  'CreditCard': 'FiCreditCard',
  'Lock': 'FiLock',
  'CheckCircle': 'FiCheckCircle',
  'Download': 'FiDownload',
  'TrendingUp': 'FiTrendingUp',
  'Settings': 'FiSettings',
  'LogOut': 'FiLogOut',
  'Crown': 'FiAward',
  'Shield': 'FiShield',
  'Info': 'FiInfo',
  'Send': 'FiSend',
  'AlertCircle': 'FiAlertCircle',
  'Copy': 'FiCopy',
  'FileText': 'FiFileText',
  'Plus': 'FiPlus',
  'Mail': 'FiMail',
  'User': 'FiUser',
  'Ticket': 'FiTag'
};

function fixIconsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if file uses lucide-react
  if (!content.includes('from "lucide-react"') && !content.includes("from 'lucide-react'")) {
    return false;
  }

  console.log(`Fixing: ${filePath}`);

  // Extract import statement
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+["']lucide-react["'];?/g;
  const matches = [...content.matchAll(importRegex)];

  if (matches.length === 0) {
    return false;
  }

  matches.forEach(match => {
    const icons = match[1].split(',').map(i => i.trim()).filter(i => i.length > 0);
    const mappedIcons = [];

    icons.forEach(icon => {
      let iconName = icon;
      let alias = null;

      // Handle "Calendar as CalendarIcon"
      if (icon.includes(' as ')) {
        [iconName, alias] = icon.split(' as ').map(s => s.trim());
      }

      const newIcon = iconMapping[iconName] || iconName;
      if (alias) {
        mappedIcons.push(`${newIcon} as ${alias}`);
      } else {
        mappedIcons.push(newIcon);
      }
    });

    // Replace import statement
    const newImport = `import { ${mappedIcons.join(', ')} } from "react-icons/fi";`;
    content = content.replace(match[0], newImport);
    modified = true;
  });

  // Save file
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      count += processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (fixIconsInFile(filePath)) {
        count++;
      }
    }
  });

  return count;
}

// Run
const rootDir = __dirname;
const fixed = processDirectory(rootDir);
console.log(`\n✅ Fixed ${fixed} files!`);
