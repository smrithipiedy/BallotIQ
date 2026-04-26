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

export const SA_BEGINNER: ElectionStep[] = [
  step('sa_b1', 1, 'Are you eligible to participate?', 'Basic eligibility for Saudi municipal elections.',
    'Saudi citizens aged 18 and above are eligible to participate in municipal elections. Since the landmark 2015 elections, both men and women have equal rights to vote and run as candidates. You must be an ordinary resident of the municipality where you register to vote. Certain groups, such as active military personnel, are typically excluded from voting in these local contests.',
    'Saudi citizens 18 or older can vote for their local council.',
    'Ongoing',
    ['Saudi Citizenship', 'Age 18+', 'Ordinary residency in municipality', 'National ID (Mada/Absher)', 'No legal disqualifications'],
    ['Register early during designated periods', 'Keep your National ID updated', 'Verify your residency records on Absher', 'Follow official ELC announcements'],
    'When did women first vote in Saudi Arabia?', ['2005', '2011', '2015', '2020'], 2, '2015 was the landmark year.'),
  step('sa_b2', 2, 'Municipal Councils', 'Local direct elections.',
    'Municipal councils are the primary platform for citizen participation in local governance. In these elections, citizens directly elect half of the council members, while the other half are appointed by the government. These councils are responsible for overseeing city services, infrastructure development, and local land use. They serve as a vital link between the community and the Ministry of Municipal and Rural Affairs.',
    'You choose representatives to manage your city\'s infrastructure.',
    'Every 4 years',
    ['Knowledge of local candidates', 'National ID', 'Residency certificate', 'Understanding of council scope'],
    ['Follow the Ministry for official dates', 'Attend local candidate briefings', 'Check council meeting minutes online', 'Engage with current council members'],
    'How many council members are elected?', ['25%', '50%', '75%', '100%'], 1, 'Half are elected, half appointed.'),
  step('sa_b3', 3, 'The Shura Council', 'Consultative Assembly roles.',
    'The Shura Council (Majlis ash-Shura) is the formal advisory body of Saudi Arabia. It consists of 150 members, all of whom are appointed by the King for four-year terms. The council has the power to propose laws and provide recommendations on national policies and international treaties. Since 2013, a minimum of 20% of the council seats must be held by women, ensuring diverse perspectives in national policy-making.',
    'The Shura Council suggests laws and advises the leadership.',
    'Appointed every 4 years',
    ['National Policy awareness', 'Awareness of Vision 2030 goals', 'Knowledge of Shura committees', 'Current events tracking'],
    ['20% of the council must be women', 'Read the Shura Council\'s annual reports', 'Follow Shura debates on official news', 'Understand the legislative proposal process'],
    'How many members are in the Shura Council?', ['50', '100', '150', '200'], 2, '150 is the official count.'),
  step('sa_b4', 4, 'Voter Registration', 'Getting your voter card.',
    'To cast a vote, you must first register at a designated voter registration center within your municipality. You will need to present your original National ID card and provide proof of residence, such as a utility bill or house deed. Upon successful registration, you will receive a voter card or a digital confirmation. This process usually happens several months before the actual election day.',
    'Bring your ID and utility bill to a center to register.',
    'Pre-election',
    ['National ID (Physical copy)', 'Proof of Residence (Bill/Deed)', 'Voter Registration Form', 'Digital Absher account access'],
    ['Check your local municipality for locations', 'Register early to avoid last-minute crowds', 'Verify your name on the preliminary voter list', 'Keep your registration receipt safe'],
    'What is needed to register?', ['Passport', 'National ID', 'Library card', 'None'], 1, 'National ID is essential.'),
  step('sa_b5', 5, 'Local Authority Powers', 'What councils do.',
    'Municipal councils have significant influence over the daily lives of citizens. They oversee local budgets, urban planning, and the maintenance of public facilities like parks, roads, and markets. By voting, you help decide who will manage these essential services. Citizens are encouraged to report local issues and provide feedback to their council members to ensure their needs are being met effectively.',
    'Councils decide how your city spends money on roads and parks.',
    'Post-election',
    ['Active Citizenship', 'Communication channels with council', 'Knowledge of local urban plans', 'Budget awareness'],
    ['Report local issues to your council members', 'Attend public council sessions', 'Participate in municipal surveys', 'Volunteer for community cleanup initiatives'],
    'What is a council responsibility?', ['Defense', 'Urban Planning', 'Foreign Policy', 'Currency'], 1, 'They focus on local development.'),
];
