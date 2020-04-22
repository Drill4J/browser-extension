import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { Input } from '../input';
import styles from './toggler.module.scss';

interface Attrs {
  className?: string;
  label?: React.ReactNode;
  value?: string | boolean;
  disabled?: boolean;
  size?: 'small';
  onChange?: () => void;
}

const checkbox = BEM(styles);

export const Toggler = checkbox(({
  className, label, value, onChange = () => {},
}: Attrs) => (
  <span className={className}>
    <>
      <CheckboxInput type="checkbox" checked={Boolean(value)} value={String(value)} onChange={onChange} />
      <CheckboxTogglerLabel />
    </>
    {label && <Label checked={Boolean(value)}>{label}</Label>}
  </span>
));

const CheckboxInput = checkbox.input(Input);
const CheckboxTogglerLabel = checkbox.slider('span');
const Label = checkbox.label('div');
