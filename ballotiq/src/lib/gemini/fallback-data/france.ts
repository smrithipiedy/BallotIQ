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

export const FR_BEGINNER: ElectionStep[] = [
  step('fr_b1', 1, 'Am I eligible?', 'French citizenship rules.',
    'To vote in French national elections, you must be a French citizen and at least 18 years old. You must also enjoy your civil and political rights. If you are a citizen of another European Union member state, you can vote in municipal and European elections, but not in presidential or legislative ones. Most young people are now automatically registered when they turn 18.',
    'French nationality and 18 years old are the keys.',
    'Ongoing',
    ['French Citizenship', 'Age 18+', 'Registration on electoral list', 'Civil rights enjoyment', 'Proof of identity'],
    ['18-year-olds are often registered automatically', 'Check your status on service-public.fr', 'Update address if you move within France', 'Keep your voter card safe'],
    'Minimum age?', ['16', '18', '21', '25'], 1, '18 is the legal age.'),
  step('fr_b2', 2, 'Registration', 'Getting on the list.',
    'Registration is mandatory to vote. You can register at any time of the year, but for a specific election, you must register by the 6th Friday before the first round. You can register online at service-public.fr, by mail, or in person at your local town hall (Mairie). You will need a valid ID and a proof of address less than three months old.',
    'Register at least 6 weeks before the vote.',
    'Until 6th Friday before vote',
    ['Valid ID (Passport/CNI)', 'Proof of Address (Utility bill)', 'Registration Form (Cerfa)', 'Town Hall contact'],
    ['Report address changes immediately', 'Register online for the fastest experience', 'Ensure your proof of address is recent', 'Ask for a receipt after registration'],
    'Where to register?', ['Police', 'Town Hall', 'Post Office', 'Bank'], 1, 'Town hall (Mairie) is the place.'),
  step('fr_b3', 3, 'The Two-Round System', 'Runoff mechanics.',
    'France uses a two-round uninominal voting system for presidential and legislative elections. If no candidate wins an absolute majority (over 50%) in the first round, a second round is held two weeks later between the top two candidates. This system encourages the formation of broad political alliances and ensures that the final winner has significant majority support.',
    'Round 1 is for your heart; Round 2 is for your choice.',
    'Sunday and Sunday + 14 days',
    ['Knowledge of runoff dates', 'Understanding of majority rules', 'Candidate platform comparison', 'Dual-ballot strategy'],
    ['The second round is a direct duel', 'Check if your preferred candidate made the cut', 'Abstention in round 2 still impacts the outcome', 'Understand the "republican front" concept'],
    'How many in the 2nd round?', ['All', '3', '2', '1'], 2, 'It is a duel.'),
  step('fr_b4', 4, 'How to Vote', 'Polling station rituals.',
    'On election day, you go to your assigned polling station. You must take a ballot for each candidate (to preserve secrecy) and an envelope. You then enter the voting booth (mandatory), put your chosen ballot in the envelope, and exit. After presenting your ID and voter card to the officials, you slide the envelope into the transparent ballot box. The official then announces "A voté!" while signing the register.',
    'The president says "A voté!" after you slide the envelope.',
    'Election Day',
    ['Photo ID (Passport/CNI)', 'Voter Card (recommended)', 'Knowledge of station location', 'Assigned booth number'],
    ['Booth passage is mandatory', 'Take at least two different ballots', 'Leave your phone in your pocket', 'Polling stations usually open at 8am'],
    'Official phrase?', ['Done', 'A voté!', 'Bravo', 'Next'], 1, 'A voté! is the standard.'),
  step('fr_b5', 5, 'President and Parliament', 'The goals of the vote.',
    'The President of the Republic is the head of state, elected by direct universal suffrage for a five-year term, known as the "Quinquennat." The National Assembly is the lower house of Parliament, where deputies make and vote on laws. If the President and the Assembly majority are from different parties, a "cohabitation" occurs, requiring the President to appoint a Prime Minister from the opposing majority.',
    'You vote for the leader and the law-makers.',
    'Every 5 years',
    ['Candidate platform awareness', 'Knowledge of institutional roles', 'Election calendar awareness', 'Political party understanding'],
    ['A cohabitation occurs when they are from different parties', 'The President cannot serve more than two terms', 'Legislative elections usually follow the Presidential one', 'Research the powers of the Prime Minister'],
    '5-year mandate?', ['Triennat', 'Quinquennat', 'Septennat', 'None'], 1, 'Quinquennat is the name.'),
];
