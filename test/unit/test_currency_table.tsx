import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CurrencyTable from '../../../client/src/components/CurrencyTable';

// Mock the UI components
jest.mock('../../../client/src/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <tr onClick={onClick} className={className}>{children}</tr>
  ),
}));

jest.mock('../../../client/src/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant }: { children: React.ReactNode; onClick?: () => void; className?: string; variant?: string }) => (
    <button onClick={onClick} className={className} data-variant={variant}>{children}</button>
  ),
}));

jest.mock('../../../client/src/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

jest.mock('../../../client/src/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, className }: { placeholder?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string }) => (
    <input placeholder={placeholder} value={value} onChange={onChange} className={className} />
  ),
}));

describe('CurrencyTable', () => {
  const mockCurrencies = [
    {
      symbol: 'BTC',
      base: 'USDT',
      close: 50000.00,
      change: 1500.00,
      percentChange: 3.10
    },
    {
      symbol: 'ETH',
      base: 'USDT',
      close: 3000.00,
      change: -50.00,
      percentChange: -1.64
    },
    {
      symbol: 'ADA',
      base: 'USDT',
      close: 1.50,
      change: 0.05,
      percentChange: 3.45
    }
  ];

  const mockOnCurrencyClick = jest.fn();
  const mockOnAddPair = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the add button', () => {
      render(
        <CurrencyTable
          currencies={mockCurrencies}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('should render the table with correct headers', () => {
      render(
        <CurrencyTable
          currencies={mockCurrencies}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      expect(screen.getByText('Pair')).toBeInTheDocument();
      expect(screen.getByText('Last')).toBeInTheDocument();
      expect(screen.getByText('Chg')).toBeInTheDocument();
      expect(screen.getByText('Chg%')).toBeInTheDocument();
    });

    it('should render all currency pairs', () => {
      render(
        <CurrencyTable
          currencies={mockCurrencies}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
      expect(screen.getByText('ETH/USDT')).toBeInTheDocument();
      expect(screen.getByText('ADA/USDT')).toBeInTheDocument();
    });

    it('should render currency data with correct formatting', () => {
      render(
        <CurrencyTable
          currencies={mockCurrencies}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      expect(screen.getByText('50000.00')).toBeInTheDocument();
      expect(screen.getByText('1500.00')).toBeInTheDocument();
      expect(screen.getByText('3.10%')).toBeInTheDocument();
      expect(screen.getByText('-50.00')).toBeInTheDocument();
      expect(screen.getByText('-1.64%')).toBeInTheDocument();
    });

    it('should render empty table when no currencies provided', () => {
      render(
        <CurrencyTable
          currencies={[]}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      expect(screen.getByText('Pair')).toBeInTheDocument();
      expect(screen.getByText('Last')).toBeInTheDocument();
      expect(screen.getByText('Chg')).toBeInTheDocument();
      expect(screen.getByText('Chg%')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should open dialog when add button is clicked', () => {
      render(
        <CurrencyTable
          currencies={mockCurrencies}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add New Currency Pair')).toBeInTheDocument();
    });

    it('should close dialog when cancel button is clicked', async () => {
      render(
        <CurrencyTable
          currencies={mockCurrencies}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      // Open dialog
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Verify dialog is open
      expect(screen.getByTestId('dialog')).toBeInTheDocument();

      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Dialog should be closed
      await waitFor(() => {
        expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
      });
    });

    it('should call onCurrencyClick when currency row is clicked', () => {
      render(
        <CurrencyTable
          currencies={mockCurrencies}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      // Find and click on a currency row
      const currencyRows = screen.getAllByText(/BTC\/USDT|ETH\/USDT|ADA\/USDT/);
      fireEvent.click(currencyRows[0]);

      expect(mockOnCurrencyClick).toHaveBeenCalledWith('BTC/USDT');
    });

    it('should handle adding new currency pair with valid input', async () => {
      render(
        <CurrencyTable
          currencies={mockCurrencies}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      // Open dialog
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Enter valid pair
      const input = screen.getByPlaceholderText('Symbol/Base (e.g., NEO/USDT)');
      fireEvent.change(input, { target: { value: 'NEO/USDT' } });

      // Click add
      const addPairButton = screen.getByText('Add');
      fireEvent.click(addPairButton);

      // Verify onAddPair was called with correct parameters
      expect(mockOnAddPair).toHaveBeenCalledWith('NEO', 'USDT');

      // Dialog should be closed
      await waitFor(() => {
        expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
      });
    });

    it('should not add pair with invalid input format', () => {
      render(
        <CurrencyTable
          currencies={mockCurrencies}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      // Open dialog
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Enter invalid pair (no slash)
      const input = screen.getByPlaceholderText('Symbol/Base (e.g., NEO/USDT)');
      fireEvent.change(input, { target: { value: 'NEOUSDT' } });

      // Click add
      const addPairButton = screen.getByText('Add');
      fireEvent.click(addPairButton);

      // onAddPair should not be called
      expect(mockOnAddPair).not.toHaveBeenCalled();

      // Dialog should remain open
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('should not add pair with incomplete input', () => {
      render(
        <CurrencyTable
          currencies={mockCurrencies}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      // Open dialog
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Enter incomplete pair
      const input = screen.getByPlaceholderText('Symbol/Base (e.g., NEO/USDT)');
      fireEvent.change(input, { target: { value: 'NEO/' } });

      // Click add
      const addPairButton = screen.getByText('Add');
      fireEvent.click(addPairButton);

      // onAddPair should not be called
      expect(mockOnAddPair).not.toHaveBeenCalled();

      // Dialog should remain open
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('should clear input after successful add', async () => {
      render(
        <CurrencyTable
          currencies={mockCurrencies}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      // Open dialog
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Enter valid pair
      const input = screen.getByPlaceholderText('Symbol/Base (e.g., NEO/USDT)') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'NEO/USDT' } });

      // Verify input has value
      expect(input.value).toBe('NEO/USDT');

      // Click add
      const addPairButton = screen.getByText('Add');
      fireEvent.click(addPairButton);

      // Input should be cleared
      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle currencies with zero values', () => {
      const currenciesWithZeros = [
        {
          symbol: 'TEST',
          base: 'USDT',
          close: 0.00,
          change: 0.00,
          percentChange: 0.00
        }
      ];

      render(
        <CurrencyTable
          currencies={currenciesWithZeros}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      expect(screen.getByText('0.00')).toBeInTheDocument();
      expect(screen.getByText('0.00%')).toBeInTheDocument();
    });

    it('should handle currencies with very large numbers', () => {
      const currenciesWithLargeNumbers = [
        {
          symbol: 'BTC',
          base: 'USDT',
          close: 999999.99,
          change: 12345.67,
          percentChange: 1.25
        }
      ];

      render(
        <CurrencyTable
          currencies={currenciesWithLargeNumbers}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      expect(screen.getByText('999999.99')).toBeInTheDocument();
      expect(screen.getByText('12345.67')).toBeInTheDocument();
      expect(screen.getByText('1.25%')).toBeInTheDocument();
    });

    it('should handle currencies with negative percent changes', () => {
      const currenciesWithNegativeChanges = [
        {
          symbol: 'ETH',
          base: 'USDT',
          close: 2500.00,
          change: -100.00,
          percentChange: -3.85
        }
      ];

      render(
        <CurrencyTable
          currencies={currenciesWithNegativeChanges}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      expect(screen.getByText('-100.00')).toBeInTheDocument();
      expect(screen.getByText('-3.85%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button accessibility', () => {
      render(
        <CurrencyTable
          currencies={mockCurrencies}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      const addButton = screen.getByText('+');
      expect(addButton).toBeInTheDocument();
    });

    it('should have proper input accessibility', () => {
      render(
        <CurrencyTable
          currencies={mockCurrencies}
          onCurrencyClick={mockOnCurrencyClick}
          onAddPair={mockOnAddPair}
        />
      );

      // Open dialog
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      const input = screen.getByPlaceholderText('Symbol/Base (e.g., NEO/USDT)');
      expect(input).toBeInTheDocument();
    });
  });
});
