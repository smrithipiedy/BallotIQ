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

export const IN_BEGINNER: ElectionStep[] = [
  step('in_b1', 1, 'Am I Eligible to Vote?', 'Basic eligibility check for Indian elections.',
    'To vote in India, you must be a citizen of India and have reached the age of 18 on the qualifying date (usually January 1st of the year of the electoral roll revision). You must be an ordinary resident in the constituency where you want to be registered. Mentally sound persons and those not disqualified by law for corrupt practices are eligible. You cannot be registered in more than one place.',
    'You need to be an Indian citizen and 18 years old to vote.',
    'Ongoing',
    ['Indian Citizenship', 'Age 18+ by qualifying date', 'Ordinary resident in constituency', 'Not disqualified by law', 'Sound mind'],
    ['Check your name on the electoral roll early', 'Update your address if you move house', 'Keep your EPIC card safe', 'Verify eligibility on the ECI portal'],
    'What is the minimum age to vote in India?', ['16', '18', '21', '25'], 1, 'Legal adulthood in India starts at 18.'),
  step('in_b2', 2, 'How to Register as a Voter', 'Getting on the electoral roll.',
    'Registration is the process of getting your name onto the Electoral Roll using Form 6 through the National Voters Service Portal (NVSP) or the Voter Helpline App. You need to provide a passport-sized photo, age proof (like a birth certificate or Aadhaar), and address proof (like a utility bill or bank passbook). Once submitted, a Booth Level Officer (BLO) may visit your home for verification.',
    'Registering is like signing up for a library card — you fill out a form to get access.',
    'At least 3 weeks before election',
    ['Form 6 application', 'Age proof (Aadhaar/Passport)', 'Address proof (Ration card/Bill)', 'Recent passport size photo', 'Mobile number for OTP'],
    ['Apply online for faster processing', 'Track your application status on NVSP', 'Contact your local BLO if delayed', 'Ensure name spelling matches ID documents'],
    'Which form is used for new voter registration?', ['Form 1', 'Form 6', 'Form 7', 'Form 8'], 1, 'Form 6 is for new voters.'),
  step('in_b3', 3, 'Understanding the EVM', 'How Electronic Voting Machines work.',
    'India uses Electronic Voting Machines (EVMs) consisting of a Control Unit (with the officer) and a Balloting Unit (in the booth). When you press the blue button next to your candidate\'s name and symbol, a red light glows, and a long beep sounds. EVMs are battery-operated and not connected to any network, making them immune to hacking via internet or Bluetooth.',
    'The EVM is a secure calculator for your vote.',
    'Election Day',
    ['Voter ID (EPIC)', 'Queue slip from polling desk', 'Identity verification'],
    ['Wait for the beep sound to confirm your vote', 'Check the candidate symbol carefully', 'Do not take photos of the EVM', 'Report any machine malfunction to the officer'],
    'Is the EVM connected to the internet?', ['Yes', 'No', 'Only during counting', 'Only in big cities'], 1, 'Isolation makes it secure.'),
  step('in_b4', 4, 'VVPAT Verification', 'Confirming your vote with paper.',
    'The Voter Verifiable Paper Audit Trail (VVPAT) is an independent system connected to the EVM. It prints a small slip showing the serial number, name, and symbol of the candidate you voted for. The slip is visible through a glass window for 7 seconds before it automatically cuts and falls into a sealed drop box. This allows you to verify that your vote was cast correctly.',
    'The VVPAT is like a grocery receipt you see through a window.',
    'Election Day',
    ['Watch the VVPAT window', 'Verify serial number', 'Confirm candidate symbol'],
    ['Ensure the name on the slip matches your choice', 'Notify the presiding officer if the slip is wrong', 'Wait for the slip to drop before leaving', 'Do not try to touch the paper slip'],
    'How long is the VVPAT slip visible?', ['2 seconds', '7 seconds', '15 seconds', 'Until you leave'], 1, '7 seconds is the standard.'),
  step('in_b5', 5, 'Going to the Polling Booth', 'What to expect on Election Day.',
    'Go to your assigned booth, show your ID to the first polling officer, and get your finger marked with indelible ink by the second officer. You will sign the register and receive a slip. Finally, go to the voting compartment, cast your vote on the EVM, and watch the VVPAT. Mobile phones, cameras, and bags are strictly prohibited inside the voting booth.',
    'Show your ID, get an ink mark, and vote in private.',
    'Election Day',
    ['EPIC Card or 12 alternative Photo IDs', 'Polling station location', 'Voter Slip (optional but helpful)', 'Indelible ink mark'],
    ['Go early to avoid long queues', 'Check your booth number online', 'Maintain silence and discipline', 'Cooperate with security personnel'],
    'Where is the indelible ink applied?', ['Left index finger', 'Right thumb', 'Left thumb', 'Forehead'], 0, 'It is a visible mark on your hand.'),
];
