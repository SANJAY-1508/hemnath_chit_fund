import { toast } from "react-toastify";

const NotifyData = (message, type) => {
  switch (type) {
    case "success":
      toast.success(message, { position: "top-right" });
      break;
    case "error":
      toast.error(message, { position: "top-right" });
      break;
    case "warn":
      toast.warn(message, { position: "top-right" });
      break;
    case "info":
      toast.info(message, { position: "top-right" });
      break;
    default:
      toast(message, { position: "top-right", className: "foo-bar" });
      break;
  }
};

export default NotifyData;
