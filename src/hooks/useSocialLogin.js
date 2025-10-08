import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const useSocialLogin = () => {
  const handleSocialLogin = useCallback((provider) => {
    try {

      toast.info(`${provider} login not implemented yet`);
    } catch (error) {
      console.error(`Error with ${provider} login:`, error);

      console.log(`${provider} login not implemented yet`);
    }
  }, []);

  return { handleSocialLogin };
};
