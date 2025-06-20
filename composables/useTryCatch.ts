
type ToastInfo = {
  title: string;
  description: string;
  variant: "success" | "destructive" | "warning" | "info" | "default";
};
export const useTryCatch = (toastInfo?: ToastInfo | undefined) => {

  const tryCatch = async (fn: () => Promise<any>) => {
    const response = null as Response | null;
    try {
      await fn();
      !toastInfo?.title
       
    } catch (error: any) {
    

      console.error(error);
    }
  };

  return { tryCatch };
};
