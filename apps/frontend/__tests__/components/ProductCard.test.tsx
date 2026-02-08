import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProductCard } from '../../components/ProductCard';

const mockAddItem = jest.fn();
const mockOpen = jest.fn();

jest.mock('../../components/cart/CartProvider', () => ({
  useCart: () => ({
    addItem: mockAddItem,
    open: mockOpen,
  }),
}));

describe('ProductCard', () => {
  const defaultProps = {
    sku: 'FIG-001',
    title: 'Figurine Dracula',
    price: 29.99,
    image: '/products/figurine.webp',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product title', () => {
    render(<ProductCard {...defaultProps} />);
    // Title appears in the h3 heading
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Figurine Dracula');
  });

  it('should render product SKU', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText('FIG-001')).toBeInTheDocument();
  });

  it('should render product price formatted', () => {
    render(<ProductCard {...defaultProps} />);
    // Price is formatted with Intl.NumberFormat for 'fr' locale → "29,99 €" or similar
    const priceEl = screen.getByText(/29,99/);
    expect(priceEl).toBeInTheDocument();
  });

  it('should render product image with correct src', () => {
    render(<ProductCard {...defaultProps} />);
    const img = screen.getByAltText('Image de Figurine Dracula');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/products/figurine.webp');
  });

  it('should use fallback image when no image provided', () => {
    render(<ProductCard sku="FIG-002" title="Test" price={10} />);
    const img = screen.getByAltText('Image de Test');
    expect(img).toHaveAttribute('src', '/products/house.svg');
  });

  it('should link to product detail page', () => {
    render(<ProductCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/fr/produits/fig-001');
  });

  it('should call addItem and open cart when add button is clicked', () => {
    render(<ProductCard {...defaultProps} />);
    const button = screen.getByRole('button', { name: /ajouter figurine dracula au panier/i });
    fireEvent.click(button);
    expect(mockAddItem).toHaveBeenCalledWith({
      sku: 'FIG-001',
      title: 'Figurine Dracula',
      price: 29.99,
      image: '/products/figurine.webp',
    });
    expect(mockOpen).toHaveBeenCalled();
  });

  it('should have accessible aria-label on add button', () => {
    render(<ProductCard {...defaultProps} />);
    const button = screen.getByLabelText('Ajouter Figurine Dracula au panier');
    expect(button).toBeInTheDocument();
  });
});
