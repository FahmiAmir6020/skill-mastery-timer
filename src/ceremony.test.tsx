import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Ceremony } from './ceremony';
import type { Achievement, MilestoneTier } from './domain';

const achievement: Achievement = {
  id: 'ceremony-test', skillId: 'skill-test', skillName: 'Woodworking',
  level: 'Quarter Mastery', targetHours: 2500, totalPracticeSeconds: 9000000,
  sessionCount: 12, completedAt: new Date(2026, 0, 3).getTime(), claimedAt: null,
};

function renderCeremony(preview: boolean) {
  return renderToStaticMarkup(<Ceremony achievement={achievement} sounds={false} volume={0} customSound={null} preview={preview} onClaim={() => undefined} onCancel={() => undefined} />);
}
function renderMilestone(tier: MilestoneTier, enabled = true) {
  return renderToStaticMarkup(<Ceremony achievement={achievement} sounds={enabled} volume={0.7} customSound={null} preview milestoneTier={tier} tierEnabled={enabled} onClaim={() => undefined} onCancel={() => undefined} />);
}

describe('skill completion celebration', () => {
  it.each([true, false])('shows the motto and distinct achievement details (preview=%s)', (preview) => {
    const html = renderCeremony(preview);
    expect(html.match(/SPEED IS LIFE\. LEARN, BUILD, IMPROVE, REPEAT\./g)).toHaveLength(1);
    expect(html).toContain('YOU HAVE');
    expect(html).toContain('ACQUIRED');
    expect(html).toContain('A SKILL');
    expect(html).toContain('Woodworking');
    expect(html.match(/class="celebration-sparkle /g)).toHaveLength(22);
    expect(html).toContain('class="ceremony-sparkles"');
    expect(html).toContain('MASTERY CATEGORY');
    expect(html).toContain('RECORDED PRACTICE');
    expect(html.includes('SAMPLE DATA')).toBe(preview);
  });
  it.each([[25, '25% MILESTONE'], [50, '50% MILESTONE'], [100, 'MASTERY']] as const)('renders the selected tier and bounded sparkle field (%i)', (tier, heading) => {
    const html = renderMilestone(tier);
    expect(html).toContain(`ceremony-tier-${tier}`);
    expect(html).toContain(heading);
    expect(html).toContain('Woodworking');
    expect(html.match(/class="celebration-sparkle /g)).toHaveLength(22);
  });
  it.each([
    [25, 'MILESTONE AWARDED TO'],
    [50, 'HONORED AND AWARDED TO'],
    [100, 'THIS LEGENDARY ACHIEVEMENT IS BESTOWED UPON'],
  ] as const)('shows the recipient signature for tier %i', (tier, awardHeading) => {
    const html = renderMilestone(tier);
    expect(html).toContain(awardHeading);
    expect(html.match(/FAHMI AMIR/g)).toHaveLength(1);
    expect(html).toContain(`recipient-award-${tier}`);
  });
  it('explains disabled milestone previews', () => {
    expect(renderMilestone(50, false)).toContain('This milestone celebration is disabled in Settings.');
  });
});
