import { Resolvers } from '@apollo/client';
import {
  Paginate,
  Documents,
  Collection,
  Lambda,
  Get,
  Var,
  Map,
  Match,
  Index,
  Create,
} from 'faunadb';

import { Context } from '~context/index';
import {
  LoggedInUserQuery,
  LoggedInUserQueryVariables,
  LoggedInUserDocument,
} from '../index';

enum Collections {
  Users = 'users',
}

enum Indexes {
  UsersByUsername = 'users_by_username',
  UsersByAddress = 'users_by_walletAddress',
}

const baseUserProfile = {
  __typename: 'UserProfile',
  username: null,
  walletAddress: null,
  displayName: null,
  avatarHash: null,
};

export const faunaResolvers = ({
  faunaClient,
  apolloClient,
}: Required<Context>): Resolvers => ({
  Query: {
    async faunaTopUsers(_, { limit }) {
      const { data }: { data: Record<string, any> } = await faunaClient.query(
        Map(
          Paginate(Documents(Collection(Collections.Users)), { size: limit }),
          Lambda('userRef', Get(Var('userRef'))),
        ),
      );
      return data.map(({ data: refData }) => ({
        __typename: 'User',
        id: refData.walletAddress,
        profile: {
          ...baseUserProfile,
          ...refData,
        },
      }));
    },
    async faunaUserByName(_, { username }) {
      const { data }: { data: Record<string, any> } = await faunaClient.query(
        Get(Match(Index(Indexes.UsersByUsername), username)),
      );
      return {
        __typename: 'User',
        id: data.walletAddress,
        profile: {
          ...baseUserProfile,
          ...data,
        },
      };
    },
    async faunaUserByAddress(_, { address }) {
      const { data }: { data: Record<string, any> } = await faunaClient.query(
        Get(Match(Index(Indexes.UsersByAddress), address)),
      );
      return {
        __typename: 'User',
        id: data.walletAddress,
        profile: {
          ...baseUserProfile,
          ...data,
        },
      };
    },
  },
  Mutation: {
    async faunaCreateUser(_, { input }) {
      const { data: apolloData } = await apolloClient.query<
        LoggedInUserQuery,
        LoggedInUserQueryVariables
      >({
        query: LoggedInUserDocument,
      });
      const { data }: { data: Record<string, any> } = await faunaClient.query(
        Create(Collection(Collections.Users), {
          data: {
            ...input,
            walletAddress: apolloData?.loggedInUser?.walletAddress,
          },
        }),
      );
      return {
        __typename: 'User',
        id: data.walletAddress,
        profile: {
          ...baseUserProfile,
          ...data,
        },
      };
    },
  },
});
