import React, { useCallback } from 'react';

import TokenEditDialog from '~core/TokenEditDialog';
import {
  useSetColonyTokensMutation,
  useColonyTokensQuery,
  ColonyTokensDocument,
  ColonyTokensQueryVariables,
} from '~data/index';
import { Address } from '~types/index';

import { tokenIsETH } from '../../../core/checks';

interface Props {
  colonyAddress: Address;
  cancel: () => void;
  close: () => void;
}

const displayName = 'dashboard.ColonyTokenEditDialog';

const ColonyTokenEditDialog = ({ colonyAddress, cancel, close }: Props) => {
  const [setColonyTokensMutation] = useSetColonyTokensMutation({
    refetchQueries: [
      {
        query: ColonyTokensDocument,
        variables: { address: colonyAddress } as ColonyTokensQueryVariables,
      },
    ],
  });

  const { data } = useColonyTokensQuery({
    variables: { address: colonyAddress },
  });

  const colonyTokens = (data && data.colony.tokens) || [];

  const addToken = useCallback(
    (newTokenAddress: Address) => {
      const newAddresses = [
        ...colonyTokens
          .filter((token) => !tokenIsETH(token))
          .map(({ address }) => address),
        newTokenAddress,
      ];
      return setColonyTokensMutation({
        variables: { input: { colonyAddress, tokenAddresses: newAddresses } },
      });
    },
    [colonyAddress, colonyTokens, setColonyTokensMutation],
  );

  return (
    <TokenEditDialog
      cancel={cancel}
      close={close}
      tokens={colonyTokens}
      addTokenFn={addToken}
    />
  );
};

ColonyTokenEditDialog.displayName = displayName;

export default ColonyTokenEditDialog;