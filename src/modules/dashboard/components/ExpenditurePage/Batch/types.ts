import { ProcessedTokenBalances, ProcessedTokens } from '~data/generated';

export interface Batch {
  dataCSVUploader?: {
    parsedData: BatchDataItem[];
    file?: File;
    uploaded?: boolean;
  }[];
  data?: BatchDataItem[];
  recipients?: number;
  value?: {
    token?: string;
    value?: number;
  };
  tokens?: (
    | {
        amount: unknown;
        token: Pick<
          ProcessedTokens,
          'symbol' | 'id' | 'address' | 'iconHash' | 'decimals' | 'name'
        > & {
          processedBalances: Pick<
            ProcessedTokenBalances,
            'domainId' | 'amount'
          >[];
        };
      }
    | undefined
  )[];
}

export interface BatchDataItem {
  recipient: string;
  token: string;
  amount: string;
}
