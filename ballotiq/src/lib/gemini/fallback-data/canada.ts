import type { ElectionStep } from '@/types';

function step(
  id: string, order: number, title: string, desc: string,
  detailed: string, simple: string, timeline: string,
  reqs: string[], tips: string[], quizQ: string,
  quizOpts: string[], correctIdx: number, hint: string
): ElectionStep {
  return {
    id, order, title, description: desc,
    detailedExplanation: detailed, simpleExplanation: simple,
    timeline, requirements: reqs, tips, status: 'locked',
    microQuizQuestion: { question: quizQ, options: quizOpts, correctIndex: correctIdx, hint },
  };
}

export const CA_BEGINNER: ElectionStep[] = [
  step('ca_b1', 1, 'Am I Eligible?', 'Canadian citizenship rules.',
    'To vote in a Canadian federal election, you must be a Canadian citizen and at least 18 years old on election day. You must also be registered on the National Register of Electors. Canadians living abroad can vote by special ballot regardless of how long they have been away. Permanent residents and other non-citizens are not eligible to vote in federal elections.',
    'Citizenship and 18 years old.',
    'Ongoing',
    ['Canadian Citizenship', 'Age 18+ by election day', 'National Register of Electors entry', 'Proof of identity', 'Proof of address'],
    ['Check your registration at Elections Canada', 'Register at age 17 to be ready for 18', 'Apply for citizenship if you are a resident', 'Know your rights if you are an overseas voter'],
    'Age?', ['16', '18', '21', '25'], 1, '18 is the law.'),
  step('ca_b2', 2, 'Registration', 'Getting on the list.',
    'Elections Canada maintains the voter list. You can check if you are registered, update your information, or register for the first time online. If you are not registered by election day, you can still register at the polling station just before you vote, as long as you have the required ID. Most Canadians are registered automatically through tax filings if they give consent.',
    'Registration is easy and can even be done when you arrive to vote.',
    'Until Election Day',
    ['ID and Proof of Address', 'Voter Information Card (if received)', 'Tax filing consent (optional)', 'Online registration access'],
    ['Registering in advance saves time at the polls', 'Check your Voter Information Card for accuracy', 'Bring your card and ID together', 'Ask for a language interpreter if needed'],
    'Can you register at the polls?', ['Yes', 'No', 'Only in Yukon', 'Only with a lawyer'], 0, 'Canada allows same-day registration.'),
  step('ca_b3', 3, 'First Past the Post', 'Constituency wins.',
    'Canada uses the "First-Past-the-Post" system for federal elections. The country is divided into 338 electoral districts, also known as ridings. Voters in each riding elect one Member of Parliament (MP) to represent them in the House of Commons. The candidate with the most votes in the riding wins the seat. The leader of the party with the most seats usually becomes the Prime Minister.',
    'Whoever gets the most votes in your area becomes your MP.',
    'Election Day',
    ['Riding/District knowledge', 'Candidate names', 'Party platform summaries', 'Understanding of minority governments'],
    ['The party with the most seats usually forms the government', 'Research the local candidate\'s priorities', 'Understand how a "Confidence" vote works', 'Know the boundaries of your riding'],
    'How many ridings?', ['300', '338', '400', '450'], 1, '338 is the current count.'),
  step('ca_b4', 4, 'Ways to Vote', 'Advance and mail.',
    'Elections Canada provides several ways to vote. You can vote in person on election day at your assigned polling station, or during four days of advance polling. You can also vote at any Elections Canada office across the country before a specific deadline. Finally, you can vote by mail using a special ballot, which is a popular option for students and travelers.',
    'Vote early if you are busy on election day.',
    'Election Day and 4 days of advance polling',
    ['Voter Information Card', 'Special ballot application (for mail)', 'Polling station location', 'Valid identification'],
    ['Bring your Voter Information Card to speed things up', 'Vote at advance polls to avoid crowds', 'Apply for mail-in ballots weeks in advance', 'Check office hours if voting at an EC office'],
    'Advance polling?', ['Yes', 'No', 'Only for military', 'Only for seniors'], 0, 'Advance polls are open for everyone.'),
  step('ca_b5', 5, 'Required ID', 'Proving who you are.',
    'To vote, you must prove your identity and address. There are three options: 1) Present one government-issued photo ID with your name and current address (like a driver\'s license). 2) Present two pieces of ID, both with your name and at least one with your current address (like a health card and a utility bill). 3) If you have no ID, you can declare your identity in writing and have someone else "vouch" for you.',
    'You need ID, but there are many ways to prove it.',
    'Election Day',
    ['Accepted ID (Option 1, 2, or 3)', 'Utility bill or bank statement', 'Witness for vouching (if needed)', 'Voter Information Card'],
    ['Check the list of accepted IDs at elections.ca', 'Ensure your address is current on your ID', 'Someone can vouch for you if you lack ID', 'Expired ID is sometimes accepted (check rules)'],
    'Vouching?', ['Yes', 'No', 'Only in 2024', 'None'], 0, 'Someone can vouch for you if you lack ID.'),
];
