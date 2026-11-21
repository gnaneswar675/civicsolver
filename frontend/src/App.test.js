import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CivicSolver navigation brand', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/Civic/i);
  expect(brandElements.length).toBeGreaterThan(0);
});

test('renders active issues or explore section on landing page', () => {
  render(<App />);
  const headingElements = screen.getAllByText(/Active Issues/i);
  expect(headingElements.length).toBeGreaterThan(0);
});

test('renders visible Report an Issue button on landing page', () => {
  render(<App />);
  const reportButtons = screen.getAllByRole('button', { name: /Report an Issue/i });
  expect(reportButtons.length).toBeGreaterThan(0);
});
