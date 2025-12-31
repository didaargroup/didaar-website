import { isButtonAction } from "@/contexts/admin-layout-context";
import { Button } from "../ui/button";
import { useEffect } from "react";


export default function HeaderActionItem({ action }: { action: HeaderAction }) {
  const actionType = useMemo(() => {
    if (typeof action !== "object" && action !== null) {
      return null;
    }

    if ("options" in action) {
      return "dropdown";
    } else if ("href" in action) {
      return "link";
    } else if ("onClick" in action) {
      return "button";
    }

    return null;
  }, [action]);

    // Default actions
  useEffect(() => {
    setActions([
      {
        label: "Logout",
        icon: <LogOut className="w-3.5 h-3.5" />,
        onClick: logout,
      },
    ]);
  }, [setActions]);

  if (isButtonAction(action)) {
    return (
      <Button
                  variant="secondary"
                  onClick={logout}
                >
                  <LogOut size={14} />
                  Logout
                </Button>
    );
  }
}
