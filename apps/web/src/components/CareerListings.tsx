'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { usePublicContactInfo } from '@/hooks/use-public-contact-info';

const roles = [
  { title: 'Field Surveyor', group: 'Field work', summary: 'Measure land and record the features a project team needs to know about.', points: ['Visit sites and take careful measurements.', 'Keep clear notes and check survey results.', 'Work with the mapping team to prepare plans.'] },
  { title: 'Drone Mapping Operator', group: 'Field work', summary: 'Plan and carry out aerial photo surveys for sites of different sizes.', points: ['Prepare safe flight plans.', 'Take clear aerial photos of the site.', 'Check that the photos cover the area needed.'] },
  { title: 'Land Records Assistant', group: 'Field work', summary: 'Help compare land records, boundary maps, and measurements from the site.', points: ['Organize land records and site plans.', 'Help check boundary information.', 'Keep clear records for the project team.'] },
  { title: 'Map Designer', group: 'Office work', summary: 'Turn survey results into maps that are easy for clients to read.', points: ['Draw clear maps and plans.', 'Check labels, scales, and details.', 'Prepare files for print and digital use.'] },
  { title: 'Map Data Analyst', group: 'Office work', summary: 'Bring different sets of map information together and check what they show.', points: ['Organize map data.', 'Compare land, road, and site information.', 'Explain findings in clear language.'] },
  { title: 'Project Coordinator', group: 'Office work', summary: 'Help field and office teams keep their work on track.', points: ['Plan schedules and follow up on tasks.', 'Keep project files in order.', 'Help clients and team members share information.'] },
] as const;

export default function CareerListings() {
  const contactInfo = usePublicContactInfo();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('All roles');
  const groups = ['All roles', 'Field work', 'Office work'];
  const filtered = useMemo(() => roles.filter(role =>
    (group === 'All roles' || role.group === group) &&
    `${role.title} ${role.group} ${role.summary}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [group, query]);

  return <div className="interior-career-listing">
    <aside className="interior-career-sidebar">
      <span className="interior-kicker">CAREER AREAS</span>
      <h3>Find work that fits you.</h3>
      <p>These are the kinds of roles our work involves. They are open to general interest, not listed as current vacancies.</p>
      <label className="interior-role-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search roles</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by role" /></label>
      <div className="interior-role-filters" aria-label="Filter career areas">{groups.map(item => <button type="button" aria-pressed={group === item} onClick={() => setGroup(item)} key={item}>{item}<span>{item === 'All roles' ? roles.length : roles.filter(role => role.group === item).length}</span></button>)}</div>
      <div className="interior-career-aside-note"><strong>Don’t see your role?</strong><p>Tell us what you do and send your CV for future consideration.</p>{contactInfo?.email && <a href={`mailto:${contactInfo.email}?subject=General%20career%20interest`}>Send your CV <ArrowUpRight size={16} /></a>}</div>
    </aside>
    <div className="interior-role-results" aria-live="polite">
      {filtered.length ? filtered.map(role => <article className="interior-role-card" key={role.title}>
        <div className="interior-role-tags"><span>{role.group}</span><span>General interest</span></div>
        <h3>{role.title}</h3><p>{role.summary}</p>
        <div className="interior-role-bottom"><details><summary>View role <ArrowUpRight size={16} aria-hidden="true" /></summary><ul>{role.points.map(point => <li key={point}>{point}</li>)}</ul>{contactInfo?.email && <a href={`mailto:${contactInfo.email}?subject=${encodeURIComponent(`Career interest: ${role.title}`)}`}>Send your CV <ArrowUpRight size={16} /></a>}</details></div>
      </article>) : <p className="interior-no-results">No roles match that search.</p>}
    </div>
  </div>;
}
