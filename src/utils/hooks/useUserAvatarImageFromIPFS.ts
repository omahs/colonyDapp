import { useDataFetcher } from '~utils/hooks';
import { IPFSAvatarImage } from '~types/index';

import { ipfsDataFetcher } from '../../modules/core/fetchers';

const useUserAvatarImageFromIPFS = (ipfsHash: string): IPFSAvatarImage => {
  let avatarObject: IPFSAvatarImage = { image: undefined };
  const { data: avatar } = useDataFetcher(
    ipfsDataFetcher,
    [ipfsHash],
    [ipfsHash],
  );
  try {
    avatarObject = JSON.parse(avatar);
  } catch (error) {
    /*
     * @NOTE Silent error
     * Most users won't have an avatar, so this will get triggered quite a lot
     * and that's ok, it's expected
     */
  }
  return avatarObject;
};

export default useUserAvatarImageFromIPFS;
