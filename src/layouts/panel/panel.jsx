import { BEM, div } from '@redneckz/react-bem-helper';
import styles from './panel.module.scss';

const panel = BEM(styles);

export const Panel = panel(div({ style: undefined, onClick: () => {} }));
export const PanelItem = panel.item(div({ onClick: () => {} }));
export const PanelSpread = panel.spread(div());
