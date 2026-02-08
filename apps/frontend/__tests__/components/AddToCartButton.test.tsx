import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddToCartButton } from '../../components/AddToCartButton';

const mockAddItem = jest.fn();

jest.mock('../../components/cart/CartProvider', () => ({
  useCart: () => ({
    addItem: mockAddItem,
  }),
}));

describe('AddToCartButton', () => {
  const defaultProps = {
    sku: 'GAM-001',
    title: 'Jeu de société Horreur',
    price: 39.99,
    image: '/products/game.webp',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the button with translation key', () => {
    render(<AddToCartButton {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('addToCart');
  });

  it('should call addItem with correct data on click', () => {
    render(<AddToCartButton {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockAddItem).toHaveBeenCalledTimes(1);
    expect(mockAddItem).toHaveBeenCalledWith({
      sku: 'GAM-001',
      title: 'Jeu de société Horreur',
      price: 39.99,
      image: '/products/game.webp',
    });
  });

  it('should apply custom className', () => {
    render(<AddToCartButton {...defaultProps} className="custom-class" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-class');
  });

  it('should work without image prop', () => {
    render(<AddToCartButton sku="FIG-003" title="No Image" price={15} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockAddItem).toHaveBeenCalledWith({
      sku: 'FIG-003',
      title: 'No Image',
      price: 15,
      image: undefined,
    });
  });
});
