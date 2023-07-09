/* eslint-disable prettier/prettier */
export const toastShow = (toast, title, status = 'error', duration) => {
  return toast.show({
    title,
    status,
    duration: duration ? duration : 3000,
    isClosable: true,
  });
};
