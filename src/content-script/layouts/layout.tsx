import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import Draggable, { DraggableEventHandler } from 'react-draggable';

import styles from './layout.module.scss';

interface Props {
  className?: string;
  children?: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  position?: { x: number; y: number };
  onPositionChange: DraggableEventHandler;
}

const layout = BEM(styles);

export const Layout = layout(({
  className, sidebar, children, header, position, onPositionChange,
}: Props) => (
  <Draggable
    bounds="body"
    handle=".drag-wrapper"
    onStop={onPositionChange}
    position={position}
  >
    <div className={className}>
      <Header>
        {header}
      </Header>
      <ContentWrapper>
        <Sidebar>
          {sidebar}
        </Sidebar>
        {Boolean(children) && (
          <Content>
            {children}
          </Content>
        )}
      </ContentWrapper>
    </div>
  </Draggable>
));

const Header = layout.header('div');
const Sidebar = layout.sidebar('div');
const ContentWrapper = layout.contentWrapper('div');
const Content = layout.content('div');
