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

export const AU_BEGINNER: ElectionStep[] = [
  step('au_b1', 1, 'Is voting compulsory?', 'Australia\'s unique rule.',
    'In Australia, voting is a legal requirement for all eligible citizens aged 18 and over. This "compulsory voting" system has been in place for federal elections since 1924. If you fail to vote without a valid and sufficient reason, you may be issued a fine (currently around $20 for the first offense). This policy ensures high voter turnout and that the government represents a broad cross-section of the population.',
    'You must vote by law if you are 18+.',
    'Ongoing',
    ['Australian Citizenship', 'Age 18+ on polling day', 'Enrollment with the AEC', 'No mental incapacity (legal definition)', 'No serving a prison sentence of 3+ years'],
    ['Enrol as soon as you turn 18', 'Update your details on the AEC website', 'Check your enrollment status before every election', 'Know your rights for assistance at the booth'],
    'Is voting mandatory?', ['Yes', 'No', 'Only for men', 'Only for landowners'], 0, 'Australia was a pioneer in compulsory voting.'),
  step('au_b2', 2, 'Preferential Voting', 'The 1, 2, 3 system.',
    'Australia uses a "Preferential Voting" system, which is a form of ranked-choice voting. Instead of just picking one candidate, you rank them in order of preference (1, 2, 3...). If your first-choice candidate is eliminated, your vote is transferred to your next preferred candidate. This continues until one candidate receives an absolute majority of votes, ensuring the winner has the broadest possible support.',
    'Don\'t just pick one; rank them all.',
    'Election Day',
    ['Ranked choice knowledge', 'Ballot marking (Numbers only)', 'Candidate preference list', 'Understanding of major vs minor parties'],
    ['Your vote is never "wasted" in this system', 'Mark EVERY box for a valid House vote', 'Check the AEC "How to Vote" guide', 'Research independent candidates carefully'],
    'How do you mark the ballot?', ['Checkmark', 'Numbers (1, 2, 3)', 'X', 'Signature'], 1, 'Numbers are required.'),
  step('au_b3', 3, 'The House and Senate', 'Two ballots, two colors.',
    'On federal election day, you will receive two separate ballot papers. The green ballot is for the House of Representatives, where you choose a local member for your specific electorate. The large white ballot is for the Senate, where you choose representatives for your whole state or territory. For the Senate, you can choose to vote "above the line" (for a party) or "below the line" (for individual candidates).',
    'Two houses, two different voting styles.',
    'Election Day',
    ['House (Green) ballot', 'Senate (White) ballot', 'State/Territory identification', 'Pencil (provided at booth)'],
    ['Vote "above the line" for easy Senate voting', 'Use numbers 1-6 above the line for Senate', 'Ensure you follow the instructions on the ballot paper', 'Ask for help if you find the Senate ballot confusing'],
    'Green ballot color?', ['House', 'Senate', 'Mayor', 'None'], 0, 'Green is for the House of Reps.'),
  step('au_b4', 4, 'The Sausage Sizzle', 'Election day culture.',
    'Voting in Australia is often a community event. Most polling stations, located in local primary schools and community halls, host a "Democracy Sausage" sizzle run by volunteers. Many also hold cake stalls and school fetes. This tradition has become a beloved part of the Australian election day experience, with websites even tracking which polling booths have the best sausage sizzles.',
    'Vote, then get a snack.',
    'Election Day',
    ['Hunger!', 'Small change/cash', 'Community spirit', 'Saturday morning free time'],
    ['Look for the best sausage sizzle in your area', 'Bring cash for the sausage sizzle and cakes', 'Vote early to get the freshest sausages', 'Check "Democracy Sausage" maps online'],
    'What is a "Democracy Sausage"?', ['A law', 'A snack', 'A candidate', 'A medal'], 1, 'It is a beloved tradition.'),
  step('au_b5', 5, 'Where to Vote', 'Local booths.',
    'Federal elections in Australia are always held on a Saturday. You can vote at any polling place in your state or territory on election day, or you can visit an early voting center in the weeks prior if you cannot make it on the day. Polling places are open from 8am to 6pm. Postal voting and telephone voting are also available for those with specific needs or living in remote areas.',
    'Saturdays are for voting.',
    'Saturday Election Day (8am - 6pm)',
    ['Polling station location', 'Electoral district knowledge', 'Voter identification (not always required)', 'Early voting eligibility (if applicable)'],
    ['Absentee voting is available if you are out of your district', 'Check the AEC website for booth locations', 'Avoid the lunchtime rush for shorter queues', 'Keep your voter registration card handy'],
    'Usual day for elections?', ['Tuesday', 'Saturday', 'Sunday', 'Friday'], 1, 'Saturday is the standard.'),
];
