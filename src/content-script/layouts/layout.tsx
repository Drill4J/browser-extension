import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import { browser } from 'webextension-polyfill-ts';

import { useDispatcher } from '../hooks';
import { savePosition } from '../reducer';

import styles from './layout.module.scss';

interface Props {
  className?: string;
  children?: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  position?: { x: number; y: number };
}

const layout = BEM(styles);

export const Layout = layout(({
  className, sidebar, children, header, position,
}: Props) => {
  const dispatcher = useDispatcher();
  const handleStop: DraggableEventHandler = (e, { x, y }) => {
    browser.storage.local.set({ position: { x, y } });
    dispatcher(savePosition({ x, y }));
  };

  return (
    <Draggable
      bounds="body"
      handle=".drag-wrapper"
      onStop={handleStop}
      position={position}
    >
      <div className={className}>
        <div className="drag-wrapper">
          <Header>
            {header}
          </Header>
        </div>
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
  );
});

const Header = layout.header('div');
const Sidebar = layout.sidebar('div');
const ContentWrapper = layout.contentWrapper('div');
const Content = layout.content('div');
