import { useEffect } from "react";

export default function DocumentTitle({ title = "Event Management System" }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}
