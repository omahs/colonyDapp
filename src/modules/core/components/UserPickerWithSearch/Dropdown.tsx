import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as ReactDOM from 'react-dom';
import classNames from 'classnames';

import styles from './Dropdown.css';

const displayName = 'UserPickerWithSearch.Dropdown';

interface Props {
  element: HTMLDivElement | null;
  scrollContainer?: Window | HTMLElement | null;
  placement?: 'right' | 'bottom' | 'exact'; // 'exact' - portal will appear in the same place element would. Allowing dropdowns with full width to appear in dialogs
  optionSizeLarge?: boolean;
  children: React.ReactNode;
}

const Dropdown = React.forwardRef(
  (
    {
      element,
      scrollContainer = window,
      placement = 'right',
      optionSizeLarge,
      children,
    }: Props,
    ref: RefObject<HTMLDivElement>,
  ) => {
    const [posTop, setPosTop] = useState<number | undefined>();
    const [width, setWidth] = useState(332);

    useEffect(() => {
      if (!element) {
        return;
      }
      if (placement !== 'exact') {
        return;
      }
      const rect = element.getBoundingClientRect();
      setWidth(rect.width);
    }, [element, placement]);

    const left = useMemo(() => {
      const { left: elemLeft, width: elemWidth } =
        element?.getBoundingClientRect() || {};
      if (['bottom', 'exact'].includes(placement)) {
        return elemLeft || 0;
      }
      return (elemLeft || 0) + (elemWidth || 0);
    }, [element, placement]);

    const onScroll = useCallback(() => {
      const elementDimentions = element?.getBoundingClientRect();
      if (!elementDimentions) {
        setPosTop(0);
        return;
      }
      const topPosition =
        placement === 'bottom'
          ? elementDimentions.top + elementDimentions.height
          : elementDimentions.top;

      setPosTop(topPosition);
    }, [element, placement]);

    useEffect(() => {
      onScroll();

      scrollContainer?.addEventListener('scroll', onScroll, {
        passive: true,
      });

      return () => scrollContainer?.removeEventListener('scroll', onScroll);
    }, [onScroll, scrollContainer]);

    return element
      ? ReactDOM.createPortal(
          <div
            className={classNames(styles.dropdown, {
              [styles.optionSizeLarge]: optionSizeLarge,
            })}
            style={{
              top: posTop,
              left,
              width,
            }}
            ref={ref}
          >
            {children}
          </div>,
          document.body,
        )
      : null;
  },
);

Dropdown.displayName = displayName;

export default Dropdown;
