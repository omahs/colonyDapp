import React, { useEffect, useMemo, useState, ReactElement } from 'react';

import Popover, { PopoverChildFn } from '~core/Popover';
import { usePrevious } from '~utils/hooks';

import { removeValueUnits } from '~utils/css';

import {
  TransactionOrMessageGroups,
  transactionCount,
} from './transactionGroup';

import GasStationContent from './GasStationContent';

import {
  refWidth,
  horizontalOffset,
  verticalOffset,
} from './GasStationPopover.css';

interface Props {
  transactionAndMessageGroups: TransactionOrMessageGroups;
  children: ReactElement | PopoverChildFn;
}

const GasStationPopover = ({
  children,
  transactionAndMessageGroups,
}: Props) => {
  const [isOpen, setOpen] = useState(false);
  const [txNeedsSigning, setTxNeedsSigning] = useState(false);
  const txCount = useMemo(() => transactionCount(transactionAndMessageGroups), [
    transactionAndMessageGroups,
  ]);
  const prevTxCount: number | void = usePrevious(txCount);

  useEffect(() => {
    if (prevTxCount != null && txCount > prevTxCount) {
      setOpen(true);
      setTxNeedsSigning(true);
    }
  }, [txCount, prevTxCount, setTxNeedsSigning]);

  /*
   * @NOTE Offset Calculations
   * See: https://popper.js.org/docs/v2/modifiers/offset/
   *
   * Skidding:
   * Half the width of the reference element (width) plus the horizontal offset
   * Note that all skidding, for bottom aligned elements, needs to be negative.
   *
   * Distace:
   * This is just the required offset in pixels. Since we are aligned at
   * the bottom of the screen, this will be added to the bottom of the
   * reference element.
   */
  const popoverOffset = useMemo(() => {
    const skid =
      removeValueUnits(refWidth) / 2 + removeValueUnits(horizontalOffset);
    return [-1 * skid, removeValueUnits(verticalOffset)];
  }, []);

  return (
    <Popover
      appearance={{ theme: 'grey' }}
      content={({ close }) => (
        <GasStationContent
          transactionAndMessageGroups={transactionAndMessageGroups}
          autoOpenTransaction={txNeedsSigning}
          setAutoOpenTransaction={setTxNeedsSigning}
          close={close}
        />
      )}
      placement="bottom"
      showArrow={false}
      isOpen={isOpen}
      closeDelay={4000}
      onClose={() => {
        setOpen(false);
        setTxNeedsSigning(false);
      }}
      popperOptions={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: popoverOffset,
            },
          },
        ],
      }}
    >
      {children}
    </Popover>
  );
};

GasStationPopover.displayName = 'users.GasStation.GasStationPopover';

export default GasStationPopover;
