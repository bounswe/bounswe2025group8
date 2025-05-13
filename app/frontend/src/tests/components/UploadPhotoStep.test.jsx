import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import UploadPhotosStep from '../../components/CreateRequest/Steps/UploadPhotosStep';
import createRequestReducer from '../../redux/slices/createRequestSlice';

// Spy on Redux actions
vi.mock('../../redux/slices/createRequestSlice', async () => {
  const actual = await vi.importActual('../../redux/slices/createRequestSlice');
  return {
    ...actual,
    uploadPhotos: vi.fn(() => ({ type: 'createRequest/uploadPhotos' })),
    removePhoto: vi.fn((id) => ({ type: 'createRequest/removePhoto', payload: id }))
  };
});

describe('UploadPhotosStep', () => {
  let store;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    store = configureStore({
      reducer: {
        createRequest: createRequestReducer
      },
      preloadedState: {
        createRequest: {
          uploadedPhotos: [
            { id: '1', name: 'photo1.jpg', url: 'url1' },
            { id: '2', name: 'photo2.jpg', url: 'url2' }
          ],
          loading: false
        }
      },
      middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
          serializableCheck: false  // Disable serializable check for tests
        })
    });
  });

  it('renders upload area correctly', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <UploadPhotosStep />
        </Provider>
      );
    });

    expect(screen.getByText('Drop files here')).toBeInTheDocument();
    expect(screen.getByText('or')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /browse photos/i })).toBeInTheDocument();
  });

  it('renders uploaded photos', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <UploadPhotosStep />
        </Provider>
      );
    });

    // Check if image elements are rendered for each photo
    const imageElements = screen.getAllByRole('img');
    expect(imageElements.length).toBe(2);
    
    // Check if photo names are displayed
    expect(screen.getByText('✓ photo1.jpg')).toBeInTheDocument();
    expect(screen.getByText('✓ photo2.jpg')).toBeInTheDocument();
  });

  it('triggers file dialog when browse button is clicked', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <UploadPhotosStep />
        </Provider>
      );
    });

    // Create mock for click event on file input
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    
    // Click browse button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /browse photos/i }));
    });
    
    // Verify file input click was triggered
    expect(clickSpy).toHaveBeenCalled();
    
    clickSpy.mockRestore();
  });

  it('uploads files when files are selected', async () => {
    const { uploadPhotos } = await import('../../redux/slices/createRequestSlice');
    
    await act(async () => {
      render(
        <Provider store={store}>
          <UploadPhotosStep />
        </Provider>
      );
    });

    // Create mock files
    const file1 = new File(['file content'], 'new-photo.jpg', { type: 'image/jpeg' });
    const file2 = new File(['file content'], 'another-photo.png', { type: 'image/png' });
    
    // Get file input
    const fileInput = document.querySelector('input[type="file"]');
    
    // Simulate file selection
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file1, file2] } });
    });
    
    // Verify uploadPhotos was called
    expect(uploadPhotos).toHaveBeenCalled();
  });

  it('removes a photo when delete button is clicked', async () => {
    const { removePhoto } = await import('../../redux/slices/createRequestSlice');
    
    await act(async () => {
      render(
        <Provider store={store}>
          <UploadPhotosStep />
        </Provider>
      );
    });

    // Find and click delete button for the first photo using the correct data-testid
    await act(async () => {
      const deleteButton = screen.getAllByTestId('DeleteOutlineIcon')[0].closest('button');
      fireEvent.click(deleteButton);
    });
    
    // Verify removePhoto was called with correct ID
    expect(removePhoto).toHaveBeenCalledWith('1');
  });
});