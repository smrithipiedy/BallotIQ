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

export const GB_BEGINNER: ElectionStep[] = [
  step('gb_b1', 1, 'Am I Eligible to Vote?', 'UK voter eligibility rules.',
    'To vote in a UK General Election, you must be a British, Irish, or qualifying Commonwealth citizen. You must also be 18 years or older on polling day and resident in the UK. Some UK citizens living abroad can also register as overseas voters. You must not be a convicted prisoner or otherwise legally disqualified from voting.',
    'You need to be 18 and a citizen of the UK, Ireland, or the Commonwealth.',
    'Ongoing',
    ['Citizenship (UK/Irish/Commonwealth)', 'Age 18+ on polling day', 'UK Resident', 'Registered on the electoral roll', 'Not legally disqualified'],
    ['Register as soon as you move house', 'Check overseas voting rules if abroad', 'Students can register at home and uni (but only vote once)', 'Encourage friends to register'],
    'What is the minimum age for a General Election?', ['16', '18', '21', '25'], 1, 'It is 18 for national elections.'),
  step('gb_b2', 2, 'Registering to Vote', 'The UK registration system.',
    'You must be on the electoral register to vote. You can register online at gov.uk/register-to-vote in about 5 minutes. You will need your National Insurance (NI) number and passport (if living abroad). Once registered, you remain on the list unless you move house or your details change. Every year, councils send a "Canvass Communication" to verify who is living at each address.',
    'You need your NI number to register online.',
    'Until 12 days before polling',
    ['National Insurance Number', 'Current Address details', 'Passport (for overseas)', 'DOB verification'],
    ['Registering helps your credit score!', 'Update your details after marriage or name change', 'Check the register if you haven\'t voted in years', 'Opt-out of the "open register" for privacy'],
    'Where do you register?', ['Post Office', 'gov.uk', 'Police', 'Library'], 1, 'The government website is the place.'),
  step('gb_b3', 3, 'First Past the Post', 'The UK voting system.',
    'The UK uses the "First Past the Post" (FPTP) system. The country is divided into 650 local areas called constituencies. On election day, you vote for one candidate to represent your area in the House of Commons. The candidate who receives the most votes (a plurality) wins the seat, regardless of whether they have a majority. The party with the most seats usually forms the Government.',
    'The person with the most votes wins, even if it is not a majority.',
    'Election Day',
    ['Local candidate knowledge', 'Constituency identification', 'Understanding the ballot paper'],
    ['Check your local candidates online', 'Research party manifestos', 'Attend local "hustings" (debates)', 'Know which constituency you live in'],
    'How many constituencies are there?', ['450', '577', '650', '700'], 2, '650 is the current total.'),
  step('gb_b4', 4, 'Voter ID Requirements', 'New rules for 2023+.',
    'As of 2023, you must show a valid form of photo identification to vote in person at polling stations for General Elections. Accepted IDs include a UK passport, driving license, Blue Badge, or older person\'s bus pass. If you do not have an accepted ID, you can apply for a free "Voter Authority Certificate" online. These rules do not apply to postal voting.',
    'No ID, no vote (unless voting by post).',
    'Election Day (ID required)',
    ['Valid Photo ID (Passport/License)', 'Voter Authority Certificate (if needed)', 'Poll card (helpful but not required)'],
    ['Apply for a free Voter Authority Certificate if you have no ID', 'Check the list of expired IDs that are still accepted', 'Ensure the photo on your ID still looks like you', 'Remind family members about the ID rules'],
    'What is mandatory for in-person voting now?', ['Poll card', 'Photo ID', 'Utility bill', 'Nothing'], 1, 'Photo ID became mandatory in 2023.'),
  step('gb_b5', 5, 'How to Vote', 'Polling stations and deadlines.',
    'On election day, you can vote in person at your assigned polling station between 7am and 10pm. You can also apply to vote by post or by proxy (someone else voting for you). If you vote by post, your ballot must reach the local office by 10pm on election day. Polling stations are often in schools, community centers, or churches.',
    'In person, by mail, or have a friend vote for you.',
    'Election Day (7am - 10pm)',
    ['Polling station location', 'Postal ballot (if applied)', 'Proxy authorization (if applied)', 'Ink pen (provided at station)'],
    ['Post your ballot back early if voting by mail', 'You don\'t need your poll card to vote in person', 'If you forget to post your ballot, drop it at a station', 'Ask poll workers for help if needed'],
    'What time do polls close?', ['6pm', '8pm', '10pm', 'Midnight'], 2, '10pm is the closing time.'),
];
