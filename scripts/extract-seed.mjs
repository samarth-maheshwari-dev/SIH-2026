// Fix seedData.js — extract SKILLS + ROLES + COURSES cleanly
// Source order: SKILLS(1803) ROLES(5370) PERSONAS(8075) COURSES(12380) PROFILES(19508)
import fs from 'fs';

const src = fs.readFileSync('src/data/mockData.ts', 'utf8');

function grab(from, to) {
  const a = src.indexOf('export const ' + from);
  const b = src.indexOf('export const ' + to);
  if (a === -1 || b === -1 || b < a) throw new Error(`bad bounds ${from}->${to}: ${a},${b}`);
  return src.slice(a, b);
}

let block = grab('MOCK_SKILLS', 'MOCK_PERSONAS')   // skills + roles (personas excluded)
  + '\n\n'
  + src.slice(src.indexOf('export const MOCK_COURSES'), src.indexOf('const mkScore')); // courses only

block = block
  .replace('export const MOCK_SKILLS: Skill[] =', 'export const SKILLS =')
  .replace('export const MOCK_ROLES: RoleRequirement[] =', 'export const ROLES =')
  .replace('export const MOCK_COURSES: Course[] =', 'export const COURSES =');

fs.writeFileSync('server/seedData.js',
  '// AUTO-SEED from src/data/mockData.ts — real NSSTA/MoSPI curriculum\n' + block + '\n');

console.log('written:', block.length, 'chars');