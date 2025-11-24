import { useTheme } from '../hooks/useTheme';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ContrastIcon from '@mui/icons-material/Contrast';
import type { ThemeMode } from '../constants/themes';
import type { ReactElement } from 'react';

const Settings = () => {
  const { mode, setTheme, colors } = useTheme();

  const themeOptions: Array<{ value: ThemeMode; label: string; icon: ReactElement; description: string }> = [
    {
      value: 'light',
      label: 'Light',
      icon: <LightModeIcon />,
      description: 'Clean, bright interface for daytime use',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <DarkModeIcon />,
      description: 'Easy on the eyes in low-light environments',
    },
    {
      value: 'high-contrast',
      label: 'High Contrast',
      icon: <ContrastIcon />,
      description: 'Maximum visibility and accessibility (WCAG AAA)',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background.primary,
        color: colors.text.primary,
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: colors.text.primary,
          }}
        >
          Settings
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: colors.text.secondary,
            marginBottom: '2rem',
          }}
        >
          Customize your experience
        </p>

        {/* Theme Section */}
        <div
          style={{
            backgroundColor: colors.background.elevated,
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: `1px solid ${colors.border.primary}`,
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: colors.text.primary,
            }}
          >
            Appearance
          </h2>
          <p
            style={{
              fontSize: '0.875rem',
              color: colors.text.secondary,
              marginBottom: '1.5rem',
            }}
          >
            Select your preferred theme. Your choice will be saved and applied across all pages.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {themeOptions.map((option) => {
              const isSelected = mode === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    backgroundColor: isSelected
                      ? colors.brand.primary
                      : colors.background.secondary,
                    border: `2px solid ${
                      isSelected ? colors.brand.primary : colors.border.primary
                    }`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = colors.interactive.hover;
                      e.currentTarget.style.borderColor = colors.border.secondary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = colors.background.secondary;
                      e.currentTarget.style.borderColor = colors.border.primary;
                    }
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = `3px solid ${colors.border.focus}`;
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                  aria-pressed={isSelected}
                  aria-label={`Select ${option.label} theme: ${option.description}`}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '0.5rem',
                      backgroundColor: isSelected
                        ? 'rgba(255, 255, 255, 0.2)'
                        : colors.background.tertiary,
                      marginRight: '1rem',
                      color: isSelected ? colors.text.inverse : colors.text.primary,
                    }}
                  >
                    {option.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: isSelected ? colors.text.inverse : colors.text.primary,
                        marginBottom: '0.25rem',
                      }}
                    >
                      {option.label}
                      {isSelected && (
                        <span
                          style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 'normal',
                            opacity: 0.9,
                          }}
                        >
                          (Active)
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: isSelected
                          ? 'rgba(255, 255, 255, 0.8)'
                          : colors.text.secondary,
                      }}
                    >
                      {option.description}
                    </div>
                  </div>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${
                        isSelected ? colors.text.inverse : colors.border.secondary
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected
                        ? colors.text.inverse
                        : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: colors.brand.primary,
                        }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accessibility Info */}
        <div
          style={{
            backgroundColor: colors.semantic.infoBg,
            border: `1px solid ${colors.semantic.info}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              marginRight: '0.75rem',
              color: colors.semantic.info,
              marginTop: '0.125rem',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p
              style={{
                fontSize: '0.875rem',
                color: colors.text.primary,
                margin: 0,
              }}
            >
              <strong>Accessibility:</strong> All themes meet WCAG standards. Light and Dark
              modes meet AA compliance (4.5:1 contrast). High Contrast mode meets AAA
              compliance (7:1 contrast) for users with visual impairments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
