import { describe, expect, it, vi } from 'vitest';
import { fetchImageUrl, isImageAvailable } from './bearData';

// mocking the fetch function for testing fetchImageUrl
global.fetch = vi.fn();

describe('fetchImageUrl', () => {
  it('should return the image URL when the API response is valid', async () => {
    const mockResponse = {
      query: {
        pages: {
          123: {
            imageinfo: [{ url: 'https://example.com/image.jpg' }],
          },
        },
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    const imageUrl = await fetchImageUrl('bear.jpg');
    expect(imageUrl).toBe('https://example.com/image.jpg');
  });

  it('should return null if no image info is found', async () => {
    const mockResponse = {
      query: {
        pages: {
          123: {},
        },
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    const imageUrl = await fetchImageUrl('bear.jpg');
    expect(imageUrl).toBeNull();
  });
});

describe('isImageAvailable', () => {
  it('should return true if the image is available', async () => {
    const imgMock = {
      onload: vi.fn(),
      onerror: vi.fn(),
    };

    // mocking the Image constructor
    global.Image = vi.fn(() => imgMock as unknown as HTMLImageElement);

    const result = isImageAvailable('https://example.com/image.jpg');
    imgMock.onload();

    await expect(result).resolves.toBe(true);
  });

  it('should return false if the image is not available', async () => {
    const imgMock = {
      onload: vi.fn(),
      onerror: vi.fn(),
    };

    // mocking the Image constructor
    global.Image = vi.fn(() => imgMock as unknown as HTMLImageElement);

    const result = isImageAvailable('https://example.com/invalid-image.jpg');
    imgMock.onerror();

    await expect(result).resolves.toBe(false);
  });
});
