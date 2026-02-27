/**
 * One-time script to generate .docx template files for the Template Library.
 * Run with: node scripts/generate-templates.mjs
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '..', 'public', 'templates');
mkdirSync(outputDir, { recursive: true });

const accessLevelDescriptions = {
  general: 'Available to all employees',
  executive: 'Restricted to executive leadership',
  board: 'Board members only — strictly confidential',
};

function makePlaceholder(text) {
  return new Paragraph({
    children: [new TextRun({ text: `[${text}]`, italics: true, color: '888888' })],
    spacing: { after: 200 },
  });
}

function makeHeading1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { after: 200 } });
}

function makeHeading2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } });
}

function makeBody(text) {
  return new Paragraph({ text, spacing: { after: 150 } });
}

function makeBullet(text) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 100 },
  });
}

function makeDivider() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC', space: 1 } },
    spacing: { after: 200 },
  });
}

// ── Policy template sections ──────────────────────────────────────────────────
function policyChildren(title, accessLevel) {
  return [
    makeHeading1(title),
    makeBody(`Access Level: ${accessLevelDescriptions[accessLevel]}`),
    makeDivider(),
    makeHeading2('1. Purpose'),
    makePlaceholder('Describe the purpose and intent of this policy'),
    makeHeading2('2. Scope'),
    makePlaceholder('Define who this policy applies to and any exclusions'),
    makeHeading2('3. Policy Statement'),
    makePlaceholder('State the formal policy position of the organization'),
    makeHeading2('4. Roles and Responsibilities'),
    makeBullet('Policy Owner: [Name/Role]'),
    makeBullet('Compliance Contact: [Name/Role]'),
    makeBullet('All Employees/Executives/Board Members: [Responsibilities]'),
    makeHeading2('5. Procedures'),
    makePlaceholder('Outline the steps and procedures to implement this policy'),
    makeHeading2('6. Exceptions'),
    makePlaceholder('Describe the process for requesting exceptions to this policy'),
    makeHeading2('7. Non-Compliance'),
    makePlaceholder('Describe consequences for non-compliance'),
    makeHeading2('8. Review and Update Schedule'),
    makeBody('This policy will be reviewed annually or as required by regulatory changes.'),
    makePlaceholder('Next review date: [Date]'),
    makeHeading2('9. Document Control'),
    makeBody('Version: [Version Number]'),
    makeBody('Effective Date: [Date]'),
    makeBody('Approved By: [Name/Role]'),
    makeBody('Last Updated: [Date]'),
  ];
}

// ── Process template sections ─────────────────────────────────────────────────
function processChildren(title, accessLevel) {
  return [
    makeHeading1(title),
    makeBody(`Access Level: ${accessLevelDescriptions[accessLevel]}`),
    makeDivider(),
    makeHeading2('1. Process Overview'),
    makePlaceholder('Provide a brief description of this process and its business purpose'),
    makeHeading2('2. Scope'),
    makePlaceholder('Define which teams, systems, or scenarios this process covers'),
    makeHeading2('3. Prerequisites'),
    makeBullet('[Prerequisite 1]'),
    makeBullet('[Prerequisite 2]'),
    makeHeading2('4. Process Steps'),
    makeBullet('Step 1: [Action] — [Responsible Party]'),
    makeBullet('Step 2: [Action] — [Responsible Party]'),
    makeBullet('Step 3: [Action] — [Responsible Party]'),
    makeBullet('Step 4: [Action] — [Responsible Party]'),
    makeBullet('Step 5: [Action] — [Responsible Party]'),
    makeHeading2('5. Decision Points'),
    makePlaceholder('Describe any key decision gates or approval checkpoints in this process'),
    makeHeading2('6. Escalation Path'),
    makeBullet('Level 1: [Role] — [Trigger condition]'),
    makeBullet('Level 2: [Role] — [Trigger condition]'),
    makeHeading2('7. Tools and Systems'),
    makePlaceholder('List relevant systems, tools, or platforms used in this process'),
    makeHeading2('8. Metrics and SLAs'),
    makePlaceholder('Define key performance indicators and service level agreements'),
    makeHeading2('9. Document Control'),
    makeBody('Version: [Version Number]'),
    makeBody('Process Owner: [Name/Role]'),
    makeBody('Effective Date: [Date]'),
    makeBody('Last Updated: [Date]'),
  ];
}

// ── Checklist template sections ───────────────────────────────────────────────
function checklistChildren(title, accessLevel) {
  return [
    makeHeading1(title),
    makeBody(`Access Level: ${accessLevelDescriptions[accessLevel]}`),
    makeDivider(),
    makeHeading2('Purpose'),
    makePlaceholder('Describe what this checklist is used for and when to use it'),
    makeHeading2('Frequency'),
    makePlaceholder('e.g., Daily / Weekly / Monthly / Per Event'),
    makeHeading2('Responsible Party'),
    makePlaceholder('[Role or Team Name]'),
    makeDivider(),
    makeHeading2('Section 1: [Category Name]'),
    makeBullet('☐  [Task or check item 1]'),
    makeBullet('☐  [Task or check item 2]'),
    makeBullet('☐  [Task or check item 3]'),
    makeHeading2('Section 2: [Category Name]'),
    makeBullet('☐  [Task or check item 1]'),
    makeBullet('☐  [Task or check item 2]'),
    makeBullet('☐  [Task or check item 3]'),
    makeHeading2('Section 3: [Category Name]'),
    makeBullet('☐  [Task or check item 1]'),
    makeBullet('☐  [Task or check item 2]'),
    makeBullet('☐  [Task or check item 3]'),
    makeDivider(),
    makeHeading2('Sign-off'),
    makeBody('Completed by: _______________________  Date: ___________'),
    makeBody('Reviewed by: _______________________  Date: ___________'),
    makeHeading2('Notes'),
    makePlaceholder('Additional notes or observations'),
    makeHeading2('Document Control'),
    makeBody('Version: [Version Number]'),
    makeBody('Owner: [Name/Role]'),
    makeBody('Last Updated: [Date]'),
  ];
}

// ── Template definitions ──────────────────────────────────────────────────────
const templates = [
  { type: 'policy',    level: 'general',   title: 'General Policy Template' },
  { type: 'policy',    level: 'executive', title: 'Executive Policy Template' },
  { type: 'policy',    level: 'board',     title: 'Board Policy Template' },
  { type: 'process',   level: 'general',   title: 'General Process Template' },
  { type: 'process',   level: 'executive', title: 'Executive Process Template' },
  { type: 'process',   level: 'board',     title: 'Board Process Template' },
  { type: 'checklist', level: 'general',   title: 'General Checklist Template' },
  { type: 'checklist', level: 'executive', title: 'Executive Checklist Template' },
  { type: 'checklist', level: 'board',     title: 'Board Checklist Template' },
];

const childrenBuilders = {
  policy: policyChildren,
  process: processChildren,
  checklist: checklistChildren,
};

for (const { type, level, title } of templates) {
  const doc = new Document({
    creator: 'PolicyAi',
    title,
    description: `${title} — ${accessLevelDescriptions[level]}`,
    sections: [
      {
        properties: {},
        children: childrenBuilders[type](title, level),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filePath = join(outputDir, `${type}-${level}.docx`);
  writeFileSync(filePath, buffer);
  console.log(`Created: ${filePath}`);
}

console.log('\nAll 9 templates generated successfully.');
