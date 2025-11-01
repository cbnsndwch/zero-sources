#!/usr/bin/env node

/**
 * Validation script for Fumadocs content structure
 * 
 * This script validates:
 * - Directory structure exists
 * - meta.json files are valid JSON
 * - meta.json files reference existing pages
 * - All MDX files have required frontmatter
 * - No broken internal links
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../content');
const errors = [];
const warnings = [];

// Required top-level directories
const requiredDirs = [
  'getting-started',
  'libraries',
  'change-sources',
  'demos',
  'guides',
  'api',
  'architecture',
];

// Required library subdirectories
const requiredLibraries = [
  'zero-contracts',
  'zero-source-mongodb',
  'zero-watermark-zqlite',
  'zero-watermark-nats-kv',
  'zero-nest-mongoose',
  'synced-queries',
  'zrocket-contracts',
];

console.log('🔍 Validating Fumadocs content structure...\n');

// Check directory structure
console.log('📁 Checking directory structure...');
for (const dir of requiredDirs) {
  const dirPath = path.join(contentDir, dir);
  if (!fs.existsSync(dirPath)) {
    errors.push(`Missing required directory: ${dir}`);
  } else {
    console.log(`  ✓ ${dir}/`);
  }
}

// Check library subdirectories
console.log('\n📚 Checking library structure...');
const librariesDir = path.join(contentDir, 'libraries');
if (fs.existsSync(librariesDir)) {
  for (const lib of requiredLibraries) {
    const libPath = path.join(librariesDir, lib);
    if (!fs.existsSync(libPath)) {
      errors.push(`Missing library directory: libraries/${lib}`);
    } else {
      console.log(`  ✓ libraries/${lib}/`);
    }
  }
}

// Validate meta.json files
console.log('\n🔧 Validating meta.json files...');

function validateMetaJson(metaPath, dirPath) {
  if (!fs.existsSync(metaPath)) {
    warnings.push(`Missing meta.json: ${path.relative(contentDir, dirPath)}`);
    return;
  }

  try {
    const content = fs.readFileSync(metaPath, 'utf-8');
    const meta = JSON.parse(content);

    // Validate structure
    if (!meta.title) {
      errors.push(`meta.json missing title: ${path.relative(contentDir, metaPath)}`);
    }

    if (!meta.pages || !Array.isArray(meta.pages)) {
      errors.push(`meta.json missing or invalid pages array: ${path.relative(contentDir, metaPath)}`);
      return;
    }

    // Validate referenced pages exist
    for (const page of meta.pages) {
      const pageSlug = typeof page === 'string' ? page : page.url;
      
      if (typeof page === 'object' && page.external) {
        continue; // Skip external links
      }

      const pagePath = path.join(dirPath, `${pageSlug}.mdx`);
      if (!fs.existsSync(pagePath)) {
        errors.push(`Referenced page doesn't exist: ${path.relative(contentDir, pagePath)}`);
      }
    }

    console.log(`  ✓ ${path.relative(contentDir, metaPath)}`);
  } catch (error) {
    errors.push(`Invalid JSON in ${path.relative(contentDir, metaPath)}: ${error.message}`);
  }
}

// Walk directory tree and validate meta.json files
function walkDir(dir) {
  const metaPath = path.join(dir, 'meta.json');
  validateMetaJson(metaPath, dir);

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      walkDir(path.join(dir, entry.name));
    }
  }
}

walkDir(contentDir);

// Validate MDX frontmatter
console.log('\n📝 Validating MDX frontmatter...');

function validateMdxFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    errors.push(`Missing frontmatter: ${path.relative(contentDir, filePath)}`);
    return;
  }

  const frontmatter = frontmatterMatch[1];
  
  // Check for required fields
  if (!frontmatter.includes('title:')) {
    errors.push(`Missing title in frontmatter: ${path.relative(contentDir, filePath)}`);
  }

  if (!frontmatter.includes('description:')) {
    errors.push(`Missing description in frontmatter: ${path.relative(contentDir, filePath)}`);
  }

  console.log(`  ✓ ${path.relative(contentDir, filePath)}`);
}

function validateMdxFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      validateMdxFiles(fullPath);
    } else if (entry.name.endsWith('.mdx')) {
      validateMdxFile(fullPath);
    }
  }
}

validateMdxFiles(contentDir);

// Check for broken internal links
console.log('\n🔗 Checking for broken internal links...');

function checkLinks(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      checkLinks(fullPath);
    } else if (entry.name.endsWith('.mdx')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Find markdown links [text](url)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = linkRegex.exec(content)) !== null) {
        const linkUrl = match[2];
        
        // Skip external links
        if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
          continue;
        }
        
        // Skip anchor links
        if (linkUrl.startsWith('#')) {
          continue;
        }
        
        // Check if internal link target exists
        let targetPath;
        if (linkUrl.startsWith('/')) {
          // Absolute path
          targetPath = path.join(contentDir, linkUrl.replace(/^\//, '') + '.mdx');
        } else {
          // Relative path
          targetPath = path.join(path.dirname(fullPath), linkUrl + '.mdx');
        }
        
        if (!fs.existsSync(targetPath)) {
          warnings.push(
            `Potential broken link in ${path.relative(contentDir, fullPath)}: ${linkUrl}`
          );
        }
      }
    }
  }
}

checkLinks(contentDir);

// Print results
console.log('\n' + '='.repeat(60));
console.log('Validation Results');
console.log('='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ All validations passed!');
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`\n❌ Found ${errors.length} error(s):\n`);
  errors.forEach((error, i) => {
    console.log(`  ${i + 1}. ${error}`);
  });
}

if (warnings.length > 0) {
  console.log(`\n⚠️  Found ${warnings.length} warning(s):\n`);
  warnings.forEach((warning, i) => {
    console.log(`  ${i + 1}. ${warning}`);
  });
}

console.log('\n' + '='.repeat(60));

// Exit with error code if there are errors
process.exit(errors.length > 0 ? 1 : 0);
