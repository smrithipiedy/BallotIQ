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

export const DE_BEGINNER: ElectionStep[] = [
  step('de_b1', 1, 'Who can vote?', 'German eligibility.',
    'To vote in German federal elections (Bundestagswahl), you must be a German citizen and at least 18 years old on election day. You must have lived in Germany for at least three months prior to the election. Residents of other EU countries living in Germany can vote in local and European elections, but only German citizens can participate in national elections. You must also not be disqualified from voting by a court order.',
    'Citizenship and 18 years old to join.',
    'Ongoing',
    ['German Citizenship', 'Age 18+ by election day', '3 months residency in Germany', 'Entry in the electoral register', 'No disqualification by court order'],
    ['You will get a notification by mail automatically', 'Check your local Bürgeramt if you haven\'t received mail', 'Apply for registration if you recently returned from abroad', 'Keep your ID card (Personalausweis) valid'],
    'Age?', ['16', '18', '21', '25'], 1, '18 for national elections.'),
  step('de_b2', 2, 'Notification', 'The paper invitation.',
    'About 4 to 6 weeks before the election, every eligible voter receives a "Wahlbenachrichtigung" (election notification) by mail. This letter confirms that you are in the electoral register and tells you the address of your specific polling station. It also includes an application form if you wish to vote by post instead of in person. You should bring this letter and your ID card with you to the polling station.',
    'The letter tells you exactly where to go.',
    '4-6 weeks before',
    ['Registration at current address', 'Mailbox access', 'Valid ID card (Personalausweis)', 'Polling station address'],
    ['Keep the letter safe; it makes voting faster', 'Verify the polling station address early', 'Apply for postal voting if you are traveling', 'Contact your local authority if the mail is missing'],
    'How do you know where to go?', ['Newspaper', 'Mail notification', 'Search online', 'None'], 1, 'The mail notification.'),
  step('de_b3', 3, 'Two Votes', 'Personalized proportionality.',
    'Germany uses a "Personalized Proportional Representation" system where each voter has two votes. The first vote (Erststimme) is for a local candidate in your constituency; the winner here gets a direct seat. The second vote (Zweitstimme) is for a political party list and is much more important, as it determines the overall percentage of seats each party will have in the Bundestag. This system ensures that the parliament reflects the national popular vote.',
    'Local representative vs. National party strength.',
    'Election Day',
    ['Knowledge of local candidates', 'Party platform awareness', 'Understanding of the 5% rule', 'Ballot marking instructions'],
    ['You can split your votes between parties', 'Research the local candidate\'s record', 'The 2nd vote determines the Chancellor\'s party power', 'Ensure you mark only one box for each vote'],
    'Which vote is more important?', ['1st', '2nd', '3rd', 'None'], 1, 'The 2nd vote decides seat counts.'),
  step('de_b4', 4, 'The 5% Hurdle', 'The entry barrier.',
    'To prevent political fragmentation and ensure a stable government, a party must receive at least 5% of the national second votes to enter the Bundestag. If a party fails to meet this threshold, it receives no seats unless it wins at least three direct constituency seats via the first vote. This "Sperrklausel" (blocking clause) encourages voters to consider the viability of smaller parties.',
    'It prevents too many tiny parties from making government hard.',
    'Election Day',
    ['Threshold awareness', 'Coalition knowledge', 'Political stability understanding', 'Current poll tracking'],
    ['Helps keep the parliament stable', 'Research "small" parties carefully', 'Consider if your party will likely pass 5%', 'Understand how "wasted" votes impact coalitions'],
    'Threshold?', ['1%', '3%', '5%', '10%'], 2, '5% is the rule.'),
  step('de_b5', 5, 'Mail Voting', 'Voting from your couch.',
    'If you cannot or do not want to go to a polling station, you can apply for "Briefwahl" (postal voting). Once you receive your documents, you mark the ballot, place it in the blue envelope, and then place that inside the red return envelope along with your signed voting card. No postage stamp is needed if mailed within Germany. Your ballot must reach the election office by 6pm on election Sunday.',
    'Fill out the ballot, put it in the red envelope, and mail it.',
    'Before Election Day',
    ['Postal application form', 'Marked ballot paper', 'Signed polling card (Wahlschein)', 'Blue and Red envelopes'],
    ['Mail it back early; it must arrive by Sunday 6pm', 'Ensure you sign the polling card personally', 'Do not forget to put the ballot in the blue envelope first', 'Drop it in any yellow Deutsche Post box'],
    'Envelope color?', ['Blue', 'Red', 'Yellow', 'White'], 1, 'Red is the return envelope.'),
];
