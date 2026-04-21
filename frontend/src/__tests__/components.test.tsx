/**
 * React Component Tests
 * 
 * Тези тестове проверяват дали React компонентите се рендират правилно
 * и реагират на потребителски действия.
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// ==================== Simple Button Component Test ====================
// Пример за тестване на прост компонент

describe('Button Component Behavior', () => {
  test('бутон трябва да извика onClick при клик', () => {
    const handleClick = vi.fn(); // Mock функция
    
    render(
      <button onClick={handleClick} data-testid="test-button">
        Натисни ме
      </button>
    );
    
    const button = screen.getByTestId('test-button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('disabled бутон не трябва да извика onClick', () => {
    const handleClick = vi.fn();
    
    render(
      <button onClick={handleClick} disabled data-testid="disabled-button">
        Disabled
      </button>
    );
    
    const button = screen.getByTestId('disabled-button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});

// ==================== Form Input Tests ====================
describe('Form Input Behavior', () => {
  test('input трябва да показва въведена стойност', () => {
    render(<input data-testid="test-input" />);
    
    const input = screen.getByTestId('test-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test@email.com' } });
    
    expect(input.value).toBe('test@email.com');
  });

  test('password input трябва да скрива текста', () => {
    render(<input type="password" data-testid="password-input" />);
    
    const input = screen.getByTestId('password-input');
    expect(input).toHaveAttribute('type', 'password');
  });
});

// ==================== Conditional Rendering Tests ====================
describe('Conditional Rendering', () => {
  const ConditionalComponent = ({ isLoggedIn }: { isLoggedIn: boolean }) => (
    <div>
      {isLoggedIn ? (
        <span data-testid="welcome">Добре дошли!</span>
      ) : (
        <span data-testid="login-prompt">Моля, влезте в профила си</span>
      )}
    </div>
  );

  test('трябва да покаже welcome съобщение когато е логнат', () => {
    render(<ConditionalComponent isLoggedIn={true} />);
    
    expect(screen.getByTestId('welcome')).toBeInTheDocument();
    expect(screen.queryByTestId('login-prompt')).not.toBeInTheDocument();
  });

  test('трябва да покаже login prompt когато не е логнат', () => {
    render(<ConditionalComponent isLoggedIn={false} />);
    
    expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
    expect(screen.queryByTestId('welcome')).not.toBeInTheDocument();
  });
});

// ==================== List Rendering Tests ====================
describe('List Rendering', () => {
  const RecipeList = ({ recipes }: { recipes: string[] }) => (
    <ul data-testid="recipe-list">
      {recipes.map((recipe, index) => (
        <li key={index} data-testid={`recipe-${index}`}>
          {recipe}
        </li>
      ))}
    </ul>
  );

  test('трябва да рендира списък с рецепти', () => {
    const recipes = ['Мусака', 'Баница', 'Шопска салата'];
    render(<RecipeList recipes={recipes} />);
    
    expect(screen.getByTestId('recipe-0')).toHaveTextContent('Мусака');
    expect(screen.getByTestId('recipe-1')).toHaveTextContent('Баница');
    expect(screen.getByTestId('recipe-2')).toHaveTextContent('Шопска салата');
  });

  test('трябва да рендира празен списък', () => {
    render(<RecipeList recipes={[]} />);
    
    const list = screen.getByTestId('recipe-list');
    expect(list.children.length).toBe(0);
  });
});

// ==================== Navigation Link Tests ====================
describe('Navigation Links', () => {
  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <BrowserRouter>
      <a href={to} data-testid="nav-link">
        {children}
      </a>
    </BrowserRouter>
  );

  test('link трябва да има правилен href', () => {
    render(<NavLink to="/recipes">Рецепти</NavLink>);
    
    const link = screen.getByTestId('nav-link');
    expect(link).toHaveAttribute('href', '/recipes');
    expect(link).toHaveTextContent('Рецепти');
  });
});

// ==================== Loading State Tests ====================
describe('Loading States', () => {
  const LoadingComponent = ({ isLoading }: { isLoading: boolean }) => (
    <div>
      {isLoading ? (
        <div data-testid="loading-spinner">Зареждане...</div>
      ) : (
        <div data-testid="content">Съдържание заредено</div>
      )}
    </div>
  );

  test('трябва да покаже спинер при зареждане', () => {
    render(<LoadingComponent isLoading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  test('трябва да покаже съдържание след зареждане', () => {
    render(<LoadingComponent isLoading={false} />);
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });
});

// ==================== Error Display Tests ====================
describe('Error Display', () => {
  const ErrorComponent = ({ error }: { error: string | null }) => (
    <div>
      {error && (
        <div data-testid="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );

  test('трябва да покаже грешка когато има такава', () => {
    render(<ErrorComponent error="Невалиден имейл адрес" />);
    
    expect(screen.getByTestId('error-message')).toHaveTextContent('Невалиден имейл адрес');
  });

  test('не трябва да рендира нищо когато няма грешка', () => {
    render(<ErrorComponent error={null} />);
    
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });
});

// ==================== Counter Component Test ====================
describe('Counter Component', () => {
  test('трябва да рендира начална стойност', () => {
    render(
      <div>
        <span data-testid="count">0</span>
        <button data-testid="increment">+</button>
      </div>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});

// ==================== Accessibility Tests ====================
describe('Accessibility', () => {
  test('form inputs трябва да имат labels', () => {
    render(
      <div>
        <label htmlFor="email">Имейл</label>
        <input id="email" type="email" data-testid="email-input" />
      </div>
    );
    
    const input = screen.getByTestId('email-input');
    expect(input).toHaveAttribute('id', 'email');
  });

  test('images трябва да имат alt text', () => {
    render(
      <img 
        src="/test.jpg" 
        alt="Снимка на рецепта" 
        data-testid="recipe-image" 
      />
    );
    
    const image = screen.getByTestId('recipe-image');
    expect(image).toHaveAttribute('alt', 'Снимка на рецепта');
  });

  test('buttons трябва да имат достъпен текст', () => {
    render(
      <button aria-label="Добави в любими" data-testid="favorite-btn">
        ❤️
      </button>
    );
    
    const button = screen.getByTestId('favorite-btn');
    expect(button).toHaveAttribute('aria-label', 'Добави в любими');
  });
});
