import type { LexicalEditor } from 'lexical';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical';

import type { TextFormatType } from './types';

/**
 * Applies or removes text formatting to the current selection
 * @param editor - The Lexical editor instance
 * @param formatType - The format to apply/remove
 */
export function toggleTextFormat(editor: LexicalEditor, formatType: TextFormatType): void {
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, formatType);
}

/**
 * Checks if the current selection has a specific format applied
 * @param editor - The Lexical editor instance
 * @param formatType - The format to check
 * @returns boolean indicating if the format is active
 */
export function isFormatActive(editor: LexicalEditor, formatType: TextFormatType): boolean {
  let isActive = false;
  
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      switch (formatType) {
        case 'bold':
          isActive = selection.hasFormat('bold');
          break;
        case 'italic':
          isActive = selection.hasFormat('italic');
          break;
        case 'underline':
          isActive = selection.hasFormat('underline');
          break;
        case 'strikethrough':
          isActive = selection.hasFormat('strikethrough');
          break;
      }
    }
  });
  
  return isActive;
}

/**
 * Gets all active formats for the current selection
 * @param editor - The Lexical editor instance
 * @returns Array of active format types
 */
export function getActiveFormats(editor: LexicalEditor): TextFormatType[] {
  const activeFormats: TextFormatType[] = [];
  
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (selection.hasFormat('bold')) activeFormats.push('bold');
      if (selection.hasFormat('italic')) activeFormats.push('italic');
      if (selection.hasFormat('underline')) activeFormats.push('underline');
      if (selection.hasFormat('strikethrough')) activeFormats.push('strikethrough');
    }
  });
  
  return activeFormats;
}

/**
 * Keyboard shortcut mapping for text formatting
 */
export const FORMATTING_SHORTCUTS = {
  bold: { key: 'b', modifier: true, shift: false },
  italic: { key: 'i', modifier: true, shift: false },
  underline: { key: 'u', modifier: true, shift: false },
  strikethrough: { key: 's', modifier: true, shift: true },
} as const;

/**
 * Gets the keyboard shortcut string for a format type
 * @param formatType - The format type
 * @returns Human-readable shortcut string
 */
export function getFormattingShortcut(formatType: TextFormatType): string {
  const isMac = typeof window !== 'undefined' && window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? 'Cmd' : 'Ctrl';
  
  const shortcut = FORMATTING_SHORTCUTS[formatType];
  let shortcutString = `${modifierKey}+${shortcut.key.toUpperCase()}`;
  
  if (shortcut.shift) {
    shortcutString = `${modifierKey}+Shift+${shortcut.key.toUpperCase()}`;
  }
  
  return shortcutString;
}