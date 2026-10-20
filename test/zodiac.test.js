import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signFor, birthInfo, lifePath, sky, constellationFor } from '../src/lib/zodiac.js';

test('sign boundaries', () => {
  const cases = [[1, 1, 'capricorn'], [1, 19, 'capricorn'], [1, 20, 'aquarius'], [3, 20, 'pisces'], [3, 21, 'aries'],
    [7, 22, 'cancer'], [7, 23, 'leo'], [12, 21, 'sagittarius'], [12, 22, 'capricorn'], [12, 31, 'capricorn']];
  for (const [m, d, id] of cases) assert.equal(signFor(m, d).id, id, `${m}/${d}`);
});

test('birth info', () => {
  const b = birthInfo('1990-01-10');
  assert.equal(b.sign.id, 'capricorn');
  assert.equal(b.decan, 2); // Dec 22 + 19 days
  assert.equal(b.coRuler.id, 'taurus');
  assert.deepEqual(birthInfo('2000-03-21').cusp.map((s) => s.id), ['pisces', 'aries']);
  assert.equal(birthInfo('2000-03-25').cusp, null);
  assert.equal(birthInfo('2023-02-30'), null);
  assert.equal(birthInfo('nope'), null);
});

test('life path keeps master numbers', () => {
  assert.equal(lifePath('1990-01-10'), 3); // 21 -> 3
  assert.equal(lifePath('2000-01-08'), 11);
});

test('moon phase near known full moon', () => {
  const s = sky(new Date(Date.UTC(2024, 0, 25, 17, 54))); // full moon 25 Jan 2024
  assert.equal(s.phaseIndex, 4);
  assert.ok(s.illumination > 0.98);
});

test('constellation and sidereal', () => {
  assert.equal(constellationFor(12, 5), 'ophiuchus');
  assert.equal(constellationFor(1, 5), 'sagittarius');
  assert.equal(constellationFor(10, 10), 'virgo');
  assert.equal(birthInfo('1992-07-23').sidereal.id, 'cancer');
  assert.equal(birthInfo('1990-01-10').sidereal.id, 'sagittarius');
});
