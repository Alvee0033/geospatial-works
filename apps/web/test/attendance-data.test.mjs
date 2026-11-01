import test from 'node:test';
import assert from 'node:assert/strict';
import * as attendanceData from '../src/lib/attendanceData.ts';

test('attendance work location uses explicit live mode metadata', () => {
  assert.equal(typeof attendanceData.getWorkLocation, 'function');
  assert.equal(attendanceData.getWorkLocation({ notes: '[Work Mode: Field] Site: North' }), 'field');
  assert.equal(attendanceData.getWorkLocation({ notes: '[Work Mode: Home Office]' }), 'home_office');
  assert.equal(attendanceData.getWorkLocation({ work_mode: 'home' }), 'home');
  assert.equal(attendanceData.getWorkLocation({ notes: '[Work Mode: Office]' }), 'office');
});

test('attendance location is not guessed when server has no location mode', () => {
  assert.equal(attendanceData.getWorkLocation({ latitude: 23.7, longitude: 90.4 }), 'unknown');
});

test('zero or invalid GPS coordinates are not treated as an office check-in', () => {
  assert.equal(typeof attendanceData.hasValidCoordinates, 'function');
  assert.equal(attendanceData.hasValidCoordinates(0, 0), false);
  assert.equal(attendanceData.hasValidCoordinates(null, null), false);
  assert.equal(attendanceData.hasValidCoordinates(23.7, 90.4), true);
  assert.equal(attendanceData.hasValidCoordinates(91, 90.4), false);
});
