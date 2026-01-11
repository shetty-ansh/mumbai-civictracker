
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/custom-toast";

export const showToast = (
    type: "success" | "error" | "processing" | "warning" | "confirm" | "confirmDelete",
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void
) => {
    return toast.custom(
        (toastId) => (
            <CustomToast
                type={type}
                title={title}
                message={message}
                onConfirm={() => {
                    toast.dismiss(toastId);
                    onConfirm?.();
                }}
                onCancel={() => {
                    toast.dismiss(toastId);
                    onCancel?.();
                }}
            />
        ),
        {
            duration: type === "confirm" || type === "confirmDelete" || type === "processing" ? Infinity : 3000,
        }
    );
};
