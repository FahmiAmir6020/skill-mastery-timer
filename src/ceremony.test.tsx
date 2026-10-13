import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Ceremony } from './ceremony';
import type { Achievement } from './domain';

const achievement: Achievement = {
  id: 'ceremony-test', skillId: 'skill-test', skillName: 'Woodworking',
  level: 'Quarter Mastery', targetHours: 2500, totalPracticeSeconds: 9000000,
  sessionCount: 12, completedAt: new Date(2026, 0, 3).getTime(), claimedAt: null,
};

function renderCeremony(preview: boolean) {
  return renderToStaticMarkup(<Ceremony achievement={achievement} sounds={false} volume={0} customSound={null} preview={preview} onClaim={() => undefined} onCancel={() => undefined} />);
}

describe('skill completion celebration', () => {
  it.each([true, false])('shows the motto and distinct achievement details (preview=%s)', (preview) => {
    const html = renderCeremony(preview);
    expect(html.match(/SPEED IS LIFE\. LEARN, BUILD, IMPROVE, REPEAT\./g)).toHaveLength(1);
    expect(html).toContain('YOU HAVE');
    expect(html).toContain('ACQUIRED');
    expect(html).toContain('A SKILL');
    expect(html).toContain('Woodworking');
    expect(html).toContain('MASTERY CATEGORY');
    expect(html).toContain('RECORDED PRACTICE');
    expect(html.includes('SAMPLE DATA')).toBe(preview);
  });
});
