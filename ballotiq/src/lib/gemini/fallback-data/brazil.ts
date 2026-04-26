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

export const BR_BEGINNER: ElectionStep[] = [
  step('br_b1', 1, 'Is voting mandatory?', 'Brazil\'s voting rules.',
    'In Brazil, voting is a constitutional obligation for all literate citizens between the ages of 18 and 70. For those who are 16 or 17 years old, or over 70, as well as for illiterate citizens, voting is optional. Failure to vote without a valid justification can result in small fines and restrictions on obtaining a passport, taking public exams, or receiving government loans.',
    'Mandatory for adults 18-70; optional for teens and seniors.',
    'Ongoing',
    ['Brazilian Citizenship', 'Age 18-70 (Mandatory)', 'Age 16-17 or 70+ (Optional)', 'Voter Registration (Título de Eleitor)', 'No suspended political rights'],
    ['Keep your status regular to avoid fines', 'Use the e-Título app to check your status', 'Justify your absence via the app if you can\'t vote', 'Volunteer as a Mesário (poll worker) for benefits'],
    'When does voting become mandatory?', ['16', '18', '21', '70'], 1, '18 is the threshold.'),
  step('br_b2', 2, 'E-Título and Biometrics', 'Digital registration.',
    'The TSE (Superior Electoral Court) has modernized voting through the "e-Título" app, which serves as a digital version of your voter ID. It provides your polling station location and serves as identification if you have registered your biometrics. Biometric registration involves scanning your fingerprints and taking a digital photo, which significantly enhances the security of the identification process at the polls.',
    'Use the app and your fingerprint to vote securely.',
    'Pre-election',
    ['Photo ID', 'e-Título App', 'Biometric registration', 'Updated residential address', 'Smartphone for digital ID'],
    ['Register your biometrics early', 'Download the e-Título app weeks before', 'Check your polling station location in the app', 'Keep your phone charged on election day'],
    'Which app is used?', ['WhatsApp', 'e-Título', 'Gov.br', 'Wallet'], 1, 'e-Título is the official app.'),
  step('br_b3', 3, 'Electronic Voting Machines', 'Safe and disconnected.',
    'Brazil has used a 100% electronic voting system since 1996. The "Urna Eletrônica" is a purpose-built computer that is NOT connected to any network, including the internet or Bluetooth, making it highly secure against external hacking. Each machine undergoes rigorous public testing before each election. You cast your vote by simply typing the candidate\'s number and pressing the green "Confirma" button.',
    'Typing your candidate\'s number is quick and secure.',
    'Election Day',
    ['Candidate numbers (memo)', 'Poll station location', 'Valid identification', 'Knowledge of the ballot order'],
    ['Check the candidate photo on the screen', 'Press "Corrige" if you type the wrong number', 'Wait for the final "Fim" sound', 'Research candidate numbers in advance'],
    'Is the machine online?', ['Yes', 'No', 'Only for results', 'Only in cities'], 1, 'It is completely offline.'),
  step('br_b4', 4, 'The Two-Round System', 'Executive runoffs.',
    'For major executive roles like President or Governor in large cities, Brazil uses a two-round system. If no candidate receives more than 50% of the valid votes (excluding blank and null votes) in the first round, a second round is held between the top two candidates three weeks later. This ensures that the final winner has the support of a majority of the active electorate.',
    'A "final" between the top two candidates.',
    'October (1st and 2nd Rounds)',
    ['Knowledge of runoff dates', 'Understanding of valid votes', 'Candidate platforms', 'Majority support awareness'],
    ['Blank/null votes don\'t count for the total', 'Research the two remaining candidates deeply', 'Check the results on the TSE website', 'The second round is always on the last Sunday of October'],
    'When is the second round?', ['Always', 'If no majority', 'Never', 'If the King says'], 1, 'It ensures majority support.'),
  step('br_b5', 5, 'What to Bring', 'Election day rules.',
    'On election day, you must present a valid photo ID (such as a passport, driving license, or work permit) or your e-Título (if you have biometrics). It is strictly forbidden to take cell phones, cameras, or any recording devices into the voting booth to preserve the secrecy of the vote. You are encouraged to bring a small piece of paper, called a "cola," with the numbers of your chosen candidates.',
    'Leave your phone outside; bring a paper note with your numbers.',
    'Election Day',
    ['Photo ID (RG, CNH, or Passport)', 'Paper note with candidate numbers', 'e-Título (Digital ID)', 'Mask (if health rules apply)'],
    ['Cell phones are strictly banned in the booth', 'A paper "cola" is allowed and encouraged', 'Go early to avoid queues in the heat', 'Leave backpacks and large bags at home'],
    'What can you take in?', ['Cell phone', 'Camera', 'Paper note', 'None'], 2, 'A paper "cola" is allowed.'),
];
