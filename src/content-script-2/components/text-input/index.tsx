import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';

import styles from './text-input.module.scss';

interface Props {
  className?: string;
  value: string;
  onChange: (value: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const TextInput = BEM(styles)((props: Props) => <input type="text" {...props} />);
