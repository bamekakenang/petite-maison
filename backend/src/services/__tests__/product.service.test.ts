import productService from '../product.service';

jest.mock('../../config/database');

describe('ProductService', () => {
  it('should be defined', () => {
    expect(productService).toBeDefined();
  });
});
