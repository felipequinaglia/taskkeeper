import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    'box-'?:       string;
    'is-'?:        string;
    'variant-'?:   string;
    'size-'?:      string;
    'direction-'?: string;
    'cap-'?:       string;
    'shear-'?:     string;
    'speed-'?:     string;
    'marker-'?:    string;
  }
}
