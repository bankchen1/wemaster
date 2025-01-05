import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Whiteboard } from './Whiteboard';
import { useSessionStore } from '../../stores/useSessionStore';

// Mock Canvas API
const mockContext = {
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  clearRect: jest.fn(),
};

beforeEach(() => {
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);
});

describe('Whiteboard', () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
    useSessionStore.setState({
      currentUser: { id: 'tutor-1', role: 'tutor' },
      isWhiteboardEnabled: true,
    });
  });

  it('should render whiteboard tools', () => {
    render(<Whiteboard />);

    expect(screen.getByRole('button', { name: /画笔/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /橡皮擦/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /清空/i })).toBeInTheDocument();
  });

  it('should handle drawing mode changes', async () => {
    render(<Whiteboard />);

    const penButton = screen.getByRole('button', { name: /画笔/i });
    const eraserButton = screen.getByRole('button', { name: /橡皮擦/i });

    await userEvent.click(eraserButton);
    expect(eraserButton).toHaveClass('active');

    await userEvent.click(penButton);
    expect(penButton).toHaveClass('active');
  });

  it('should clear whiteboard', async () => {
    render(<Whiteboard />);

    const clearButton = screen.getByRole('button', { name: /清空/i });
    await userEvent.click(clearButton);

    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('should handle color changes', async () => {
    render(<Whiteboard />);

    const colorPicker = screen.getByLabelText(/颜色/i);
    await userEvent.click(colorPicker);
    await userEvent.click(screen.getByTitle('Red'));

    expect(useSessionStore.getState().whiteboardColor).toBe('#ff0000');
  });

  it('should handle thickness changes', async () => {
    render(<Whiteboard />);

    const thicknessSlider = screen.getByLabelText(/粗细/i);
    await userEvent.type(thicknessSlider, '5');

    expect(useSessionStore.getState().whiteboardThickness).toBe(5);
  });

  it('should sync drawing with other participants', async () => {
    render(<Whiteboard />);

    // Simulate drawing
    const canvas = screen.getByTestId('whiteboard-canvas');
    await userEvent.pointer([
      { target: canvas, coords: { clientX: 0, clientY: 0 }, keys: '[MouseLeft>]' },
      { target: canvas, coords: { clientX: 100, clientY: 100 } },
      { target: canvas, coords: { clientX: 100, clientY: 100 }, keys: '[/MouseLeft]' },
    ]);

    await waitFor(() => {
      expect(mockContext.moveTo).toHaveBeenCalledWith(0, 0);
      expect(mockContext.lineTo).toHaveBeenCalledWith(100, 100);
    });
  });
});
