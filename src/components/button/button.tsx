import { BEM, button } from '@redneckz/react-bem-helper';

// @ts-ignore
import styles from './button.module.scss';

export const Button = BEM(styles)(
  button({
    type: 'primary',
    disabled: false,
  } as { type: 'primary' | 'secondary'; disabled?: boolean }),
);
