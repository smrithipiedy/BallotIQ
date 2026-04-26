import fs from 'fs';
const path = 'c:\\Users\\smrit\\OneDrive\\Documents\\GitHub\\BallotIQ\\ballotiq\\src\\lib\\gemini\\fallback.ts';
let content = fs.readFileSync(path, 'utf8');

const contractions = ["isn't", "aren't", "don't", "doesn't", "won't", "can't", "it's", "voter's", "country's", "candidate's", "government's", "India's", "ECI's", "U.S.'s", "state's"];

contractions.forEach(c => {
  const escaped = c.replace("'", "\\'");
  const regex = new RegExp(c, 'g');
  content = content.replace(regex, escaped);
});

fs.writeFileSync(path, content);
console.log('Fixed contractions in fallback.ts');
