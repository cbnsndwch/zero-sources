#!/usr/bin/env node
/**
 * Post-processor for API Documenter output
 * Adds YAML frontmatter to generated markdown files for Fumadocs compatibility
 * 
 * Run this after api-documenter generates documentation
 * Usage: node apps/docs/scripts/add-frontmatter-to-api-docs.mjs
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, basename, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const API_DOCS_DIR = join(__dirname, '..', 'content', 'api');

/**
 * Extract a title from markdown content
 * @param {string} content - The markdown content
 * @param {string} filename - The filename as fallback
 * @returns {string} - The extracted title
 */
function extractTitle(content, filename) {
  // Try to find the first ## heading (API Documenter uses this for main title)
  const headingMatch = content.match(/^##\s+(.+?)(?:\s+\{#.*?\})?\s*$/m);
  if (headingMatch) {
    // Remove markdown formatting and links
    return headingMatch[1]
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
      .replace(/`/g, '') // Remove code formatting
      .replace(/\*\*/g, '') // Remove bold
      .trim();
  }

  // Fallback to filename (remove extension and convert dashes/dots to spaces)
  return basename(filename, '.md')
    .replace(/\./g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Check if file already has frontmatter
 * @param {string} content - The file content
 * @returns {boolean}
 */
function hasFrontmatter(content) {
  return content.trimStart().startsWith('---\n');
}

/**
 * Add frontmatter to markdown content
 * @param {string} content - The original content
 * @param {string} title - The title to add
 * @returns {string} - Content with frontmatter
 */
function addFrontmatter(content, title) {
  // Preserve the API Documenter comment if it exists
  const lines = content.split('\n');
  let commentLines = [];
  let startIndex = 0;

  // Extract HTML comments at the start
  if (lines[0]?.trim().startsWith('<!--')) {
    let inComment = true;
    for (let i = 0; i < lines.length; i++) {
      if (inComment) {
        commentLines.push(lines[i]);
        if (lines[i].includes('-->')) {
          inComment = false;
          startIndex = i + 1;
          // Skip empty line after comment
          if (lines[i + 1]?.trim() === '') {
            startIndex = i + 2;
          }
          break;
        }
      }
    }
  }

  const remainingContent = lines.slice(startIndex).join('\n').trimStart();

  const frontmatter = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    '---',
    ''
  ].join('\n');

  if (commentLines.length > 0) {
    return commentLines.join('\n') + '\n\n' + frontmatter + remainingContent;
  }

  return frontmatter + remainingContent;
}

/**
 * Process a single markdown file
 * @param {string} filePath - Path to the file
 */
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');

    // Skip if already has frontmatter
    if (hasFrontmatter(content)) {
      console.log(`  ⏭️  Skipped (has frontmatter): ${relative(API_DOCS_DIR, filePath)}`);
      return;
    }

    const filename = basename(filePath);
    const title = extractTitle(content, filename);
    const newContent = addFrontmatter(content, title);

    await writeFile(filePath, newContent, 'utf-8');
    console.log(`  ✅ Added frontmatter: ${relative(API_DOCS_DIR, filePath)}`);
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Recursively process all markdown files in a directory
 * @param {string} dir - Directory path
 */
async function processDirectory(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`⚠️  Directory not found: ${dir}`);
    } else {
      throw error;
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔧 Adding frontmatter to API documentation files...\n');

  try {
    await processDirectory(API_DOCS_DIR);
    console.log('\n✨ Done! All API documentation files now have frontmatter.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
