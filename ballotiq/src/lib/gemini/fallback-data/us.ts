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

export const US_BEGINNER: ElectionStep[] = [
  step('us_b1', 1, 'Am I Eligible to Vote?', 'Fundamental requirements for US voters.',
    'To vote in U.S. federal elections, you must be a U.S. citizen (either by birth or naturalization) and at least 18 years old by Election Day. You must also meet your state’s residency requirements. People with felony convictions or mental incapacity may be restricted from voting depending on their state\'s laws. You cannot vote in the US if you are a non-citizen, even if you are a permanent resident.',
    'You need US citizenship and to be 18 years old to vote.',
    'Ongoing',
    ['U.S. Citizenship', 'Age 18+ by Election Day', 'State Residency requirements', 'No disqualifying felony (varies)', 'Proper identification'],
    ['Check your state\'s rules at vote.gov', 'Verify registration status after moving', 'Apply for citizenship if you are a resident', 'Know your rights if you have a disability'],
    'What is the minimum age to vote in US federal elections?', ['16', '18', '21', '25'], 1, 'The 26th Amendment set this.'),
  step('us_b2', 2, 'How to Register to Vote', 'Getting into the system.',
    'Most states require you to register before you can vote. You can register online, by mail, or in person at local election offices, motor vehicle departments (DMV), or recruitment centers. Some states allow "Same Day Registration" where you can register and vote on the same day. Deadlines vary by state, often ranging from 15 to 30 days before the election.',
    'Registering is like signing up for a membership before you can use the service.',
    'Varies by state (usually 30 days before)',
    ['Social Security Number or State ID', 'Proof of residence', 'Completed Registration Form', 'Birth certificate (sometimes)'],
    ['Register early to avoid deadlines', 'Use the National Mail Voter Registration Form', 'Update your name if it changes', 'Check for automatic voter registration in your state'],
    'Which state does NOT require registration?', ['Texas', 'New York', 'California', 'North Dakota'], 3, 'North Dakota is unique.'),
  step('us_b3', 3, 'Primary vs. General Elections', 'The two stages of choosing leaders.',
    'Primary elections (and caucuses) are held by political parties to choose their candidates for the General Election. Some states have "closed" primaries where only registered party members can vote. The General Election in November is the final contest where winners take office. This includes the Presidential race every four years, and Congressional races every two years.',
    'Primaries are tryouts; General is the final game.',
    'Spring/Summer (Primaries), November (General)',
    ['Party affiliation (for closed primaries)', 'Voter registration card', 'Knowledge of candidates'],
    ['Check if your state has open or closed primaries', 'Look up local ballot measures', 'Understand the electoral college system', 'Participate in caucuses if applicable'],
    'What is the purpose of a primary?', ['To elect the President', 'To choose party nominees', 'To vote on laws', 'To select judges'], 1, 'It is a selection process.'),
  step('us_b4', 4, 'Understanding the Ballot', 'Decoding the many races.',
    'Your ballot includes federal offices (President, Senate, House), state offices (Governor, State Legislature), and local positions (Mayor, School Board). It may also feature ballot initiatives or propositions—laws proposed by citizens. You can choose to vote for all offices or skip any you don\'t feel informed about. This is called "undervoting" and does not invalidate the rest of your ballot.',
    'A ballot is a menu of choices; pick what you like.',
    'Election Day',
    ['Sample Ballot review', 'Marking device (pen/screen)', 'Instruction reading'],
    ['Look up a sample ballot online before you go', 'Research "down-ballot" local races', 'Read proposition summaries carefully', 'Ask for a new ballot if you make a mistake'],
    'Can you skip a race on your ballot?', ['No', 'Yes', 'Only with a fee', 'Only with a witness'], 1, 'This is called undervoting.'),
  step('us_b5', 5, 'Voting Methods', 'How to cast your vote.',
    'You can vote in person on Election Day at your assigned polling place, or many states offer "Early Voting" in the weeks prior. Alternatively, you can vote by mail (absentee) by requesting a ballot, filling it out, and returning it via mail or a secure drop box. If you are in line when polls close on Election Day, the law requires that you be allowed to cast your vote.',
    'Pick a delivery method: in person, early, or by mail.',
    'Election Day (November)',
    ['Valid ID (depends on state)', 'Mail-in ballot application', 'Poll worker assistance'],
    ['If you are in line when polls close, stay in line!', 'Use secure drop boxes for mail ballots', 'Check your polling place location yearly', 'Volunteer as a poll worker'],
    'When is the General Election held?', ['Monday', 'Tuesday after first Monday', 'Friday', 'Sunday'], 1, 'It is always a Tuesday.'),
];
