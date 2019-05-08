/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { Input } from '../input';
import styles from './toggler.module.scss';

const checkbox = BEM(styles);

export const Toggler = checkbox(({ className, label, value, onChange = () => {} }) => (
  <label className={className}>
    <React.Fragment>
      <CheckboxInput type="checkbox" checked={Boolean(value)} value={value} onChange={onChange} />
      <CheckboxTogglerLabel />
    </React.Fragment>
    {label && <Label checked={Boolean(value)}>{label}</Label>}
  </label>
));

const CheckboxInput = checkbox.input(Input);
const CheckboxTogglerLabel = checkbox.slider('span');
const Label = checkbox.label('div');
