import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest';
import App from '../App'; // Adjust the path if necessary

jest.mock('urql');

const mockedClient = {
  query: jest.fn(), // Mock the query function
};

describe('App component', () => {
  it('should render the header with the title "Animal Gifs"', () => {
    render(<App client={mockedClient} />); // Pass the mocked client
    const header = screen.getByText(/Animal Gifs/i);
    expect(header).toBeInTheDocument();
  });

  it('should render the category buttons initially', () => {
    render(<App client={mockedClient} />);
    const categoryButtons = screen.getAllByRole('button', { name: /Cat|Dog|Elephant|Lion|Monkey/i });
    expect(categoryButtons.length).toBe(5);
  });

  it('should render the search input initially', () => {
    render(<App client={mockedClient} />);
    const searchInput = screen.getByRole('textbox', { name: /Search for an animal/i });
    expect(searchInput).toBeInTheDocument();
  });

  it('should toggle the switch and render the OddOneOutPage component when checked', () => {
    render(<App client={mockedClient} />);
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement); // Simulate switch click

    expect(screen.getByText(/Odd on out/i)).toBeInTheDocument(); // Check for OddOneOutPage text
  });

  it('should update the debouncedCategory state on category button click', () => {
    render(<App client={mockedClient} />);
    const catButton = screen.getByText(/Cat/i);
    fireEvent.click(catButton);

    expect(mockedClient.query).toHaveBeenCalledWith(expect.anyObject(), { category: 'cat' }); // Verify query call with category
  });

  it('should update the debouncedCategory state on search input change (after debounce)', async () => {
    render(<App client={mockedClient} />);
    const searchInput = screen.getByRole('textbox', { name: /Search for an animal/i });
    fireEvent.change(searchInput, { target: { value: 'ele' } }); // Simulate typing

    // Wait for debounce to complete (consider using a utility function or library for debounce testing)
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(mockedClient.query).toHaveBeenCalledWith(expect.anyObject(), { category: 'ele' }); // Verify query call with category
  });

});