import React from 'react';
import {
  render,
  cleanup,
  screen,
  fireEvent,
  act,
} from '../../utils/test-utils';
import Incidents from './Incidents';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('<Incidents />', () => {
  test('Component renders', async () => {
    const { container } = await render(<Incidents />);
    expect(container).toContainElement(container.firstChild);
    const rankSelect = screen.getByLabelText(/rank/i);
    console.log(rankSelect);
    await act(async () => {
      fireEvent.change(rankSelect, { target: { value: 2 } });
    });
    const rank2s = screen.getAllByText(/rank 2/i);
  });
});
