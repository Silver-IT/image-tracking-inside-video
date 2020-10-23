import {CssTheme} from '@common/core/types/models/CssTheme';

export const DEFAULT_LIGHT_COLORS = {
    '--be-primary-lighter': '#3e4a66',
    '--be-primary-default': '#2B3346',
    '--be-primary-darker': '#181c26',
    '--be-accent-default': '#1565C0',
    '--be-accent-lighter': '#B9D1EC',
    '--be-accent-contrast': 'rgba(255, 255, 255, 1)',
    '--be-accent-emphasis': 'rgba(185, 209, 236, 0.1)',
    '--be-background': 'rgb(255, 255, 255)',
    '--be-background-alternative': 'rgb(250, 250, 250)',
    '--be-foreground-base': 'black',
    '--be-text': 'rgba(0, 0, 0, 0.87)',
    '--be-hint-text': 'rgba(0, 0, 0, 0.38)',
    '--be-secondary-text': 'rgba(0, 0, 0, 0.54)',
    '--be-label': 'rgba(0, 0, 0, 0.87)',
    '--be-disabled-button-text': 'rgba(0, 0, 0, 0.26)',
    '--be-divider-lighter': 'rgba(0, 0, 0, 0.07)',
    '--be-divider-default': 'rgba(0, 0, 0, 0.12)',
    '--be-hover': 'rgba(0,0,0,0.04)',
    '--be-selected-button': 'rgb(224, 224, 224)',
    '--be-chip': '#e0e0e0',
    '--be-link': '#3f51b5',
    '--be-backdrop': 'black',
    '--be-raised-button': '#fff',
    '--be-disabled-toggle': 'rgb(238, 238, 238)',
    '--be-disabled-button': 'rgba(0, 0, 0, 0.12)',
};

export const DEFAULT_DARK_COLORS = {
    '--be-primary-lighter': '#2a2a2a',
    '--be-primary-default': '#262626',
    '--be-primary-darker': '#181c26',
    '--be-accent-default': '#8AB2E0',
    '--be-accent-lighter': '#B9D1EC',
    '--be-accent-contrast': 'rgba(255, 255, 255, 1)',
    '--be-accent-emphasis': 'rgba(185, 209, 236, 0.1)',
    '--be-foreground-base': '#fff',
    '--be-text': '#fff',
    '--be-hint-text': 'rgba(255, 255, 255, 0.5)',
    '--be-secondary-text': 'rgba(255, 255, 255, 0.7)',
    '--be-label': 'rgba(255, 255, 255, 0.7)',
    '--be-background': '#1D1D1D',
    '--be-background-alternative': '#121212',
    '--be-divider-lighter': 'rgba(255, 255, 255, 0.07)',
    '--be-divider-default': 'rgba(255, 255, 255, 0.12)',
    '--be-disabled-button-text': 'rgba(255, 255, 255, 0.3)',
    '--be-disabled-toggle': '#000',
    '--be-chip': '#616161',
    '--be-hover': 'rgba(255, 255, 255, 0.04)',
    '--be-selected-button': '#212121',
    '--be-disabled-button': 'rgba(255, 255, 255, 0.12)',
    '--be-raised-button': '#424242',
    '--be-backdrop': '#BDBDBD',
    '--be-link': '#c5cae9',
};

export const DEFAULT_THEMES: {[key: string]: CssTheme} = {
    light: {
        name: 'light',
        colors: DEFAULT_LIGHT_COLORS,
    },
    dark: {
        name: 'dark',
        is_dark: true,
        colors: DEFAULT_DARK_COLORS,
    },
    blue: {
        name: 'blue',
        colors: {
            ...DEFAULT_LIGHT_COLORS,
            '--be-primary-default': '#0069c0',
            '--be-primary-lighter': '#2196f3',
            '--be-accent-default': '#009688',
            '--be-accent-lighter': '#52c7b8',
        }
    },
    orange: {
        name: 'orange',
        colors: {
            ...DEFAULT_LIGHT_COLORS,
            '--be-primary-default': '#e53935',
            '--be-primary-lighter': '#ff6f60',
            '--be-accent-default': '#e53935',
            '--be-accent-lighter': '#ff6f60',
        }
    },
};
