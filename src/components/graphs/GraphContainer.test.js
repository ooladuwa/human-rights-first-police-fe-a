import React from 'react';
import {
  // Imported render is customer function built in /utils/test-utils
  render,
  cleanup,
  screen,
  act,
  fireEvent,
} from '../../utils/test-utils';
import GraphContainer from './GraphContainer';
import userEvent, { specialChars } from '@testing-library/user-event';
import { expect } from '@jest/globals';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('<GraphContainer />', () => {
  test('Component renders', async () => {
    const { container } = await render(<GraphContainer />);
    expect(container).toContainElement(container.firstChild);
  });
});

describe('Filter by selected state', () => {
  test('User can choose a state to filter by', async () => {
    await render(<GraphContainer />);
    const searchBar = screen.getByRole('combobox');
    const methodsText = screen.getByText(/person/i);
    expect(methodsText).not.toBe(null);
    await act(async () => {
      userEvent.type(searchBar, `California{enter}{enter}`);
    });

    const text = screen.getByText(/total number of incidents in california/i);
    expect(text).toBe(null);
  });
});
